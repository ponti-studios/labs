export type LetterState = "absent" | "correct" | "present";
export type RhobhAnswerType = "moment" | "object" | "person" | "phrase" | "place" | "storyline";
export type RhobhNewsMode = "archive" | "current";

export interface RhobhPuzzle {
  answer: string;
  clue: string;
  detail: string;
  role: string;
  answerType?: RhobhAnswerType;
  newsMode?: RhobhNewsMode;
}

export const MAX_GUESSES = 6;

export const RHOBH_PUZZLES: RhobhPuzzle[] = [
  {
    answer: "KYLE",
    clue: "OG diamond holder navigating a high-profile separation storyline.",
    detail:
      "Kyle Richards remains the show's center of gravity and one of the most recognizable names in Beverly Hills.",
    role: "Original cast anchor",
  },
  {
    answer: "ERIKA",
    clue: "The Pretty Mess performer never misses a sharp confessional.",
    detail:
      "Erika Jayne keeps the glam, the one-liners, and the pop-star energy turned all the way up.",
    role: "Pop diva energy",
  },
  {
    answer: "DORIT",
    clue: "Accent discourse, fashion moments, and marriage updates all point here.",
    detail: "Dorit Kemsley stays in the middle of the style conversation and the cast drama.",
    role: "Fashion-first housewife",
  },
  {
    answer: "SUTTON",
    clue: "Known for couture, Southern shade, and saying exactly what she's thinking.",
    detail: "Sutton Stracke mixes luxury, nerves, and pointed honesty in nearly every group scene.",
    role: "Boutique and bluntness",
  },
  {
    answer: "BOZOMA",
    clue: "A powerhouse newcomer whose first-season confidence lands fast.",
    detail:
      "Bozoma Saint John brings executive polish, direct reads, and instant presence to the ensemble.",
    role: "Breakout newcomer",
  },
  {
    answer: "RACHEL",
    clue: "This new diamond holder arrives with deep fashion-world credentials.",
    detail: "Rachel Zoe adds celebrity stylist glamour and a polished Beverly Hills point of view.",
    role: "Fashion mogul",
  },
  {
    answer: "AMANDA",
    clue: "A new full-time cast member with a business-minded personal brand.",
    detail:
      "Amanda Frances joins the group with wealth-manifesting confidence and fresh alliances.",
    role: "Entrepreneurial addition",
  },
  {
    answer: "KATHY",
    clue: "Technically a friend of, but always capable of stealing the scene.",
    detail:
      "Kathy Hilton floats in with deadpan humor, family tension, and instant meme potential.",
    role: "Scene-stealing friend",
  },
  {
    answer: "TILLY",
    clue: "An offbeat friend of the group with a playful, unmistakable vibe.",
    detail:
      "Jennifer Tilly brings camp, charm, and a distinctly different rhythm to the cast orbit.",
    role: "Camp icon cameo",
  },
];

export function normalizeGuess(value: string): string {
  return value.replaceAll(/[^a-z]/gi, "").toUpperCase();
}

export function normalizeRhobhAnswer(value: string): string {
  return normalizeGuess(value);
}

export function getPuzzleKeyForDate(date: Date): string {
  const utcDay = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000,
  );

  return `rhobh-${utcDay}`;
}

export function getPuzzleForKey(puzzleKey: string): RhobhPuzzle {
  const utcDay = Number.parseInt(puzzleKey.replace("rhobh-", ""), 10);

  if (Number.isNaN(utcDay)) {
    return RHOBH_PUZZLES[0];
  }

  return RHOBH_PUZZLES[utcDay % RHOBH_PUZZLES.length];
}

export function getPuzzleForDate(date: Date): RhobhPuzzle {
  return getPuzzleForKey(getPuzzleKeyForDate(date));
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
