import "dotenv/config";
import { closeDb, db } from "@pontistudios/db";

import { getDateKey } from "../app/lib/realitea-date";
import { countInventoryForRange, getPuzzleForDate } from "../app/lib/realitea-db";
import { createScriptLogger } from "../app/lib/realitea-scripts";

const logger = createScriptLogger();

async function healthCheckRealiTea() {
  const now = new Date();
  const dateKey = getDateKey(now);
  const healthLogger = logger.child({
    operation: "healthCheckRealiTea",
    timestamp: now.toISOString(),
    dateKey,
  });

  // Check 1: Any puzzle exists at all
  const anyPuzzle = await db.query.rhobhDailyPuzzles.findFirst({});
  if (!anyPuzzle) {
    healthLogger.error({ event: "[HEALTH_CRITICAL_NO_PUZZLES]" }, "no puzzles in database");
  }

  // Check 2: Puzzle exists for today
  const todaysPuzzle = await getPuzzleForDate(dateKey);
  if (!todaysPuzzle) {
    healthLogger.error(
      { event: "[HEALTH_ERROR_NO_PUZZLE_TODAY]" },
      "no puzzle exists for today",
    );
  }

  // Check 3: Inventory depth for next 7 days
  const inventoryDepth = await countInventoryForRange(dateKey, 7);
  if (inventoryDepth < 1) {
    healthLogger.error(
      { event: "[HEALTH_CRITICAL_NO_INVENTORY]", inventory: inventoryDepth },
      "no puzzles scheduled for next 7 days",
    );
  } else if (inventoryDepth < 3) {
    healthLogger.warn(
      { event: "[HEALTH_WARN_LOW_INVENTORY]", inventory: inventoryDepth },
      "puzzle inventory is low",
    );
  }

  const status = anyPuzzle && todaysPuzzle && inventoryDepth >= 2 ? "OK" : "DEGRADED";
  healthLogger.info(
    {
      event: "[HEALTH_CHECK_COMPLETE]",
      status,
      puzzleExists: !!anyPuzzle,
      hasTodaysPuzzle: !!todaysPuzzle,
      inventoryDepth,
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
      {
        event: "[ERROR_HEALTH_CHECK_FAILED]",
        error: err instanceof Error ? err.message : String(err),
      },
      "health check failed",
    );
    process.exit(1);
  } finally {
    closeDb();
  }
}

await main();
