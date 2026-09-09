import type { GameStatus, PuzzleAnswerType, GameGuess } from "../puzzle/types";
import type { MosaicCell, PuzzleHistoryStats } from "../puzzle/stats";

export type { MosaicCell, MosaicCellStatus, PuzzleHistoryStats } from "../puzzle/stats";

export interface PuzzleHistoryRow {
  dateKey: string;
  gameSlug: string;
  gameName: string;
  status: GameStatus;
  guesses: GameGuess[];
  answerType: PuzzleAnswerType;
  clue: string;
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
  weekStartKey: string;
  weekEndKey: string;
  stats: PuzzleHistoryStats;
  playableUnplayed: PlayableUnplayedPuzzle[];
  mosaic: MosaicCell[];
}
