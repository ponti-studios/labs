import "dotenv/config";
import { parseArgs } from "node:util";

import { closeDb } from "@pontistudios/db";

import { addDaysToDateKey, buildDateRange, getDateKey } from "../app/lib/realitea/date";
import { getErrorMessage } from "../app/lib/errors";
import {
  countInventoryForRange,
  deletePuzzlesFromDate,
  getExistingDateKeys,
  getGameBySlug,
} from "../app/lib/realitea/repository";
import { generatePuzzleForGame } from "../app/lib/realitea/generation";
import { createLogger } from "../app/lib/logger.server";
import { REALITEA_READY_INVENTORY_DAYS } from "../app/lib/realitea/validation";
import { LabyrinthServerEnv } from "../app/lib/server/env";

const logger = createLogger();
const RHOBH_GAME_SLUG = "rhobh";

export function computeGaps(dateRange: string[], existingKeys: string[]): string[] {
  const existing = new Set(existingKeys);
  return dateRange.filter((d) => !existing.has(d));
}

function parseReconcileArgs(): { force: boolean; daysAhead: number } {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      force: { type: "boolean" },
      "days-ahead": { type: "string" },
    },
    strict: true,
  });
  return {
    force: values.force ?? false,
    daysAhead: values["days-ahead"]
      ? parseInt(values["days-ahead"], 10)
      : REALITEA_READY_INVENTORY_DAYS,
  };
}

async function main() {
  LabyrinthServerEnv.parse(process.env);

  const { force, daysAhead } = parseReconcileArgs();
  const runDateKey = getDateKey(new Date());
  const reconcileLogger = logger.child({ operation: "reconcile", runDateKey, force });

  reconcileLogger.info({ event: "[RECONCILE_START]" }, "starting reconcile run");

  const game = await getGameBySlug(RHOBH_GAME_SLUG);
  if (!game) throw new Error(`Game not found: ${RHOBH_GAME_SLUG}`);

  const nextDayKey = addDaysToDateKey(runDateKey, 1);
  if (!nextDayKey) throw new Error("Failed to compute next date key");

  let deletedCount = 0;
  const targetDateKeys = buildDateRange(nextDayKey, { daysAhead });
  const lastDayKey = targetDateKeys[targetDateKeys.length - 1];

  if (force) {
    deletedCount = await deletePuzzlesFromDate(game.id, nextDayKey);
    reconcileLogger.info(
      { event: "[FORCE_DELETED]", count: deletedCount },
      `deleted ${deletedCount} puzzles`,
    );
  }

  const existingKeys = force ? [] : await getExistingDateKeys(game.id, nextDayKey, lastDayKey);
  const gapDateKeys = computeGaps(targetDateKeys, existingKeys);

  let generatedCount = 0;
  let failedCount = 0;

  for (const dateKey of gapDateKeys) {
    try {
      const created = await generatePuzzleForGame(game, dateKey);
      if (created) {
        generatedCount++;
      } else {
        failedCount++;
        reconcileLogger.error(
          { event: "[GENERATION_FAILED]", dateKey },
          "generation returned null",
        );
      }
    } catch (err) {
      failedCount++;
      reconcileLogger.error(
        { event: "[GENERATION_ERROR]", dateKey, error: getErrorMessage(err) },
        `error generating puzzle for ${dateKey}`,
      );
    }
  }

  const inventoryDepth = await countInventoryForRange(
    game.id,
    runDateKey,
    REALITEA_READY_INVENTORY_DAYS,
  );

  reconcileLogger.info(
    {
      event: "[RECONCILE_COMPLETE]",
      force,
      deleted: deletedCount,
      generated: generatedCount,
      failed: failedCount,
      inventoryDepth,
    },
    `reconcile complete: ${generatedCount}/${gapDateKeys.length} generated`,
  );

  if (failedCount > 0) {
    throw new Error(`${failedCount} puzzle(s) failed to generate`);
  }
}

if (!process.env.VITEST) {
  try {
    await main();
  } catch (err) {
    logger.error(
      { event: "[RECONCILE_FAILED]", error: getErrorMessage(err) },
      "reconcile run failed",
    );
    process.exit(1);
  } finally {
    closeDb();
  }
}
