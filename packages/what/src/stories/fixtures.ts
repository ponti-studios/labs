import type { GameState } from "../components/game";
import type { PublicGamesPuzzle, GameGuess, GameStatus } from "../lib/player-game";
import type { PuzzleHistoryPage } from "../lib/player-game/history-types";

export const puzzle: PublicGamesPuzzle = {
  answerType: "storyline",
  clue: "A tiny disagreement becomes a very public spectacle.",
  dateKey: "2026-08-20",
  detail: "The neighborhood group chat has opinions.",
  isFallback: false,
  sources: [
    {
      url: "https://example.com/source",
      title: "The source article",
      publishedAt: "2026-08-20T12:00:00.000Z",
    },
  ],
};

export const fallbackPuzzle = { ...puzzle, isFallback: true };

export const guesses: GameGuess[] = [
  { word: "ALERT", states: ["absent", "present", "absent", "correct", "absent"] },
  { word: "RIVAL", states: ["present", "absent", "correct", "absent", "absent"] },
];

const noop = () => undefined;

export function gameState(overrides: Partial<GameState> = {}): GameState {
  return {
    guesses: [],
    status: "playing",
    isSolved: false,
    isGameOver: false,
    authRequired: false,
    isRevealingRow: false,
    isValidationPending: false,
    currentGuess: "",
    errorMessage: null,
    errorCode: null,
    isShaking: false,
    hasError: false,
    shakeToken: 0,
    revealedTileCount: 0,
    revealingGuessIndex: null,
    addLetter: noop,
    removeLetter: noop,
    submitGuess: noop,
    clearError: noop,
    ...overrides,
  };
}

export const activeGame = gameState({ guesses, currentGuess: "DR" });
export const errorGame = gameState({
  currentGuess: "DRAMA",
  errorMessage: "Not in word list",
  errorCode: "not-in-word-list",
  hasError: true,
  isShaking: true,
  shakeToken: 1,
});
export const solvedGame = gameState({
  guesses: [
    ...guesses,
    { word: "DRAMA", states: ["correct", "correct", "correct", "correct", "correct"] },
  ],
  status: "solved",
  isSolved: true,
  isGameOver: true,
});
export const failedGame = gameState({
  guesses: [...guesses, ...guesses, ...guesses],
  status: "failed",
  isGameOver: true,
});
export const authRequiredGame = gameState({ authRequired: true, isGameOver: true });

const stats = {
  gamesPlayed: 8,
  gamesSolved: 6,
  winRate: 0.75,
  currentStreak: 3,
  maxStreak: 5,
  guessDistribution: { 1: 0, 2: 1, 3: 2, 4: 2, 5: 1, 6: 0 },
};

export const history: PuzzleHistoryPage = {
  page: 0,
  totalPages: 2,
  hasNext: true,
  hasPrev: false,
  weekStartKey: "2026-08-16",
  weekEndKey: "2026-08-22",
  stats,
  playableUnplayedDateKeys: ["2026-08-18", "2026-08-19", "2026-08-20"],
  rows: [
    {
      dateKey: "2026-08-20",
      status: "solved",
      guesses,
      answerType: "storyline",
      clue: puzzle.clue,
      detail: puzzle.detail,
    },
    {
      dateKey: "2026-08-19",
      status: "failed",
      guesses: guesses.slice(0, 1),
      answerType: "moment",
      clue: "A headline takes a turn.",
      detail: null,
    },
    {
      dateKey: "2026-08-18",
      status: "playing",
      guesses: [],
      answerType: "object",
      clue: "What is everyone suddenly discussing?",
      detail: null,
    },
  ],
};

export const emptyHistory: PuzzleHistoryPage = {
  ...history,
  rows: [],
  totalPages: 1,
  hasNext: false,
  playableUnplayedDateKeys: [],
  stats: { ...stats, gamesPlayed: 0, gamesSolved: 0, winRate: 0, currentStreak: 0, maxStreak: 0 },
};

export const statusConfig: Record<
  GameStatus,
  { label: string; variant: "default" | "destructive" | "outline" }
> = {
  solved: { label: "Solved", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
  playing: { label: "In progress", variant: "outline" },
};
