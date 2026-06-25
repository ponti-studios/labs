import "dotenv/config";
import { and, closeDb, db, eq, gte, inArray, max, rhobhDailyPuzzles } from "@pontistudios/db";

import {
  addDaysToDateKey,
  buildDateRange,
  getDateKey,
} from "../app/lib/realitea-date";
import { REALITEA_READY_INVENTORY_DAYS } from "../app/lib/realitea-validation";
import {
  countInventoryForRange,
  deletePuzzlesFromDate,
} from "../app/lib/realitea-db";
import { generateScheduledPuzzle } from "../app/lib/realitea-generation";
import { LabyrinthServerEnv } from "../app/lib/server/env";
import { createScriptLogger } from "../app/lib/realitea-scripts";

const logger = createScriptLogger();

interface ReconcileOptions {
  force?: boolean;
  daysAhead?: number;
}

function parseArgs(): ReconcileOptions {
  const args = process.argv.slice(2);
  const opts: ReconcileOptions = {};
  for (const arg of args) {
    if (arg === "--force") {
      opts.force = true;
    } else if (arg.startsWith("--days-ahead=")) {
      opts.daysAhead = parseInt(arg.slice("--days-ahead=".length), 10);
    }
  }
  return opts;
}

async function main() {
  LabyrinthServerEnv.parse(process.env);

  const opts = parseArgs();
  const now = new Date();
  const runDateKey = getDateKey(now);
  const reconcileLogger = logger.child({
    operation: "reconcile",
    runDateKey,
    force: opts.force ?? false,
  });

  reconcileLogger.info({ event: "[RECONCILE_START]" }, "starting reconcile run");

  // Determine the future range to manage.
  const nextDayKey = addDaysToDateKey(runDateKey, 1);
  if (!nextDayKey) throw new Error("Failed to compute next date key");

  let targetDateKeys: string[];
  let deletedCount = 0;
  let failedCount = 0;

  if (opts.force) {
    // ── Force mode: delete everything from tomorrow, regenerate from scratch ──
    const daysAhead = opts.daysAhead ?? REALITEA_READY_INVENTORY_DAYS;
    targetDateKeys = buildDateRange(nextDayKey, { daysAhead });
    reconcileLogger.info(
      {
        event: "[FORCE_RANGE]",
        endDateKey: targetDateKeys[targetDateKeys.length - 1],
        daysAhead,
      },
      `force-regenerating ${daysAhead}-day window`,
    );

    deletedCount = await deletePuzzlesFromDate(nextDayKey);
    reconcileLogger.info(
      { event: "[FORCE_DELETED]", count: deletedCount },
      `deleted ${deletedCount} old puzzles`,
    );
  } else {
    // ── Normal mode: gap-fill for the standard inventory window ──
    targetDateKeys = buildDateRange(nextDayKey, { daysAhead: REALITEA_READY_INVENTORY_DAYS });
  }

  // Generate puzzles for any date that doesn't yet have one.
  const existingRows = await db
    .select({ dateUtc: rhobhDailyPuzzles.dateUtc })
    .from(rhobhDailyPuzzles)
    .where(inArray(rhobhDailyPuzzles.dateUtc, targetDateKeys));
  const existingKeys = new Set(
    existingRows.map((r) => r.dateUtc).filter((v): v is string => Boolean(v)),
  );

  const createdDateKeys: string[] = [];
  for (const dateKey of targetDateKeys) {
    if (existingKeys.has(dateKey)) {
      reconcileLogger.debug(
        { event: "[SKIP_GENERATION_EXISTS]", dateKey },
        "puzzle already exists for date",
      );
      continue;
    }
    try {
      const created = await generateScheduledPuzzle(dateKey);
      if (created) createdDateKeys.push(dateKey);
    } catch (err) {
      reconcileLogger.error(
        {
          event: "[GENERATION_ERROR]",
          dateKey,
          error: err instanceof Error ? err.message : String(err),
        },
        `error generating puzzle for ${dateKey}`,
      );
      failedCount++;
    }
  }

  const inventoryDepth = await countInventoryForRange(
    runDateKey,
    REALITEA_READY_INVENTORY_DAYS,
  );

  reconcileLogger.info(
    {
      event: "[RECONCILE_COMPLETE]",
      force: opts.force ?? false,
      deleted: deletedCount,
      generated: createdDateKeys.length,
      failed: failedCount,
      inventoryDepth,
    },
    `reconcile complete: ${createdDateKeys.length}/${targetDateKeys.length} generated`,
  );

  // In force mode, fail the job if any generation failed.
  if (opts.force && failedCount > 0) {
    throw new Error(`${failedCount} puzzle(s) failed to generate`);
  }
}

try {
  await main();
} catch (err) {
  logger.error(
    {
      event: "[ERROR_RECONCILE_FAILED]",
      error: err instanceof Error ? err.message : String(err),
      ...(err instanceof Object
        ? Object.fromEntries(
            Object.entries(err as Record<string, unknown>).filter(([k]) => k !== "message"),
          )
        : {}),
    },
    "reconcile run failed",
  );
  process.exit(1);
} finally {
  closeDb();
}
