import "dotenv/config";
import { parseArgs } from "node:util";

import { closeDb } from "~/lib/server/db";
import { withGenerateLock } from "~/lib/server/db/advisory-lock";

import { getErrorMessage } from "../app/lib/errors";
import { createLogger } from "../app/lib/logger.server";
import {
  CIRCUIT_BREAKER_THRESHOLD,
  createCircuitBreaker,
} from "../app/lib/realitea/circuit-breaker";
import { getDateKey } from "../app/lib/realitea/core/date";
import { resolveGenerateRange } from "../app/lib/realitea/generate-range";
import {
  REALITEA_READY_INVENTORY_DAYS,
  runGenerateRange,
} from "../app/lib/realitea/generation-runner";
import { getActiveGames } from "../app/lib/realitea/server/games.server";
import {
  backfillPuzzlePublishedAt,
  countInventoryForRange,
} from "../app/lib/realitea/server/puzzles.server";
import { LabyrinthServerEnv } from "../app/lib/server/env";

const logger = createLogger();

function parseGenerateArgs(): {
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

  const args = parseGenerateArgs();
  const runDateKey = getDateKey(new Date());
  const range = resolveGenerateRange({
    force: args.force,
    daysAhead: args.daysAhead,
    todayKey: runDateKey,
    ...(args.from !== undefined ? { from: args.from } : {}),
    ...(args.to !== undefined ? { to: args.to } : {}),
  });
  if (!range.ok) throw new Error(range.error);

  const generateLogger = logger.child({
    operation: "generate",
    runDateKey,
    force: range.force,
    from: range.fromKey,
    to: range.toKey,
  });

  generateLogger.info({ event: "[GENERATE_START]" }, "starting generate run");
  await backfillPuzzlePublishedAt();
  const { expireGenerations, reapStaleGenerations } =
    await import("../app/lib/realitea/admin/generate.server");
  await reapStaleGenerations();
  await expireGenerations();

  const locked = await withGenerateLock(async () => {
    const games = await getActiveGames();
    if (games.length === 0) throw new Error("No active RealiTea games found");

    let totalDeleted = 0;
    let totalGenerated = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    const circuit = createCircuitBreaker();
    for (const game of games) {
      const result = await runGenerateRange(game, range, circuit);
      if (result.aborted) {
        generateLogger.error(
          { event: "[GENERATE_ABORTED]", game: game.slug, aborted: result.aborted },
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
      totalSkipped += result.skippedCount;
      generateLogger.info(
        {
          event: "[GENERATE_GAME_COMPLETE]",
          game: game.slug,
          force: range.force,
          deletedCount: result.deletedCount,
          generatedCount: result.generatedCount,
          failedCount: result.failedCount,
          skippedCount: result.skippedCount,
          inventoryDepth,
        },
        `${game.slug}: ${result.generatedCount} generated`,
      );
      if (result.circuitOpened) {
        generateLogger.error(
          {
            event: "[GENERATE_CIRCUIT_OPEN]",
            game: game.slug,
            consecutiveFailures: circuit.consecutiveFailures,
          },
          `${circuit.consecutiveFailures} consecutive generation failures — stopping the rest of this run instead of exhausting the attempt budget`,
        );
        break;
      }
    }
    return {
      totalDeleted,
      totalGenerated,
      totalFailed,
      totalSkipped,
      circuitOpened: circuit.open,
      games: games.map((game) => game.slug),
    };
  });

  if (!locked.ok) {
    generateLogger.error({ event: "[LOCK_BUSY]" }, "another generate run holds the lock");
    throw new Error("lock_busy");
  }

  const { totalDeleted, totalGenerated, totalFailed, totalSkipped, circuitOpened, games } =
    locked.value;
  generateLogger.info(
    {
      event: "[GENERATE_COMPLETE]",
      force: range.force,
      games,
      deleted: totalDeleted,
      generated: totalGenerated,
      failed: totalFailed,
      skipped: totalSkipped,
      circuitOpened,
    },
    `generate complete across ${games.length} game(s): ${totalGenerated} generated`,
  );

  if (circuitOpened) {
    throw new Error(
      `generation circuit breaker tripped after ${CIRCUIT_BREAKER_THRESHOLD} consecutive failures — provider likely degraded, ${totalSkipped} date(s) skipped`,
    );
  }
  if (totalFailed > 0) throw new Error(`${totalFailed} puzzle(s) failed to generate`);
}

if (!process.env.VITEST) {
  try {
    await main();
  } catch (err) {
    logger.error(
      { event: "[GENERATE_FAILED]", error: getErrorMessage(err) },
      "generate run failed",
    );
    process.exit(1);
  } finally {
    closeDb();
  }
}
