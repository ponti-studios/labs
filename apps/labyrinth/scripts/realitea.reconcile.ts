import "dotenv/config";

import { addDaysToDateKey, buildDateRange, getDateKey } from "../app/lib/realitea-date";
import {
  countInventoryForRange,
  deletePuzzlesFromDate,
  getExistingDateKeys,
} from "../app/lib/realitea-db";
import { generateScheduledPuzzle } from "../app/lib/realitea-generation";
import { createScriptLogger, withDbCleanup } from "../app/lib/realitea-scripts";
import { REALITEA_READY_INVENTORY_DAYS } from "../app/lib/realitea-validation";
import { LabyrinthServerEnv } from "../app/lib/server/env";

const logger = createScriptLogger();

export function computeGaps(dateRange: string[], existingKeys: string[]): string[] {
  const existing = new Set(existingKeys);
  return dateRange.filter((d) => !existing.has(d));
}

function parseArgs(): { force: boolean; daysAhead: number } {
  const args = process.argv.slice(2);
  let force = false;
  let daysAhead = REALITEA_READY_INVENTORY_DAYS;
  for (const arg of args) {
    if (arg === "--force") force = true;
    else if (arg.startsWith("--days-ahead=")) daysAhead = parseInt(arg.slice("--days-ahead=".length), 10);
  }
  return { force, daysAhead };
}

async function main() {
  LabyrinthServerEnv.parse(process.env);

  const { force, daysAhead } = parseArgs();
  const runDateKey = getDateKey(new Date());
  const reconcileLogger = logger.child({ operation: "reconcile", runDateKey, force });

  reconcileLogger.info({ event: "[RECONCILE_START]" }, "starting reconcile run");

  const nextDayKey = addDaysToDateKey(runDateKey, 1);
  if (!nextDayKey) throw new Error("Failed to compute next date key");

  let deletedCount = 0;
  const targetDateKeys = buildDateRange(nextDayKey, { daysAhead });
  const lastDayKey = targetDateKeys[targetDateKeys.length - 1];

  if (force) {
    deletedCount = await deletePuzzlesFromDate(nextDayKey);
    reconcileLogger.info({ event: "[FORCE_DELETED]", count: deletedCount }, `deleted ${deletedCount} puzzles`);
  }

  const existingKeys = force ? [] : await getExistingDateKeys(nextDayKey, lastDayKey);
  const gapDateKeys = computeGaps(targetDateKeys, existingKeys);

  let generatedCount = 0;
  let failedCount = 0;

  for (const dateKey of gapDateKeys) {
    try {
      const created = await generateScheduledPuzzle(dateKey);
      if (created) {
        generatedCount++;
      } else {
        failedCount++;
        reconcileLogger.error({ event: "[GENERATION_FAILED]", dateKey }, "generation returned null");
      }
    } catch (err) {
      failedCount++;
      reconcileLogger.error(
        { event: "[GENERATION_ERROR]", dateKey, error: err instanceof Error ? err.message : String(err) },
        `error generating puzzle for ${dateKey}`,
      );
    }
  }

  const inventoryDepth = await countInventoryForRange(runDateKey, REALITEA_READY_INVENTORY_DAYS);

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
  await withDbCleanup(main).catch((err) => {
    logger.error(
      { event: "[RECONCILE_FAILED]", error: err instanceof Error ? err.message : String(err) },
      "reconcile run failed",
    );
    process.exit(1);
  });
}
