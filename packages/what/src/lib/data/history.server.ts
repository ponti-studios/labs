import type { GameStatus, GameGuess, PuzzleAnswerType } from "../puzzle/types";
import { addDaysToDateKey, daysBetweenDateKeys, getDateKey } from "../puzzle/date";
import { listAttemptsForUserInRange, loadAllAttemptsForUser } from "./attempts.server";
import { getActiveGames } from "./games.server";
import { getEarliestPuzzleDateKeyAcrossTopics, getExistingPuzzlesAcrossTopics } from "./puzzles.server";
import {
  buildStreakMosaic,
  computeHistoryStats,
  type MosaicCell,
  type PuzzleHistoryStats,
} from "../puzzle/stats";

// How far back to look for playable-but-unplayed puzzle dates. Bounds an
// otherwise-unbounded getExistingPuzzlesAcrossTopics scan; 90 days is
// generous relative to how long the game has existed so far.
const PLAYABLE_LOOKBACK_DAYS = 90;

// The history list paginates by calendar week (rolling 7-day windows
// anchored to today), not by row count — The game is a one-puzzle-per-day
// game, so a "week" is a more meaningful unit than an arbitrary row count.
const WEEK_DAYS = 7;

// The streak mosaic always shows a full 52-week grid (7 rows x 52 columns),
// same fixed window no matter how long the player has been playing — days
// before the game existed just render as unplayed, same as any other gap.
const MOSAIC_LOOKBACK_DAYS = 364;

export interface PuzzleHistoryRow {
  dateKey: string;
  gameSlug: string;
  gameName: string;
  status: GameStatus;
  guesses: GameGuess[];
  answerType: PuzzleAnswerType;
  clue: string;
  /** Only populated once the attempt is no longer "playing" — never leak the
   *  story reveal for a puzzle the player hasn't actually finished. */
  detail: string | null;
}

export interface PlayableUnplayedPuzzle {
  dateKey: string;
  gameSlug: string;
  gameName: string;
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
  /** Puzzles within the lookback window, across every active topic, with no
   *  attempt row at all — oldest first. */
  playableUnplayed: PlayableUnplayedPuzzle[];
  /** Fixed 52-week day-by-day grid for the streak mosaic, oldest first —
   *  same window regardless of how long the game has existed. A day with
   *  puzzles across several topics collapses to one cell (see
   *  `aggregateByDate` in stats.ts). */
  mosaic: MosaicCell[];
}

/**
 * A single player's puzzle history across every active topic — one combined
 * list, streak, and mosaic rather than a page per topic, since the topics
 * share the same daily cadence and the player experiences them as one game.
 */
export async function loadPuzzleHistory(
  userId: string,
  { page }: { page: number },
): Promise<PuzzleHistoryPage> {
  const games = await getActiveGames();
  const gameIds = games.map((game) => game.id);
  const gameBySlug = new Map(games.map((game) => [game.id, game]));

  const todayKey = getDateKey(new Date(), "UTC");

  const weekEndKey = addDaysToDateKey(todayKey, -(page - 1) * WEEK_DAYS) ?? todayKey;
  const weekStartKey = addDaysToDateKey(weekEndKey, -(WEEK_DAYS - 1)) ?? weekEndKey;

  const [rows, allAttempts, earliestPuzzleKey] = await Promise.all([
    listAttemptsForUserInRange(userId, gameIds, { fromKey: weekStartKey, toKey: weekEndKey }),
    loadAllAttemptsForUser(userId, gameIds),
    getEarliestPuzzleDateKeyAcrossTopics(gameIds),
  ]);

  const stats = computeHistoryStats(allAttempts);

  const mosaicFromKey = addDaysToDateKey(todayKey, -MOSAIC_LOOKBACK_DAYS) ?? todayKey;
  const mosaic = buildStreakMosaic(allAttempts, { fromKey: mosaicFromKey, toKey: todayKey });

  const fromKey = addDaysToDateKey(todayKey, -PLAYABLE_LOOKBACK_DAYS) ?? todayKey;
  const existingPuzzles = await getExistingPuzzlesAcrossTopics(gameIds, fromKey, todayKey);
  const attemptedKeys = new Set(allAttempts.map((a) => `${a.gamesTopicId}:${a.dateUtc}`));
  const playableUnplayed = existingPuzzles
    .filter(({ gameId, dateUtc }) => !attemptedKeys.has(`${gameId}:${dateUtc}`))
    .map(({ gameId, dateUtc }) => {
      const game = gameBySlug.get(gameId);
      return { dateKey: dateUtc, gameSlug: game?.slug ?? "", gameName: game?.name ?? "" };
    })
    .filter((puzzle) => puzzle.gameSlug !== "")
    .sort((a, b) => (a.dateKey === b.dateKey ? a.gameName.localeCompare(b.gameName) : a.dateKey < b.dateKey ? -1 : 1));

  const totalDays = earliestPuzzleKey
    ? (daysBetweenDateKeys(earliestPuzzleKey, todayKey) ?? 0) + 1
    : 1;
  const totalPages = Math.max(1, Math.ceil(totalDays / WEEK_DAYS));

  return {
    rows: rows.map(({ attempt, puzzle, topic }) => ({
      dateKey: attempt.dateUtc,
      gameSlug: topic.slug,
      gameName: topic.name,
      status: attempt.status,
      guesses: attempt.guesses as GameGuess[],
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
    playableUnplayed,
    mosaic,
  };
}
