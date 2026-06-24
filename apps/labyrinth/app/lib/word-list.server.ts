/**
 * Server-only word list module.
 *
 * Word files are bundled into the server at build time via Vite ?raw imports.
 * They are never included in the client bundle and never served to the browser.
 */
import words5 from "../data/words/5.txt?raw";

import { getStoredAnswersForValidation } from "./realitea-db";
import { REALITEA_ANSWER_LENGTH } from "./realitea";

const wordSet = new Set(
  words5
    .split("\n")
    .map((w) => w.trim())
    .filter(Boolean),
);

export async function isValidWord(word: string): Promise<boolean> {
  const upper = word.toUpperCase().trim();

  if (upper.length !== REALITEA_ANSWER_LENGTH) {
    return false;
  }

  if (wordSet.has(upper)) {
    return true;
  }

  const storedAnswers = await getStoredAnswersForValidation();
  return storedAnswers.has(upper);
}
