import type { GameStatus, PuzzleAnswerType, GameGuess } from "../puzzle/types";
import type { MosaicCell, PuzzleHistoryStats } from "../puzzle/stats";

export type { MosaicCell, MosaicCellStatus, PuzzleHistoryStats } from "../puzzle/stats";

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
  mosaic: MosaicCell[];
}
