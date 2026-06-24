import "dotenv/config";
import { and, closeDb, count, db, eq, inArray, rhobhDailyPuzzles } from "@pontistudios/db";
import pino from "pino";

import {
  addDaysToDateKey,
  getDateKey,
  getPuzzleWindow,
  REALITEA_READY_INVENTORY_DAYS,
} from "../app/lib/realitea-puzzle";
import {
  generateScheduledPuzzle,
  getPublishedPuzzle,
  promoteScheduledPuzzle,
} from "../app/lib/realitea-puzzle.server";

const logger = pino(
  process.env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : {},
);

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
  const reconcileLogger = logger.child({
    operation: "reconcile",
    runDateKey: getDateKey(now),
    activeDateKey,
  });

  reconcileLogger.info({ event: "[RECONCILE_START]" }, "starting reconcile run");

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
        eq(rhobhDailyPuzzles.status, "scheduled"),
        inArray(rhobhDailyPuzzles.scheduledForDateKey, targetDateKeys),
      ),
    );
  const existingKeys = new Set(
    existingRows.map((r) => r.scheduledForDateKey).filter((v): v is string => Boolean(v)),
  );

  const createdDateKeys: string[] = [];
  for (const dateKey of targetDateKeys) {
    if (existingKeys.has(dateKey)) {
      reconcileLogger.debug(
        { event: "[SKIP_GENERATION_EXISTS]", dateKey },
        "puzzle already scheduled for date",
      );
      continue;
    }
    const created = await generateScheduledPuzzle(dateKey);
    if (created) createdDateKeys.push(dateKey);
  }

  const published = await getPublishedPuzzle(now);

  const countRows = await db
    .select({ value: count() })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.status, "scheduled"),
        inArray(rhobhDailyPuzzles.scheduledForDateKey, targetDateKeys),
      ),
    );
  const readyDepth = countRows[0]?.value ?? 0;

  reconcileLogger.info(
    {
      event: "[RECONCILE_COMPLETE]",
      createdDateKeys,
      promoted: promoted?.scheduledForDateKey ?? null,
      publishedId: published?.id ?? null,
      readyDepth,
    },
    "reconcile run complete",
  );
}

try {
  await main();
} catch (err) {
  logger.error(
    { event: "[ERROR_RECONCILE_FAILED]", error: err instanceof Error ? err.message : String(err) },
    "reconcile run failed",
  );
  process.exit(1);
} finally {
  closeDb();
}
