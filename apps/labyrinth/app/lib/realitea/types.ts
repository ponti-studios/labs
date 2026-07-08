import type {
  Article,
  DailyPuzzle as DailyPuzzleRow,
  Game,
  PuzzleAnswerType,
} from "@pontistudios/db";
export type { Article, Game, PuzzleAnswerType };

// ── Game engine types ─────────────────────────────────────────────────────

export type LetterState = "absent" | "correct" | "present";
export type GameStatus = "playing" | "solved" | "failed";

export interface PuzzleSource {
  url: string;
  title: string;
  publishedAt: string;
}

/**
 * Server-side puzzle with the answer. Never leaves the server.
 * `PublicDailyPuzzle` is the client-safe counterpart.
 */
interface DailyPuzzleDto {
  answer: string;
  answerType: PuzzleAnswerType;
  clue: string;
  dateKey: string;
  detail: string;
  sources: PuzzleSource[];
}

// Do not send the `answer` to the client.
export interface PublicDailyPuzzle extends Omit<DailyPuzzleDto, "answer"> {}

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
 * Domain DTO for a generated puzzle, joined with the single article it was
 * generated from (`sources` used to live as a jsonb blob on the puzzle row;
 * it now lives on the linked `articles` row and is joined in at read time).
 */
export interface PuzzleRecord extends DailyPuzzleRow {
  article: Pick<Article, "url" | "title" | "publishedAt">;
}

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
