import type { GameStatus, LetterState, RealiteaGuess } from "./realitea.types";

export type {
  GameStatus,
  GuessRejectReason,
  LetterState,
  PublicDailyPuzzle,
  PuzzleAnswerType,
  RealiteaGuess,
  RealiteaGuessResult,
} from "./realitea.types";

export const MAX_GUESSES = 6;
export const REALITEA_ANSWER_LENGTH = 5;
export const REALITEA_TIME_ZONE = "America/Los_Angeles";

export function normalizeGuess(value: string): string {
  return value.replaceAll(/[^a-z]/gi, "").toUpperCase();
}

export function normalizeAnswer(value: string): string {
  return normalizeGuess(value);
}

export function getPuzzleDateParts(date: Date): [number, number, number] {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: REALITEA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = Number.parseInt(parts.find((part) => part.type === "year")?.value ?? "", 10);
  const month = Number.parseInt(parts.find((part) => part.type === "month")?.value ?? "", 10);
  const day = Number.parseInt(parts.find((part) => part.type === "day")?.value ?? "", 10);

  return [year, month, day];
}

export function evaluateGuess(answer: string, guess: string): LetterState[] {
  const normalizedAnswer = normalizeGuess(answer);
  const normalizedGuess = normalizeGuess(guess);
  const states: LetterState[] = Array.from({ length: normalizedAnswer.length }, () => "absent");
  const remaining = normalizedAnswer.split("");

  for (const [index, letter] of normalizedGuess.split("").entries()) {
    if (letter === normalizedAnswer[index]) {
      states[index] = "correct";
      remaining[index] = "";
    }
  }

  for (const [index, letter] of normalizedGuess.split("").entries()) {
    if (states[index] !== "absent") {
      continue;
    }

    const remainingIndex = remaining.indexOf(letter);
    if (remainingIndex >= 0) {
      states[index] = "present";
      remaining[remainingIndex] = "";
    }
  }

  return states;
}

const STATE_PRIORITY: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

/**
 * Aggregate letter states across a list of guesses for the on-screen keyboard.
 * Accepts server-evaluated `states` so the client never needs to know the answer.
 */
export function getKeyboardState(guesses: readonly RealiteaGuess[]): Record<string, LetterState> {
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

export function isGuessSolved(guess: RealiteaGuess): boolean {
  return guess.states.every((state) => state === "correct");
}

export function deriveGameStatus(guesses: readonly RealiteaGuess[]): GameStatus {
  if (guesses.some(isGuessSolved)) return "solved";
  if (guesses.length >= MAX_GUESSES) return "failed";
  return "playing";
}
