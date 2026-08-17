import type { LetterState, WhatGuess } from "../core/types";

const SHARE_TILES: Record<LetterState, string> = {
  absent: "⬜",
  present: "🟨",
  correct: "🟩",
};

interface ShareWhatResultOptions {
  guesses: readonly WhatGuess[];
  isSolved: boolean;
  date?: Date;
  copyToClipboard: (text: string) => Promise<void>;
  promptCopy: (message: string, text: string) => void;
}

function formatShareDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function buildWhatShareText(
  guesses: readonly WhatGuess[],
  isSolved: boolean,
  date = new Date(),
): string {
  const score = isSolved ? `${guesses.length}/6` : "X/6";
  const rows = guesses.map((guess) => guess.states.map((state) => SHARE_TILES[state]).join(""));

  return [`WH?T - ${formatShareDate(date)}`, score, "", ...rows].join("\n");
}

export async function shareWhatResult({
  guesses,
  isSolved,
  date = new Date(),
  copyToClipboard,
  promptCopy,
}: ShareWhatResultOptions) {
  const shareText = buildWhatShareText(guesses, isSolved, date);

  try {
    await copyToClipboard(shareText);
    return { method: "clipboard" as const, shareText };
  } catch {
    promptCopy("Copy your WH?T result:", shareText);
    return { method: "prompt" as const, shareText };
  }
}
