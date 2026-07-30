import type { GameStatus, RealiteaGuess } from "./index";
import { addDaysToDateKey, getDateKey } from "./date";
import { getExistingDateKeys, getGameBySlug, listAttemptsForUser, loadAllAttemptsForUser } from "./repository";
import { computeHistoryStats, type PuzzleHistoryStats } from "./stats";
import type { PuzzleAnswerType } from "./types";

// The public route only serves the RHOBH game today; duplicated from
// puzzle.server.ts's private requireRhobhGameId rather than exporting it,
// to avoid coupling these two server-composition modules together.
const RHOBH_GAME_SLUG = "rhobh";

async function requireRhobhGameId(): Promise<number> {
  const game = await getGameBySlug(RHOBH_GAME_SLUG);
  if (!game) throw new Error(`Game not found: ${RHOBH_GAME_SLUG}`);
  return game.id;
}

// How far back to look for playable-but-unplayed puzzle dates. Bounds an
// otherwise-unbounded getExistingDateKeys scan; 90 days is generous relative
// to how long the game has existed so far.
const PLAYABLE_LOOKBACK_DAYS = 90;

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
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  stats: PuzzleHistoryStats;
  /** Puzzle dates within the lookback window with no attempt row at all,
   *  oldest first. */
  playableUnplayedDateKeys: string[];
}

export async function loadPuzzleHistory(
  userId: string,
  { page, pageSize }: { page: number; pageSize: number },
): Promise<PuzzleHistoryPage> {
  const gameId = await requireRhobhGameId();

  const [{ rows, total }, allAttempts] = await Promise.all([
    listAttemptsForUser(userId, gameId, { page, pageSize }),
    loadAllAttemptsForUser(userId, gameId),
  ]);

  const stats = computeHistoryStats(allAttempts);

  const todayKey = getDateKey(new Date(), "UTC");
  const fromKey = addDaysToDateKey(todayKey, -PLAYABLE_LOOKBACK_DAYS) ?? todayKey;
  const existingDateKeys = await getExistingDateKeys(gameId, fromKey, todayKey);
  const attemptedDateKeys = new Set(allAttempts.map((a) => a.dateUtc));
  const playableUnplayedDateKeys = existingDateKeys
    .filter((dateKey) => !attemptedDateKeys.has(dateKey))
    .sort();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    stats,
    playableUnplayedDateKeys,
  };
}
