/**
 * Server-only word list module.
 *
 * Reads the official 5-letter word list from disk.  In Vite dev & production SSR
 * this resolves against the source tree (dev) or build output (prod, after the
 * Dockerfile copies the words directory into the bundle).  When executed directly
 * via `tsx` (e.g. the reconcile script) it also resolves correctly from source.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { getStoredAnswers } from "./realitea/repository";
import { REALITEA_ANSWER_LENGTH } from "./realitea";

const __dirname = dirname(fileURLToPath(import.meta.url));

const wordSet = new Set(
  readFileSync(resolve(__dirname, "../data/words/5.txt"), "utf-8")
    .split("\n")
    .map((w) => w.trim())
    .filter(Boolean),
);

export async function isValidWord(word: string, gameId: number): Promise<boolean> {
  const upper = word.toUpperCase().trim();

  if (upper.length !== REALITEA_ANSWER_LENGTH) {
    return false;
  }

  if (wordSet.has(upper)) {
    return true;
  }

  const storedAnswers = await getStoredAnswers(gameId);
  return storedAnswers.has(upper);
}
