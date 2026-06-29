import { type RhobhDailyPuzzle, type PuzzleAnswerType, type PuzzleSource } from "@pontistudios/db";
export type { PuzzleAnswerType, PuzzleSource };

// ── Game engine types ─────────────────────────────────────────────────────

export type LetterState = "absent" | "correct" | "present";
export type GameStatus = "playing" | "solved" | "failed";

/**
 * Server-side puzzle with the answer. Never leaves the server.
 * `PublicDailyPuzzle` is the client-safe counterpart.
 */
interface DailyPuzzle {
  answer: string;
  answerType: PuzzleAnswerType;
  clue: string;
  dateKey: string;
  detail: string;
  sources: PuzzleSource[];
}

// Do not send the `answer` to the client.
export interface PublicDailyPuzzle extends Omit<DailyPuzzle, "answer"> {}

export interface RealiteaGuess {
  word: string;
  states: LetterState[];
}

type GuessRejectReason = "not-in-word-list" | "wrong-length" | "already-guessed";

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
export type PuzzleRecord = RhobhDailyPuzzle;

export interface ValidationResult {
  normalizedAnswer: string;
  reasons: string[];
  valid: boolean;
}

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  imageUrl?: string;
}

export interface CandidatePreview {
  candidate: {
    answer: string;
    answerType: string;
    clue: string;
    detail: string;
    sources: PuzzleSource[];
  };
  validation: { normalizedAnswer: string; valid: boolean; reasons: string[] };
}

export interface GenerationPreviewResult {
  dateKey: string;
  feedUrl: string;
  feedItemCount: number;
  feedItems: FeedItem[];
  candidates: CandidatePreview[];
  selectedIndex: number | null;
  feedError: string | null;
  llmError: string | null;
}

export interface PreviewCandidatesOptions {
  feedUrl?: string;
  systemPrompt?: string;
  excludedAnswers?: string[];
}
