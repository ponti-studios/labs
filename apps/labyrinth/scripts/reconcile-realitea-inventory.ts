import "dotenv/config";
import { and, closeDb, count, db, eq, inArray, rhobhDailyPuzzles } from "@pontistudios/db";

import {
  addDaysToDateKey,
  getDateKey,
  getPuzzleWindow,
  parseDate,
  REALITEA_READY_INVENTORY_DAYS,
  REALITEA_RESERVE_TARGET,
  BRAVO_FRANCHISE,
} from "../app/lib/realitea-daily-puzzle";
import {
  buildGenerationBatchId,
  generateReservePuzzles,
  generateScheduledPuzzle,
  getPublishedPuzzle,
  promoteScheduledOrReservePuzzle,
} from "~/lib/realitea-daily-puzzle.server";

function requireEnvironment() {
  const missing = ["DATABASE_URL", "OPENROUTER_API_KEY"].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function main() {
  requireEnvironment();

  const now = new Date();
  const readyDays = REALITEA_READY_INVENTORY_DAYS;
  const reserveTarget = REALITEA_RESERVE_TARGET;
  const activeWindow = getPuzzleWindow(now);
  const promoted = await promoteScheduledOrReservePuzzle(now);

  const targetDateKeys: string[] = [];
  for (let offset = 1; offset <= readyDays; offset += 1) {
    const dateKey = addDaysToDateKey(activeWindow.dateKey, offset);
    if (dateKey) {
      targetDateKeys.push(dateKey);
    }
  }

  const scheduledRows = await db
    .select({ scheduledForDateKey: rhobhDailyPuzzles.scheduledForDateKey })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.status, "scheduled"),
        inArray(rhobhDailyPuzzles.scheduledForDateKey, targetDateKeys),
      ),
    );
  const existingKeys = new Set(
    scheduledRows
      .map((row) => row.scheduledForDateKey)
      .filter((value): value is string => Boolean(value)),
  );

  const createdScheduledDateKeys: string[] = [];
  for (const dateKey of targetDateKeys) {
    if (existingKeys.has(dateKey)) {
      continue;
    }

    const created = await generateScheduledPuzzle(dateKey, {
      generationBatchId: buildGenerationBatchId("reconcile", activeWindow.dateKey),
      now: parseDate(dateKey) ?? now,
      sourceCollectionNow: now,
    });
    if (created) {
      createdScheduledDateKeys.push(dateKey);
    }
  }

  const reserveDepthBefore = await countReservePuzzles();
  const neededReserve = Math.max(0, reserveTarget - reserveDepthBefore);
  const createdReserves = await generateReservePuzzles(neededReserve, {
    generationBatchId: buildGenerationBatchId("reserve-reconcile", activeWindow.dateKey),
    now,
  });

  const published = await getPublishedPuzzle(now);
  const readyDepth = await countReadyScheduledPuzzles(now);
  const reserveDepth = await countReservePuzzles();

  const result = {
    activeDateKey: activeWindow.dateKey,
    createdReserveCount: createdReserves.length,
    createdScheduledDateKeys,
    promotedSourceKind:
      promoted?.sourceKind === "evergreen"
        ? "evergreen"
        : promoted?.sourceKind === "current"
          ? "current"
          : null,
    publishedSourceKind:
      published?.sourceKind === "evergreen"
        ? "evergreen"
        : published?.sourceKind === "current"
          ? "current"
          : null,
    readyDepth,
    reserveDepth,
  };

  console.log(
    JSON.stringify(
      {
        activeDateKey: result.activeDateKey,
        createdReserveCount: result.createdReserveCount,
        createdScheduledDateKeys: result.createdScheduledDateKeys,
        promotedSourceKind: result.promotedSourceKind,
        publishedSourceKind: result.publishedSourceKind,
        readyDepth: result.readyDepth,
        reserveDepth: result.reserveDepth,
        runDateKey: getDateKey(now),
        status: "reconciled",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} finally {
  closeDb();
}

async function countReservePuzzles() {
  const rows = await db
    .select({ value: count() })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.status, "reserve"),
      ),
    );

  return rows[0]?.value ?? 0;
}

async function countReadyScheduledPuzzles(now: Date) {
  const activeDateKey = getPuzzleWindow(now).dateKey;
  const dateKeys: string[] = [];

  for (let offset = 1; offset <= REALITEA_READY_INVENTORY_DAYS; offset += 1) {
    const dateKey = addDaysToDateKey(activeDateKey, offset);
    if (dateKey) {
      dateKeys.push(dateKey);
    }
  }

  if (dateKeys.length === 0) {
    return 0;
  }

  const rows = await db
    .select({ value: count() })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.status, "scheduled"),
        inArray(rhobhDailyPuzzles.scheduledForDateKey, dateKeys),
      ),
    );

  return rows[0]?.value ?? 0;
}
