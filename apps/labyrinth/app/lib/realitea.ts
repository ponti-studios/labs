export type LetterState = "absent" | "correct" | "present";
export type PuzzleAnswerType = "moment" | "object" | "person" | "phrase" | "place" | "storyline";
export type PuzzleNewsMode = "archive" | "current";

export interface Puzzle {
  answer: string;
  clue: string;
  detail: string;
  role: string;
  answerType?: PuzzleAnswerType;
  newsMode?: PuzzleNewsMode;
}

export const MAX_GUESSES = 6;
export const REALITEA_ANSWER_LENGTH = 5;

export function normalizeGuess(value: string): string {
  return value.replaceAll(/[^a-z]/gi, "").toUpperCase();
}

export function normalizeAnswer(value: string): string {
  return normalizeGuess(value);
}

function getLocalDayIndex(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

export function getPuzzleKeyForDate(date: Date): string {
  return `rhobh-${getLocalDayIndex(date)}`;
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

export function getKeyboardState(answer: string, guesses: string[]): Record<string, LetterState> {
  const priority: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };
  const keyboardState: Record<string, LetterState> = {};

  for (const guess of guesses) {
    const states = evaluateGuess(answer, guess);
    for (const [index, letter] of guess.split("").entries()) {
      const nextState = states[index];
      const currentState = keyboardState[letter];

      if (!currentState || priority[nextState] > priority[currentState]) {
        keyboardState[letter] = nextState;
      }
    }
  }

  return keyboardState;
}
