/**
 * Data-access layer for the RealiTea puzzle table (`rhobh_daily_puzzles`).
 *
 * All exported functions are standalone — there is no class wrapper because:
 *
 * - The module has zero instance state. Every function operates on the shared
 *   `db` instance from `@pontistudios/db` (or a transaction handle passed in).
 *   A class would add `this.` noise with no benefit.
 * - Functions are independently importable, which makes it easy for callers to
 *   pull only what they need and for tests to mock at the `@pontistudios/db`
 *   boundary.
 * - The `PuzzleDatabase` type already provides the transaction-aware interface
 *   for functions like `markExpiredPuzzles` and `getPublishedPuzzle` that may
 *   run inside a `db.transaction(...)`. No class is needed for polymorphism.
 *
 * If the module ever needs per-request state (e.g. a request-scoped logger,
 * tenant-specific config), that would be a signal to consider a class or
 * a factory function. Until then, free functions keep the surface simple.
 */

import {
  and,
  count,
  db,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lte,
  rhobhDailyPuzzles,
} from "@pontistudios/db";
import pino from "pino";

import { addDaysToDateKey, buildDateRange, getDateKey, getPuzzleWindow } from "./realitea-date";
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

/**
 * Collect all unique normalized answers from the repeat-cooldown window
 * (the last `BRAVO_REPEAT_WINDOW_DAYS` days).
 *
 * Used during puzzle generation to avoid repeating an answer that was used
 * too recently.
 */
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

/**
 * Collect all normalized answers from currently active or future puzzles
 * (status = "published" or "scheduled").
 *
 * Used during puzzle generation to ensure a candidate answer does not clash
 * with any puzzle that a player might still encounter.
 */
export async function getInventoryAnswers(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(inArray(rhobhDailyPuzzles.status, ["published", "scheduled"]));
  return new Set(rows.map((r) => r.normalizedAnswer));
}

/**
 * Collect **every** normalized answer across all rows in the table,
 * regardless of status.
 *
 * Used by validation utilities that need a complete picture, e.g. when
 * back-filling or auditing existing puzzle data. Prefer `getRecentAnswers`
 * or `getInventoryAnswers` in generation paths — they are narrower and
 * therefore cheaper.
 */
export async function getStoredAnswersForValidation(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles);
  return new Set(rows.map((r) => r.normalizedAnswer));
}

/**
 * Find the puzzle currently visible to players: a published row whose
 * `publishAt` is in the past and `expireAt` is still in the future.
 *
 * Accepts an optional transaction handle so callers can invoke this from
 * inside a `db.transaction(...)` callback without getting a stale snapshot.
 *
 * Returns the puzzle record, or `null` if no puzzle is currently published.
 */
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

  if (!row) {
    childLogger.debug({ event: "[NO_PUBLISHED_PUZZLE]" }, "no published puzzle in current window");
  }

  return row || null;
}

/**
 * Load the most recent puzzle row (published or scheduled) for a given date key.
 *
 * Used by the generation logic to check whether a puzzle already exists for a
 * date before attempting to generate a new one. This prevents duplicate inserts
 * during gap-fill reconciliation.
 */
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

// ── Inventory helpers ─────────────────────────────────────────────────────────

/**
 * Count the number of scheduled puzzle records in the inventory window
 * that starts one day after `fromDateKey` and extends `days` days forward.
 *
 * Used by health checks to verify adequate future puzzle coverage.
 */
export async function countScheduledInventory(fromDateKey: string, days: number): Promise<number> {
  const startKey = addDaysToDateKey(fromDateKey, 1);
  if (!startKey) return 0;
  const dateKeys = buildDateRange(startKey, { daysAhead: days });
  if (dateKeys.length === 0) return 0;
  const [row] = await db
    .select({ value: count() })
    .from(rhobhDailyPuzzles)
    .where(
      and(eq(rhobhDailyPuzzles.status, "scheduled"), inArray(rhobhDailyPuzzles.dateUtc, dateKeys)),
    );
  return row?.value ?? 0;
}

/**
 * Delete all scheduled puzzles whose `dateUtc` is >= `fromDateKey`.
 * Uses a single `DELETE ... RETURNING` query to avoid a separate read-
 * then-delete round trip.
 *
 * Returns the number of deleted records.
 *
 * Used when regenerating puzzles so old scheduled entries don't shadow
 * newly generated ones.
 */
export async function deleteScheduledPuzzlesFromDate(fromDateKey: string): Promise<number> {
  const result = await db
    .delete(rhobhDailyPuzzles)
    .where(
      and(eq(rhobhDailyPuzzles.status, "scheduled"), gte(rhobhDailyPuzzles.dateUtc, fromDateKey)),
    )
    .returning({ id: rhobhDailyPuzzles.id });
  return result.length;
}

// ── Mutations ────────────────────────────────────────────────────────────────

/**
 * Transition all published puzzles whose `expireAt` has passed to the
 * `"consumed"` status so they no longer appear in active-puzzle queries.
 *
 * Safe to call inside a `db.transaction(...)` — accepts an optional
 * transaction handle via the `tx` parameter.
 */
export async function markExpiredPuzzles(now: Date, tx: PuzzleDatabase = db): Promise<void> {
  await tx
    .update(rhobhDailyPuzzles)
    .set({ status: "consumed", updatedAt: now })
    .where(and(eq(rhobhDailyPuzzles.status, "published"), lte(rhobhDailyPuzzles.expireAt, now)));
}

/**
 * Promote a scheduled puzzle to published for the current day.
 *
 * Called once per day by the reconcile cron. This function:
 *
 * 1. Marks any expired published puzzles as `"consumed"`.
 * 2. Checks whether a puzzle is already published for today — if so, returns it.
 * 3. Tries to find a scheduled puzzle whose `dateUtc` matches today.
 * 4. Falls back to the most-recently created scheduled puzzle if no exact
 *    match exists (logs a warning when this happens).
 * 5. Updates the selected puzzle's `dateUtc`, `publishAt`, `expireAt`, and
 *    `status` to make it the active published puzzle.
 *
 * Returns the promoted puzzle record, or `null` if no scheduled puzzle was
 * found at all.
 */
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
