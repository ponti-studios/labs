import { type NewRhobhDailyPuzzle, type PuzzleAnswerType } from "@pontistudios/db";
export type { PuzzleAnswerType };

// ── Game engine types ─────────────────────────────────────────────────────

export type LetterState = "absent" | "correct" | "present";
export type GameStatus = "playing" | "solved" | "failed";

/**
 * Server-side puzzle with the answer. Never leaves the server.
 * `PublicDailyPuzzle` is the client-safe counterpart.
 */
export interface DailyPuzzle {
  answer: string;
  answerType: PuzzleAnswerType;
  clue: string;
  dateKey: string;
  detail: string;
  role: string;
  sourceUrls: string[];
}

// Do not send the `answer` to the client.
export interface PublicDailyPuzzle extends Omit<DailyPuzzle, "answer"> {}

export interface RealiteaGuess {
  word: string;
  states: LetterState[];
}

export type GuessRejectReason = "not-in-word-list" | "wrong-length" | "already-guessed";

export interface RealiteaGuessResult {
  valid: boolean;
  word?: string;
  states?: LetterState[];
  isSolved?: boolean;
  isGameOver?: boolean;
  status?: GameStatus;
  reason?: GuessRejectReason;
}

/**
 * Domain DTO for a RealiTea puzzle. Derived from `NewRhobhDailyPuzzle` so `id`
 * is correctly typed as `number | undefined` (the serial PK makes it optional
 * in the insert type) without needing a manual override.
 *
 * - `answerType` is narrowed to the `PuzzleAnswerType` union for
 *   exhaustiveness checks at call sites
 *
 * DB-only `validationStatus` is intentionally omitted.
 */
export type PuzzleRecord = Omit<NewRhobhDailyPuzzle, "validationStatus" | "scheduledForDateKey">;

export interface PuzzleWindow {
  dateKey: string;
  expireAt: Date;
  publishAt: Date;
}

export interface ValidationResult {
  normalizedAnswer: string;
  reasons: string[];
  valid: boolean;
}
