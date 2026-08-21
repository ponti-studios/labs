import { BRAND_NAME } from "../../config/brand";
import type { GameGuess, LetterState } from "../puzzle/types";

const SHARE_TILES: Record<LetterState, string> = {
  absent: "⬜",
  present: "🟨",
  correct: "🟩",
};

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
  topic?: string,
  date = new Date(),
): string {
  const score = isSolved ? `${guesses.length}/6` : "X/6";
  const rows = guesses.map((guess) => guess.states.map((state) => SHARE_TILES[state]).join(""));
  const topicLabel = topic ? ` · ${topic}` : "";

  return [`${BRAND_NAME}${topicLabel} · ${formatShareDate(date)}`, score, "", ...rows].join("\n");
}
