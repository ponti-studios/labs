import "dotenv/config";
import { and, closeDb, count, db, eq, inArray, rhobhDailyPuzzles } from "@pontistudios/db";

import {
  addDaysToDateKey,
  BRAVO_FRANCHISE,
  getDateKey,
  getPuzzleWindow,
  REALITEA_READY_INVENTORY_DAYS,
} from "../app/lib/realitea-daily-puzzle";
import {
  generateScheduledPuzzle,
  getPublishedPuzzle,
  promoteScheduledPuzzle,
} from "../app/lib/realitea-daily-puzzle.server";

function requireEnvironment() {
  const missing = ["DATABASE_URL", "OPENROUTER_API_KEY"].filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function main() {
  requireEnvironment();

  const now = new Date();
  const { dateKey: activeDateKey } = getPuzzleWindow(now);

  const promoted = await promoteScheduledPuzzle(now);

  const targetDateKeys: string[] = [];
  for (let offset = 1; offset <= REALITEA_READY_INVENTORY_DAYS; offset++) {
    const dateKey = addDaysToDateKey(activeDateKey, offset);
    if (dateKey) targetDateKeys.push(dateKey);
  }

  const existingRows = await db
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
    existingRows
      .map((r) => r.scheduledForDateKey)
      .filter((v): v is string => Boolean(v)),
  );

  const createdDateKeys: string[] = [];
  for (const dateKey of targetDateKeys) {
    if (existingKeys.has(dateKey)) continue;
    const created = await generateScheduledPuzzle(dateKey);
    if (created) createdDateKeys.push(dateKey);
  }

  const published = await getPublishedPuzzle(now);

  const countRows = await db
    .select({ value: count() })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.status, "scheduled"),
        inArray(rhobhDailyPuzzles.scheduledForDateKey, targetDateKeys),
      ),
    );
  const readyDepth = countRows[0]?.value ?? 0;

  console.log(
    JSON.stringify(
      {
        activeDateKey,
        createdDateKeys,
        promoted: promoted?.scheduledForDateKey ?? null,
        publishedId: published?.id ?? null,
        readyDepth,
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
