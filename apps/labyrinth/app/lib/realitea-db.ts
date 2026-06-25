import { and, db, desc, eq, gt, gte, inArray, lte, rhobhDailyPuzzles } from "@pontistudios/db";
import pino from "pino";

import { getDateKey, getPuzzleWindow } from "./realitea-date";
import { BRAVO_REPEAT_WINDOW_DAYS } from "./realitea-validation";
import type { PuzzleRecord } from "./realitea.types";

const logger = pino(
  process.env.NODE_ENV === "development"
    ? { transport: { target: "pino-pretty" } }
    : { level: process.env.NODE_ENV === "test" ? "silent" : "info" },
);

/**
 * Transaction-or-database handle. The `db.transaction` callback receives a
 * `PostgresJsTransaction` instance that exposes the same query API as `db`,
 * so functions that may run inside or outside a transaction accept either.
 */
export type PuzzleDatabase = {
  select: typeof db.select;
  update: typeof db.update;
  insert: typeof db.insert;
  query: typeof db.query;
};

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getRecentAnswers(date: Date): Promise<Set<string>> {
  const cutoff = new Date(date);
  cutoff.setUTCDate(cutoff.getUTCDate() - BRAVO_REPEAT_WINDOW_DAYS);
  const cutoffDateValue = getDateKey(cutoff);
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(gte(rhobhDailyPuzzles.dateUtc, cutoffDateValue));
  return new Set(rows.map((r) => r.normalizedAnswer));
}

export async function getInventoryAnswers(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(inArray(rhobhDailyPuzzles.status, ["published", "scheduled"]));
  return new Set(rows.map((r) => r.normalizedAnswer));
}

export async function getStoredAnswersForValidation(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles);
  return new Set(rows.map((r) => r.normalizedAnswer));
}

export async function getPublishedPuzzle(
  now: Date,
  tx: PuzzleDatabase = db,
): Promise<PuzzleRecord | null> {
  const childLogger = logger.child({
    operation: "getPublishedPuzzle",
    timestamp: now.toISOString(),
  });

  const row = await tx.query.rhobhDailyPuzzles.findFirst({
    where: and(
      eq(rhobhDailyPuzzles.status, "published"),
      lte(rhobhDailyPuzzles.publishAt, now),
      gt(rhobhDailyPuzzles.expireAt, now),
    ),
    orderBy: desc(rhobhDailyPuzzles.publishAt),
  });

  if (row) {
    childLogger.info({ event: "[PUZZLE_AVAILABLE]", puzzle_id: row.id }, "published puzzle found");
  } else {
    childLogger.debug({ event: "[NO_PUBLISHED_PUZZLE]" }, "no published puzzle in current window");
  }

  return row || null;
}

export async function loadScheduledPuzzle(dateKey: string): Promise<PuzzleRecord | null> {
  const row = await db.query.rhobhDailyPuzzles.findFirst({
    where: and(
      eq(rhobhDailyPuzzles.dateUtc, dateKey),
      inArray(rhobhDailyPuzzles.status, ["published", "scheduled"]),
    ),
    orderBy: desc(rhobhDailyPuzzles.createdAt),
  });
  return row || null;
}

// ── Mutations ────────────────────────────────────────────────────────────────

export async function markExpiredPuzzles(now: Date, tx: PuzzleDatabase = db): Promise<void> {
  await tx
    .update(rhobhDailyPuzzles)
    .set({ status: "consumed", updatedAt: now })
    .where(and(eq(rhobhDailyPuzzles.status, "published"), lte(rhobhDailyPuzzles.expireAt, now)));
}

export async function promoteScheduledPuzzle(now: Date): Promise<PuzzleRecord | null> {
  const window = getPuzzleWindow(now);
  const childLogger = logger.child({
    operation: "promoteScheduledPuzzle",
    dateKey: window.dateKey,
    timestamp: now.toISOString(),
  });

  return db.transaction(async (tx) => {
    await markExpiredPuzzles(now, tx as unknown as PuzzleDatabase);

    const active = await getPublishedPuzzle(now, tx as unknown as PuzzleDatabase);
    if (active) {
      childLogger.debug(
        { event: "[SKIP_PROMOTION_PUBLISHED]", puzzle_id: active.id },
        "puzzle already published",
      );
      return active;
    }

    // Attempt 1: find scheduled for today's dateKey
    let scheduled = await (tx as unknown as PuzzleDatabase).query.rhobhDailyPuzzles.findFirst({
      where: and(
        eq(rhobhDailyPuzzles.status, "scheduled"),
        eq(rhobhDailyPuzzles.dateUtc, window.dateKey),
      ),
      orderBy: desc(rhobhDailyPuzzles.createdAt),
    });

    // Fallback: any recent scheduled puzzle
    if (!scheduled) {
      childLogger.debug(
        { event: "[SKIP_PROMOTION_NO_SCHEDULED]" },
        "no scheduled puzzle for today",
      );
      scheduled = await (tx as unknown as PuzzleDatabase).query.rhobhDailyPuzzles.findFirst({
        where: eq(rhobhDailyPuzzles.status, "scheduled"),
        orderBy: desc(rhobhDailyPuzzles.createdAt),
      });
      if (scheduled) {
        childLogger.warn(
          {
            event: "[FALLBACK_ACTIVATED_SCHEDULED_ANY]",
            puzzle_id: scheduled.id,
            intended_dateKey: window.dateKey,
            fallback_dateKey: scheduled.dateUtc,
          },
          "promoting most-recent scheduled puzzle as fallback",
        );
      }
    }

    if (!scheduled?.id) {
      childLogger.error({ event: "[ERROR_NO_SCHEDULED_PUZZLE]" }, "no scheduled puzzle found");
      return null;
    }

    const updated = await tx
      .update(rhobhDailyPuzzles)
      .set({
        dateUtc: window.dateKey,
        expireAt: window.expireAt,
        publishAt: window.publishAt,
        status: "published",
        updatedAt: now,
      })
      .where(eq(rhobhDailyPuzzles.id, Number(scheduled.id)))
      .returning();

    childLogger.info(
      {
        event: "[PUZZLE_PROMOTED]",
        puzzle_id: scheduled.id,
        source_dateKey: scheduled.dateUtc,
      },
      "scheduled puzzle promoted to published",
    );
    return updated[0] || null;
  });
}
