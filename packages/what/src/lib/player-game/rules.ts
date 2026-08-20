import type { GameStatus, LetterState, GameGuess } from "./types";

export type {
  GameStatus,
  LetterState,
  PublicGamesPuzzle,
  GameGuess,
  GameGuessResult,
} from "./types";

export const MAX_GUESSES = 6;
export const GAME_ANSWER_LENGTH = 5;

export function evaluateGuess(answer: string, guess: string): import("./types").LetterState[] {
  const answerLetters = answer.toUpperCase().split("");
  const guessLetters = guess.toUpperCase().split("");
  const states: import("./types").LetterState[] = Array.from(
    { length: guessLetters.length },
    () => "absent",
  );
  const remaining = new Map<string, number>();

  for (let index = 0; index < answerLetters.length; index++) {
    if (guessLetters[index] === answerLetters[index]) states[index] = "correct";
    else remaining.set(answerLetters[index], (remaining.get(answerLetters[index]) ?? 0) + 1);
  }
  for (let index = 0; index < guessLetters.length; index++) {
    if (states[index] === "correct") continue;
    const count = remaining.get(guessLetters[index]) ?? 0;
    if (count > 0) {
      states[index] = "present";
      remaining.set(guessLetters[index], count - 1);
    }
  }
  return states;
}

export function normalizeGuess(value: string): string {
  return value.replaceAll(/[^a-z]/gi, "").toUpperCase();
}

export function isGuessLengthValid(value: string): boolean {
  return normalizeGuess(value).length === GAME_ANSWER_LENGTH;
}

export function hasGuessedWord(guesses: readonly GameGuess[], word: string): boolean {
  const normalizedWord = normalizeGuess(word);
  return guesses.some((guess) => normalizeGuess(guess.word) === normalizedWord);
}

const STATE_PRIORITY: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

/**
 * Aggregate letter states across a list of guesses for the on-screen keyboard.
 * Accepts server-evaluated `states` so the client never needs to know the answer.
 */
export function getKeyboardState(guesses: readonly GameGuess[]): Record<string, LetterState> {
  const keyboardState: Record<string, LetterState> = {};

  for (const guess of guesses) {
    for (const [index, letter] of guess.word.split("").entries()) {
      const nextState = guess.states[index] ?? "absent";
      const currentState = keyboardState[letter];

      if (!currentState || STATE_PRIORITY[nextState] > STATE_PRIORITY[currentState]) {
        keyboardState[letter] = nextState;
      }
    }
  }

  return keyboardState;
}

function isGuessSolved(guess: GameGuess): boolean {
  return guess.states.every((state) => state === "correct");
}

export function deriveGameStatus(guesses: readonly GameGuess[]): GameStatus {
  if (guesses.some(isGuessSolved)) return "solved";
  if (guesses.length >= MAX_GUESSES) return "failed";
  return "playing";
}
