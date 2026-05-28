import { MAX_GUESSES, evaluateGuess, type LetterState } from "./rhobh-wordle";

const SHARE_TILES: Record<LetterState, string> = {
  absent: "⬜",
  present: "🟨",
  correct: "🟩",
};

export interface ShareRhobhResultOptions {
  answer: string;
  guesses: string[];
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

export function buildRhobhShareText(
  answer: string,
  guesses: string[],
  isSolved: boolean,
  date = new Date(),
) {
  const score = isSolved ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const rows = guesses.map((guess) =>
    evaluateGuess(answer, guess)
      .map((state) => SHARE_TILES[state])
      .join(""),
  );

  return [`RHOBH Wordle - ${formatShareDate(date)}`, score, "", ...rows].join("\n");
}

export async function shareRhobhResult({
  answer,
  guesses,
  isSolved,
  date = new Date(),
  copyToClipboard,
  promptCopy,
}: ShareRhobhResultOptions) {
  const shareText = buildRhobhShareText(answer, guesses, isSolved, date);

  try {
    await copyToClipboard(shareText);
    return { method: "clipboard" as const, shareText };
  } catch {
    promptCopy("Copy your RHOBH result:", shareText);
    return { method: "prompt" as const, shareText };
  }
}
