import "dotenv/config";

import { closeDb } from "~/lib/server/db";

import { getDateKey } from "../app/lib/realitea/core/date";
import { getErrorMessage } from "../app/lib/errors";
import { getActiveGames } from "../app/lib/realitea/server/games.server";
import { countInventoryForRange, loadPuzzleForDate } from "../app/lib/realitea/server/puzzles.server";
import { createLogger } from "../app/lib/logger.server";
import { REALITEA_READY_INVENTORY_DAYS } from "../app/lib/realitea/generation/candidate-validation";
import { LabyrinthServerEnv } from "../app/lib/server/env";

const logger = createLogger();

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
  LabyrinthServerEnv.parse(process.env);

  const now = new Date();
  const dateKey = getDateKey(now);
  const healthLogger = logger.child({
    operation: "healthCheck",
    dateKey,
    timestamp: now.toISOString(),
  });

  const games = await getActiveGames();
  if (games.length === 0) throw new Error("No active RealiTea games found");
  let degraded = false;
  for (const game of games) {
    const [todaysPuzzle, inventoryDepth] = await Promise.all([
      loadPuzzleForDate(game.id, dateKey),
      countInventoryForRange(game.id, dateKey, REALITEA_READY_INVENTORY_DAYS),
    ]);
    const result = computeHealthStatus(inventoryDepth, !!todaysPuzzle, !!todaysPuzzle || inventoryDepth > 0);
    if (result.status !== "OK") degraded = true;
    for (const issue of result.issues) {
      healthLogger.warn({ event: "[HEALTH_ISSUE]", game: game.slug }, issue);
    }
    healthLogger.info(
      { event: "[HEALTH_GAME_COMPLETE]", game: game.slug, status: result.status, hasTodaysPuzzle: !!todaysPuzzle, inventoryDepth },
      `${game.slug} health: ${result.status}`,
    );
  }
  if (degraded) process.exit(1);
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
