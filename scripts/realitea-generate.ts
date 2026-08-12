import "dotenv/config";
import { parseArgs } from "node:util";

import { closeDb } from "~/lib/server/db";
import { withGenerateLock } from "~/lib/server/db/advisory-lock";

import { getDateKey } from "../app/lib/realitea/core/date";
import { getErrorMessage } from "../app/lib/errors";
import {
  backfillPuzzlePublishedAt,
  countInventoryForRange,
  getActiveGames,
} from "../app/lib/realitea/server/repository.server";
import {
  computeGaps,
  REALITEA_READY_INVENTORY_DAYS,
  resolveGenerateWindow,
  runGenerateWindow,
} from "../app/lib/realitea/ops";
import { createLogger } from "../app/lib/logger.server";
import { LabyrinthServerEnv } from "../app/lib/server/env";

const logger = createLogger();

export { computeGaps };

function parseReconcileArgs(): {
  force: boolean;
  daysAhead: number;
  from?: string;
  to?: string;
} {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      force: { type: "boolean" },
      "days-ahead": { type: "string" },
      from: { type: "string" },
      to: { type: "string" },
    },
    strict: true,
  });
  return {
    force: values.force ?? false,
    daysAhead: values["days-ahead"]
      ? Number.parseInt(values["days-ahead"], 10)
      : REALITEA_READY_INVENTORY_DAYS,
    ...(values.from !== undefined ? { from: values.from } : {}),
    ...(values.to !== undefined ? { to: values.to } : {}),
  };
}

async function main() {
  LabyrinthServerEnv.parse(process.env);

  const args = parseReconcileArgs();
  const runDateKey = getDateKey(new Date());
  const window = resolveGenerateWindow({
    force: args.force,
    daysAhead: args.daysAhead,
    todayKey: runDateKey,
    ...(args.from !== undefined ? { from: args.from } : {}),
    ...(args.to !== undefined ? { to: args.to } : {}),
  });
  if (!window.ok) throw new Error(window.error);

  const reconcileLogger = logger.child({
    operation: "reconcile",
    runDateKey,
    force: window.force,
    from: window.fromKey,
    to: window.toKey,
  });

  reconcileLogger.info({ event: "[RECONCILE_START]" }, "starting reconcile run");
  await backfillPuzzlePublishedAt();
  const { expireGenerations, reapStaleGenerations } = await import(
    "../app/lib/realitea/admin/generate"
  );
  await reapStaleGenerations();
  await expireGenerations();

  const locked = await withGenerateLock(async () => {
    const games = await getActiveGames();
    if (games.length === 0) throw new Error("No active RealiTea games found");

    let totalDeleted = 0;
    let totalGenerated = 0;
    let totalFailed = 0;
    for (const game of games) {
      const result = await runGenerateWindow(game, window);
      if (result.aborted) {
        reconcileLogger.error(
          { event: "[RECONCILE_ABORTED]", game: game.slug, aborted: result.aborted },
          `${game.slug}: regenerate aborted`,
        );
        throw new Error(`${game.slug}: regenerate aborted (${result.aborted.code})`);
      }
      const inventoryDepth = await countInventoryForRange(
        game.id,
        runDateKey,
        REALITEA_READY_INVENTORY_DAYS,
      );
      totalDeleted += result.deletedCount;
      totalGenerated += result.generatedCount;
      totalFailed += result.failedCount;
      reconcileLogger.info(
        {
          event: "[RECONCILE_GAME_COMPLETE]",
          game: game.slug,
          force: window.force,
          deletedCount: result.deletedCount,
          generatedCount: result.generatedCount,
          failedCount: result.failedCount,
          inventoryDepth,
        },
        `${game.slug}: ${result.generatedCount} generated`,
      );
    }
    return { totalDeleted, totalGenerated, totalFailed, games: games.map((game) => game.slug) };
  });

  if (!locked.ok) {
    reconcileLogger.error({ event: "[LOCK_BUSY]" }, "another generate run holds the lock");
    throw new Error("lock_busy");
  }

  const { totalDeleted, totalGenerated, totalFailed, games } = locked.value;
  reconcileLogger.info(
    {
      event: "[RECONCILE_COMPLETE]",
      force: window.force,
      games,
      deleted: totalDeleted,
      generated: totalGenerated,
      failed: totalFailed,
    },
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
