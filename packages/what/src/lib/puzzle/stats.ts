/**
 * Pure aggregation over a user's game attempts — no DB access, so this
 * is trivially unit-testable against hand-built fixtures. Callers (see
 * history.server.ts) are responsible for fetching the full, unpaginated
 * attempt list this operates on.
 */
import { addDaysToDateKey, buildDateRange } from "./date";

export interface PuzzleHistoryStats {
  gamesPlayed: number;
  gamesSolved: number;
  /** 0..1. 0 when gamesPlayed is 0. */
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  /** Guess count at solve, solved attempts only. */
  guessDistribution: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
}

export type StatsAttempt = {
  dateUtc: string;
  status: "playing" | "solved" | "failed";
  guesses: readonly unknown[];
};

function emptyDistribution(): PuzzleHistoryStats["guessDistribution"] {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
}

/**
 * Streak rule: sorted newest-first, a streak only continues across
 * calendar-contiguous dates (no gap — an unattempted puzzle date isn't in
 * `attempts` at all, since anonymous/unplayed dates never get a row) where
 * every entry is `status === "solved"`. A failed or still-`"playing"` entry
 * breaks it, same as a gap does.
 */
export function computeHistoryStats(attempts: readonly StatsAttempt[]): PuzzleHistoryStats {
  const gamesPlayed = attempts.length;
  const guessDistribution = emptyDistribution();
  let gamesSolved = 0;

  for (const attempt of attempts) {
    if (attempt.status !== "solved") continue;
    gamesSolved++;
    const guessCount = attempt.guesses.length;
    if (guessCount >= 1 && guessCount <= 6) {
      guessDistribution[guessCount as 1 | 2 | 3 | 4 | 5 | 6]++;
    }
  }

  const winRate = gamesPlayed === 0 ? 0 : gamesSolved / gamesPlayed;

  const sorted = [...attempts].sort((a, b) =>
    a.dateUtc < b.dateUtc ? 1 : a.dateUtc > b.dateUtc ? -1 : 0,
  );

  let currentStreak = 0;
  for (let i = 0; i < sorted.length; i++) {
    const attempt = sorted[i];
    if (attempt.status !== "solved") break;
    if (i > 0 && addDaysToDateKey(sorted[i - 1].dateUtc, -1) !== attempt.dateUtc) break;
    currentStreak++;
  }

  let maxStreak = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    const attempt = sorted[i];
    const contiguous = i === 0 || addDaysToDateKey(sorted[i - 1].dateUtc, -1) === attempt.dateUtc;
    if (attempt.status === "solved" && contiguous) {
      run++;
    } else if (attempt.status === "solved") {
      run = 1;
    } else {
      run = 0;
    }
    maxStreak = Math.max(maxStreak, run);
  }

  return { gamesPlayed, gamesSolved, winRate, currentStreak, maxStreak, guessDistribution };
}

export type MosaicCellStatus = "solved" | "failed" | "playing" | "unplayed";

export interface MosaicCell {
  /** YYYY-MM-DD */
  dateKey: string;
  status: MosaicCellStatus;
  /** Guess count at solve (1-6). Only meaningful when status is "solved". */
  guessCount: number | null;
}

/**
 * One cell per calendar day in `[fromKey, toKey]` (inclusive), oldest
 * first — a day with no attempt row is "unplayed", not a gap in the array,
 * so the caller can render a fixed-shape grid straight off this output.
 */
export function buildStreakMosaic(
  attempts: readonly StatsAttempt[],
  { fromKey, toKey }: { fromKey: string; toKey: string },
): MosaicCell[] {
  const byDate = new Map(attempts.map((attempt) => [attempt.dateUtc, attempt]));

  return buildDateRange(fromKey, { endKey: toKey }).map((dateKey) => {
    const attempt = byDate.get(dateKey);
    if (!attempt) return { dateKey, status: "unplayed", guessCount: null };
    if (attempt.status === "solved") {
      return { dateKey, status: "solved", guessCount: attempt.guesses.length };
    }
    if (attempt.status === "failed") {
      return { dateKey, status: "failed", guessCount: null };
    }
    return { dateKey, status: "playing", guessCount: null };
  });
}
