import { type NewRhobhDailyPuzzle } from "@pontistudios/db";

// ── Game engine types ─────────────────────────────────────────────────────

export type LetterState = "absent" | "correct" | "present";
export type PuzzleAnswerType = "moment" | "object" | "person" | "phrase" | "place" | "storyline";
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
 * - `dateKey` is added — derived from `dateUtc` / `scheduledForDateKey` via
 *   `normalizePuzzleRecord` in `realitea-puzzle.server.ts`
 * - `answerType` is narrowed to the `PuzzleAnswerType` union for
 *   exhaustiveness checks at call sites
 *
 * DB-only fields are intentionally omitted:
 * `dateUtc` (replaced by `dateKey`), `newsMode`, `sourceKind`,
 * `generationBatchId`, `generationStatus`, `validationStatus`.
 */
export type PuzzleRecord = Omit<
  NewRhobhDailyPuzzle,
  | "dateUtc"
  | "newsMode"
  | "sourceKind"
  | "generationBatchId"
  | "generationStatus"
  | "validationStatus"
  | "answerType"
> & {
  dateKey: string | null;
  answerType: PuzzleAnswerType;
};

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
