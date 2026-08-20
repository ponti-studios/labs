import type { GameStatus, PublicGamesPuzzle, GameGuess } from "./types";

export interface ActivePuzzleAttempt {
  guesses: GameGuess[];
  status: GameStatus;
}

export interface ActivePuzzleEnvelope {
  puzzle: PublicGamesPuzzle;
  attempt: ActivePuzzleAttempt | null;
}

export interface DatedPuzzleEnvelope {
  puzzle: PublicGamesPuzzle;
  attempt: { guesses: GameGuess[]; status: GameStatus } | null;
}
