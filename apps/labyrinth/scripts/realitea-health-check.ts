import "dotenv/config";

import { closeDb } from "@pontistudios/db";

import { getDateKey } from "../app/lib/realitea/date";
import { getErrorMessage } from "../app/lib/errors";
import {
  countInventoryForRange,
  getGameBySlug,
  loadPuzzleForDate,
} from "../app/lib/realitea/repository";
import { createLogger } from "../app/lib/logger.server";
import { REALITEA_READY_INVENTORY_DAYS } from "../app/lib/realitea/validation";

const logger = createLogger();
const RHOBH_GAME_SLUG = "rhobh";

export type HealthStatus = "OK" | "DEGRADED";

export interface HealthResult {
  status: HealthStatus;
  issues: string[];
}

export function computeHealthStatus(
  inventoryDepth: number,
  hasTodayPuzzle: boolean,
  hasAnyPuzzle: boolean,
): HealthResult {
  const issues: string[] = [];

  if (!hasAnyPuzzle) {
    issues.push("no puzzles in database");
  }
  if (!hasTodayPuzzle) {
    issues.push("no puzzle for today");
  }
  if (inventoryDepth < 1) {
    issues.push("no puzzles scheduled for upcoming days");
  } else if (inventoryDepth < REALITEA_READY_INVENTORY_DAYS) {
    issues.push(`low inventory: ${inventoryDepth}/${REALITEA_READY_INVENTORY_DAYS} days covered`);
  }

  return { status: issues.length === 0 ? "OK" : "DEGRADED", issues };
}

async function main() {
  const now = new Date();
  const dateKey = getDateKey(now);
  const healthLogger = logger.child({
    operation: "healthCheck",
    dateKey,
    timestamp: now.toISOString(),
  });

  const game = await getGameBySlug(RHOBH_GAME_SLUG);
  if (!game) throw new Error(`Game not found: ${RHOBH_GAME_SLUG}`);

  const [todaysPuzzle, inventoryDepth] = await Promise.all([
    loadPuzzleForDate(game.id, dateKey),
    countInventoryForRange(game.id, dateKey, REALITEA_READY_INVENTORY_DAYS),
  ]);

  // "any puzzle exists" is approximated by checking today + recent inventory;
  // true existence check only needed if inventory is also zero
  const hasAnyPuzzle = !!todaysPuzzle || inventoryDepth > 0;

  const result = computeHealthStatus(inventoryDepth, !!todaysPuzzle, hasAnyPuzzle);

  if (result.issues.length > 0) {
    for (const issue of result.issues) {
      healthLogger.warn({ event: "[HEALTH_ISSUE]" }, issue);
    }
  }

  healthLogger.info(
    {
      event: "[HEALTH_CHECK_COMPLETE]",
      status: result.status,
      hasTodaysPuzzle: !!todaysPuzzle,
      inventoryDepth,
    },
    `health check: ${result.status}`,
  );

  if (result.status !== "OK") process.exit(1);
}

if (!process.env.VITEST) {
  try {
    await main();
  } catch (err) {
    logger.error(
      { event: "[HEALTH_CHECK_FAILED]", error: getErrorMessage(err) },
      "health check failed",
    );
    process.exit(1);
  } finally {
    closeDb();
  }
}
