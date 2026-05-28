/**
 * Server-only word list module.
 *
 * Word files are bundled into the server at build time via Vite ?raw imports.
 * They are never included in the client bundle and never served to the browser.
 */
import words4 from "../data/words/4.txt?raw";
import words5 from "../data/words/5.txt?raw";
import words6 from "../data/words/6.txt?raw";
import words7 from "../data/words/7.txt?raw";
import words8 from "../data/words/8.txt?raw";
import words9 from "../data/words/9.txt?raw";
import words10 from "../data/words/10.txt?raw";

import { getStoredRhobhAnswersForValidation } from "./server/rhobh-daily-puzzle";
import { RHOBH_PUZZLES } from "./rhobh-wordle";

const RAW_BY_LENGTH: Record<number, string> = {
  4: words4,
  5: words5,
  6: words6,
  7: words7,
  8: words8,
  9: words9,
  10: words10,
};

const cache = new Map<number, Set<string>>();

function getWordSet(length: number): Set<string> {
  if (cache.has(length)) return cache.get(length)!;

  const raw = RAW_BY_LENGTH[length];
  const set: Set<string> = raw
    ? new Set(raw.split("\n").map((w) => w.trim()).filter(Boolean))
    : new Set();

  // Always accept RHOBH puzzle answers regardless of whether they appear
  // in the standard dictionary (they are proper names so they won't).
  for (const puzzle of RHOBH_PUZZLES) {
    if (puzzle.answer.length === length) set.add(puzzle.answer);
  }

  cache.set(length, set);
  return set;
}

export async function isValidWord(word: string): Promise<boolean> {
  const upper = word.toUpperCase().trim();

  if (getWordSet(upper.length).has(upper)) {
    return true;
  }

  const storedAnswers = await getStoredRhobhAnswersForValidation();
  return storedAnswers.has(upper);
}
