/**
 * Data-access layer for the RealiTea puzzle table (`rhobh_daily_puzzles`).
 *
 * All exported functions are standalone — there is no class wrapper because
 * the module has zero instance state. Every function operates on the shared
 * `db` instance from `@pontistudios/db`, and functions are independently
 * importable for tree-shaking and targeted test mocking.
 *
 * Puzzles are queried by `dateUtc` — the intended date they should be served on.
 * There is no promotion or status lifecycle; puzzles are created for their date
 * and served directly.
 */

import { and, count, db, desc, eq, gte, inArray, lte, rhobhDailyPuzzles } from "@pontistudios/db";

import { addDaysToDateKey, buildDateRange, getDateKey } from "./realitea-date";
import { BRAVO_REPEAT_WINDOW_DAYS } from "./realitea-validation";
import type { PuzzleRecord } from "./realitea.types";

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
 * Collect all unique normalized answers ever stored in the table.
 *
 * Used both during generation (to avoid clashes with existing inventory) and
 * during word validation (to allow stored puzzle answers as valid guesses).
 */
export async function getStoredAnswers(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles);
  return new Set(rows.map((r) => r.normalizedAnswer));
}

/**
 * Find the puzzle for a given date key, preferring the most recently created
 * record if multiple exist for the same date.
 *
 * Returns `null` if no puzzle exists for that date.
 */
export async function loadPuzzleForDate(dateKey: string): Promise<PuzzleRecord | null> {
  const row = await db.query.rhobhDailyPuzzles.findFirst({
    where: eq(rhobhDailyPuzzles.dateUtc, dateKey),
    orderBy: desc(rhobhDailyPuzzles.createdAt),
  });
  return row ?? null;
}

// ── Inventory helpers ─────────────────────────────────────────────────────────

/**
 * Count the number of puzzle records in the inventory window
 * that starts one day after `fromDateKey` and extends `days` days forward.
 *
 * Used by health checks to verify adequate future puzzle coverage.
 */
export async function countInventoryForRange(fromDateKey: string, days: number): Promise<number> {
  const startKey = addDaysToDateKey(fromDateKey, 1);
  if (!startKey) return 0;
  const dateKeys = buildDateRange(startKey, { daysAhead: days });
  if (dateKeys.length === 0) return 0;
  const [row] = await db
    .select({ value: count() })
    .from(rhobhDailyPuzzles)
    .where(inArray(rhobhDailyPuzzles.dateUtc, dateKeys));
  return row?.value ?? 0;
}

/**
 * Return the `date_utc` values that already have a puzzle in [fromKey, toKey].
 *
 * Used by the reconcile script to determine which dates need gap-filling
 * without an inline Drizzle query.
 */
export async function getExistingDateKeys(fromKey: string, toKey: string): Promise<string[]> {
  const rows = await db
    .select({ dateUtc: rhobhDailyPuzzles.dateUtc })
    .from(rhobhDailyPuzzles)
    .where(and(gte(rhobhDailyPuzzles.dateUtc, fromKey), lte(rhobhDailyPuzzles.dateUtc, toKey)));
  return rows.map((r) => r.dateUtc).filter((v): v is string => Boolean(v));
}

/**
 * Delete all puzzles whose `dateUtc` is >= `fromDateKey`.
 *
 * Returns the number of deleted records.
 */
export async function deletePuzzlesFromDate(fromDateKey: string): Promise<number> {
  const result = await db
    .delete(rhobhDailyPuzzles)
    .where(gte(rhobhDailyPuzzles.dateUtc, fromDateKey))
    .returning({ id: rhobhDailyPuzzles.id });
  return result.length;
}
