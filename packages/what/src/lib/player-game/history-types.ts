import type { GameStatus, PuzzleAnswerType, GameGuess } from "./types";

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

export interface PuzzleHistoryRow {
  dateKey: string;
  status: GameStatus;
  guesses: GameGuess[];
  answerType: PuzzleAnswerType;
  clue: string;
  detail: string | null;
}

export interface PuzzleHistoryPage {
  rows: PuzzleHistoryRow[];
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  weekStartKey: string;
  weekEndKey: string;
  stats: PuzzleHistoryStats;
  playableUnplayedDateKeys: string[];
}
