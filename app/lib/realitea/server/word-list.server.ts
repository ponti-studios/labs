/**
 * Server-only word list module.
 *
 * Reads the official 5-letter word list from the application source layout. The
 * Docker image preserves this path so local development, scripts, and SSR use the
 * same location.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { getStoredAnswers } from "./repository.server";
import { REALITEA_ANSWER_LENGTH } from "../core/rules";

const wordListPath = resolve(process.cwd(), "app/data/words/5.txt");

const wordSet = new Set(
  readFileSync(wordListPath, "utf-8")
    .split("\n")
    .map((w) => w.trim())
    .filter(Boolean),
);

export function isDictionaryWord(word: string): boolean {
  return wordSet.has(word.toUpperCase().trim());
}

export async function isValidWord(word: string, gameId: number): Promise<boolean> {
  const upper = word.toUpperCase().trim();

  if (upper.length !== REALITEA_ANSWER_LENGTH) {
    return false;
  }

  if (isDictionaryWord(upper)) {
    return true;
  }

  const storedAnswers = await getStoredAnswers(gameId);
  return storedAnswers.has(upper);
}
