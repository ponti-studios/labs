import { BRAND_NAME } from "../../config/brand";
import type { LetterState, GameGuess } from "./types";

const SHARE_TILES: Record<LetterState, string> = {
  absent: "⬜",
  present: "🟨",
  correct: "🟩",
};

interface ShareGameResultOptions {
  guesses: readonly GameGuess[];
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

export function buildGameShareText(
  guesses: readonly GameGuess[],
  isSolved: boolean,
  date = new Date(),
): string {
  const score = isSolved ? `${guesses.length}/6` : "X/6";
  const rows = guesses.map((guess) => guess.states.map((state) => SHARE_TILES[state]).join(""));

  return [`${BRAND_NAME} - ${formatShareDate(date)}`, score, "", ...rows].join("\n");
}

export async function shareGameResult({
  guesses,
  isSolved,
  date = new Date(),
  copyToClipboard,
  promptCopy,
}: ShareGameResultOptions) {
  const shareText = buildGameShareText(guesses, isSolved, date);

  try {
    await copyToClipboard(shareText);
    return { method: "clipboard" as const, shareText };
  } catch {
    promptCopy(`Copy your ${BRAND_NAME} result:`, shareText);
    return { method: "prompt" as const, shareText };
  }
}
