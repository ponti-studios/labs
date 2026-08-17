import type { GameStatus, RealiteaGuess, PuzzleAnswerType } from "../core/types";
import { addDaysToDateKey, daysBetweenDateKeys, getDateKey } from "../core/date";
import { listAttemptsForUserInRange, loadAllAttemptsForUser } from "./attempts.server";
import { getGameBySlug } from "./games.server";
import { getEarliestPuzzleDateKey, getExistingDateKeys } from "./puzzles.server";
import { computeHistoryStats, type PuzzleHistoryStats } from "../core/stats";
import { DEFAULT_REALITEA_GAME_SLUG } from "../generation/catalog";

async function requireGameId(gameSlug = DEFAULT_REALITEA_GAME_SLUG): Promise<number> {
  const game = await getGameBySlug(gameSlug);
  if (!game) throw new Error(`Game not found: ${gameSlug}`);
  return game.id;
}

// How far back to look for playable-but-unplayed puzzle dates. Bounds an
// otherwise-unbounded getExistingDateKeys scan; 90 days is generous relative
// to how long the game has existed so far.
const PLAYABLE_LOOKBACK_DAYS = 90;

// The history list paginates by calendar week (rolling 7-day windows
// anchored to today), not by row count — RealiTea is a one-puzzle-per-day
// game, so a "week" is a more meaningful unit than an arbitrary row count.
const WEEK_DAYS = 7;

export interface PuzzleHistoryRow {
  dateKey: string;
  status: GameStatus;
  guesses: RealiteaGuess[];
  answerType: PuzzleAnswerType;
  clue: string;
  /** Only populated once the attempt is no longer "playing" — never leak the
   *  story reveal for a puzzle the player hasn't actually finished. */
  detail: string | null;
}

export interface PuzzleHistoryPage {
  rows: PuzzleHistoryRow[];
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  /** The 7-day window this page covers, inclusive. */
  weekStartKey: string;
  weekEndKey: string;
  stats: PuzzleHistoryStats;
  /** Puzzle dates within the lookback window with no attempt row at all,
   *  oldest first. */
  playableUnplayedDateKeys: string[];
}

export async function loadPuzzleHistory(
  userId: string,
  { page }: { page: number },
  gameSlug = DEFAULT_REALITEA_GAME_SLUG,
): Promise<PuzzleHistoryPage> {
  const gameId = await requireGameId(gameSlug);
  const todayKey = getDateKey(new Date(), "UTC");

  const weekEndKey = addDaysToDateKey(todayKey, -(page - 1) * WEEK_DAYS) ?? todayKey;
  const weekStartKey = addDaysToDateKey(weekEndKey, -(WEEK_DAYS - 1)) ?? weekEndKey;

  const [rows, allAttempts, earliestPuzzleKey] = await Promise.all([
    listAttemptsForUserInRange(userId, gameId, { fromKey: weekStartKey, toKey: weekEndKey }),
    loadAllAttemptsForUser(userId, gameId),
    getEarliestPuzzleDateKey(gameId),
  ]);

  const stats = computeHistoryStats(allAttempts);

  const fromKey = addDaysToDateKey(todayKey, -PLAYABLE_LOOKBACK_DAYS) ?? todayKey;
  const existingDateKeys = await getExistingDateKeys(gameId, fromKey, todayKey);
  const attemptedDateKeys = new Set(allAttempts.map((a) => a.dateUtc));
  const playableUnplayedDateKeys = existingDateKeys
    .filter((dateKey) => !attemptedDateKeys.has(dateKey))
    .sort();

  const totalDays = earliestPuzzleKey
    ? (daysBetweenDateKeys(earliestPuzzleKey, todayKey) ?? 0) + 1
    : 1;
  const totalPages = Math.max(1, Math.ceil(totalDays / WEEK_DAYS));

  return {
    rows: rows.map(({ attempt, puzzle }) => ({
      dateKey: attempt.dateUtc,
      status: attempt.status,
      guesses: attempt.guesses as RealiteaGuess[],
      answerType: puzzle.answerType,
      clue: puzzle.clue,
      detail: attempt.status === "playing" ? null : puzzle.detail,
    })),
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    weekStartKey,
    weekEndKey,
    stats,
    playableUnplayedDateKeys,
  };
}
