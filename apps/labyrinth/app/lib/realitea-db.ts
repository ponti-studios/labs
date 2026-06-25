/**
 * Data-access layer for the RealiTea puzzle table (`rhobh_daily_puzzles`).
 *
 * All exported functions are standalone — there is no class wrapper because:
 *
 * - The module has zero instance state. Every function operates on the shared
 *   `db` instance from `@pontistudios/db`.
 * - Functions are independently importable, which makes it easy for callers to
 *   pull only what they need and for tests to mock at the `@pontistudios/db`
 *   boundary.
 *
 * Puzzles are queried by `dateUtc` — the intended date they should be served on.
 * There is no promotion or status lifecycle; puzzles are created for their date
 * and served directly.
 */

import {
  count,
  db,
  desc,
  eq,
  gte,
  inArray,
  rhobhDailyPuzzles,
} from "@pontistudios/db";
import pino from "pino";

import { addDaysToDateKey, buildDateRange, getDateKey } from "./realitea-date";
import { BRAVO_REPEAT_WINDOW_DAYS } from "./realitea-validation";
import type { PuzzleRecord } from "./realitea.types";

const logger = pino(
  process.env.NODE_ENV === "development"
    ? { transport: { target: "pino-pretty" } }
    : { level: process.env.NODE_ENV === "test" ? "silent" : "info" },
);

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
 * Collect all normalized answers from all puzzles in inventory.
 *
 * Used during puzzle generation to ensure a candidate answer does not clash
 * with any puzzle that a player might still encounter.
 */
export async function getInventoryAnswers(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles);
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
 * Find the puzzle for a given date key.
 *
 * Returns the puzzle record, or `null` if no puzzle exists for that date.
 */
export async function getPuzzleForDate(dateKey: string): Promise<PuzzleRecord | null> {
  const childLogger = logger.child({
    operation: "getPuzzleForDate",
    dateKey,
  });

  const row = await db.query.rhobhDailyPuzzles.findFirst({
    where: eq(rhobhDailyPuzzles.dateUtc, dateKey),
  });

  if (row) {
    childLogger.debug({ event: "[PUZZLE_FOUND]", puzzle_id: row.id }, "puzzle found for date");
  } else {
    childLogger.debug({ event: "[PUZZLE_NOT_FOUND]" }, "no puzzle found for date");
  }

  return row || null;
}

/**
 * Load the puzzle for a given date key.
 *
 * Used by the generation logic to check whether a puzzle already exists for a
 * date before attempting to generate a new one. This prevents duplicate inserts.
 */
export async function loadPuzzleForDate(dateKey: string): Promise<PuzzleRecord | null> {
  const row = await db.query.rhobhDailyPuzzles.findFirst({
    where: eq(rhobhDailyPuzzles.dateUtc, dateKey),
    orderBy: desc(rhobhDailyPuzzles.createdAt),
  });
  return row || null;
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
 * Delete all puzzles whose `dateUtc` is >= `fromDateKey`.
 *
 * Returns the number of deleted records.
 *
 * Used when regenerating puzzles so old entries don't shadow newly generated ones.
 */
export async function deletePuzzlesFromDate(fromDateKey: string): Promise<number> {
  const result = await db
    .delete(rhobhDailyPuzzles)
    .where(gte(rhobhDailyPuzzles.dateUtc, fromDateKey))
    .returning({ id: rhobhDailyPuzzles.id });
  return result.length;
}

