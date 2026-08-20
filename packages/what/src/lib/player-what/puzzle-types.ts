import type { GameStatus, PublicGamesPuzzle, WhatGuess } from "./types";

export interface ActivePuzzleAttempt {
  guesses: WhatGuess[];
  status: GameStatus;
}

export interface ActivePuzzleEnvelope {
  puzzle: PublicGamesPuzzle;
  attempt: ActivePuzzleAttempt | null;
}

export interface DatedPuzzleEnvelope {
  puzzle: PublicGamesPuzzle;
  attempt: { guesses: WhatGuess[]; status: GameStatus } | null;
}
