import "dotenv/config";
import { parseArgs } from "node:util";

import { closeDb } from "~/lib/server/db";

import { addDaysToDateKey, buildDateRange, getDateKey } from "../app/lib/realitea/date";
import { getErrorMessage } from "../app/lib/errors";
import {
  countInventoryForRange,
  deletePuzzlesFromDate,
  getActiveGames,
  getExistingDateKeys,
} from "../app/lib/realitea/repository";
import { generatePuzzleForGame } from "../app/lib/realitea/generation";
import { createLogger } from "../app/lib/logger.server";
import { REALITEA_READY_INVENTORY_DAYS } from "../app/lib/realitea/validation";
import { LabyrinthServerEnv } from "../app/lib/server/env";

const logger = createLogger();

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

  const games = await getActiveGames();
  if (games.length === 0) throw new Error("No active RealiTea games found");

  const nextDayKey = addDaysToDateKey(runDateKey, 1);
  if (!nextDayKey) throw new Error("Failed to compute next date key");

  let totalDeleted = 0;
  let totalGenerated = 0;
  let totalFailed = 0;
  for (const game of games) {
    const targetDateKeys = buildDateRange(nextDayKey, { daysAhead });
    const lastDayKey = targetDateKeys[targetDateKeys.length - 1];
    const deletedCount = force ? await deletePuzzlesFromDate(game.id, nextDayKey) : 0;
    const existingKeys = force ? [] : await getExistingDateKeys(game.id, nextDayKey, lastDayKey);
    const gapDateKeys = computeGaps(targetDateKeys, existingKeys);
    let generatedCount = 0;
    let failedCount = 0;

    for (const dateKey of gapDateKeys) {
      try {
        if (await generatePuzzleForGame(game, dateKey)) generatedCount++;
        else failedCount++;
      } catch (err) {
        failedCount++;
        reconcileLogger.error(
          { event: "[GENERATION_ERROR]", game: game.slug, dateKey, error: getErrorMessage(err) },
          `error generating ${game.slug} puzzle for ${dateKey}`,
        );
      }
    }

    const inventoryDepth = await countInventoryForRange(game.id, runDateKey, REALITEA_READY_INVENTORY_DAYS);
    totalDeleted += deletedCount;
    totalGenerated += generatedCount;
    totalFailed += failedCount;
    reconcileLogger.info(
      { event: "[RECONCILE_GAME_COMPLETE]", game: game.slug, force, deletedCount, generatedCount, failedCount, inventoryDepth },
      `${game.slug}: ${generatedCount}/${gapDateKeys.length} generated`,
    );
  }

  reconcileLogger.info(
    { event: "[RECONCILE_COMPLETE]", force, games: games.map((game) => game.slug), deleted: totalDeleted, generated: totalGenerated, failed: totalFailed },
    `reconcile complete across ${games.length} game(s): ${totalGenerated} generated`,
  );

  if (totalFailed > 0) throw new Error(`${totalFailed} puzzle(s) failed to generate`);
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
