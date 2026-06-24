import "dotenv/config";
import { and, closeDb, count, db, eq, inArray, rhobhDailyPuzzles, sql } from "@pontistudios/db";
import pino from "pino";

import { addDaysToDateKey, getPuzzleWindow } from "../app/lib/realitea-puzzle";
import { getPublishedPuzzle } from "../app/lib/realitea-puzzle.server";

const logger = pino(
  process.env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : {},
);

async function countScheduledInventory(fromDateKey: string, days: number): Promise<number> {
  const dateKeys: string[] = [];
  for (let i = 1; i <= days; i++) {
    const key = addDaysToDateKey(fromDateKey, i);
    if (key) dateKeys.push(key);
  }
  if (dateKeys.length === 0) return 0;
  const rows = await db
    .select({ value: count() })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.status, "scheduled"),
        inArray(rhobhDailyPuzzles.scheduledForDateKey, dateKeys),
      ),
    );
  return rows[0]?.value ?? 0;
}

async function healthCheckRealiTea() {
  const now = new Date();
  const window = getPuzzleWindow(now);
  const healthLogger = logger.child({
    operation: "healthCheckRealiTea",
    timestamp: now.toISOString(),
    dateKey: window.dateKey,
  });

  // Check 1: Any puzzle exists at all
  const anyPuzzle = await db.query.rhobhDailyPuzzles.findFirst({});
  if (!anyPuzzle) {
    healthLogger.error({ event: "[HEALTH_CRITICAL_NO_PUZZLES]" }, "no puzzles in database");
  }

  // Check 2: Scheduled inventory depth for next 7 days
  const inventoryDepth = await countScheduledInventory(window.dateKey, 7);
  if (inventoryDepth < 1) {
    healthLogger.error(
      { event: "[HEALTH_CRITICAL_NO_INVENTORY]", inventory: inventoryDepth },
      "scheduled inventory depleted",
    );
  } else if (inventoryDepth < 3) {
    healthLogger.warn(
      { event: "[HEALTH_WARN_LOW_INVENTORY]", inventory: inventoryDepth },
      "scheduled inventory is low",
    );
  }

  // Check 3: Validate current puzzle window math (detect DST issues)
  const published = await getPublishedPuzzle(now);
  if (published?.expireAt && published?.publishAt) {
    const diffMs = published.expireAt.getTime() - published.publishAt.getTime();
    const expectedMs = 86_400_000; // 24 hours
    if (Math.abs(diffMs - expectedMs) > 60_000) {
      healthLogger.error(
        {
          event: "[HEALTH_ERROR_WINDOW_INVALID]",
          puzzle_id: published.id,
          diffMs,
          expectedMs,
        },
        "puzzle window duration invalid — possible DST issue",
      );
    }
  }

  // Check 4: Data consistency — no records with invalid status values
  const inconsistentRows = await db
    .select({ id: rhobhDailyPuzzles.id })
    .from(rhobhDailyPuzzles)
    .where(sql`${rhobhDailyPuzzles.status} NOT IN ('scheduled', 'published', 'consumed')`);

  if (inconsistentRows.length > 0) {
    healthLogger.error(
      { event: "[HEALTH_ERROR_INCONSISTENT_DATA]", count: inconsistentRows.length },
      "found puzzle records with invalid status",
    );
  }

  const status = anyPuzzle && inventoryDepth >= 2 ? "OK" : "DEGRADED";
  healthLogger.info(
    {
      event: "[HEALTH_CHECK_COMPLETE]",
      status,
      puzzleAvailable: !!anyPuzzle,
      inventoryDepth,
      inconsistencies: inconsistentRows.length,
    },
    "health check complete",
  );

  return status;
}

async function main() {
  try {
    const status = await healthCheckRealiTea();
    if (status !== "OK") process.exit(1);
  } catch (err) {
    logger.error(
      { event: "[ERROR_HEALTH_CHECK_FAILED]", error: err instanceof Error ? err.message : String(err) },
      "health check failed",
    );
    process.exit(1);
  } finally {
    closeDb();
  }
}

await main();
