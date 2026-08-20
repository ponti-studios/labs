import type { CategoryGroup, Difficulty } from "./picker";
import { DIFFICULTY_ORDER, shuffle } from "./picker";

export interface SyntheticBankOptions {
  size: number;
  /** Shared word pool every group draws from. Smaller = more literal collisions. */
  vocabSize: number;
  /** Fraction of groups that get 1-2 risk words drawn from the same pool. */
  riskWordRate?: number;
  rng?: () => number;
}

function buildVocab(size: number): string[] {
  return Array.from({ length: size }, (_, i) => `word-${i}`);
}

/**
 * Generates a large, randomized category bank for scale/performance testing.
 * Words are drawn from a shared, size-controlled vocabulary so collision
 * density (and therefore backtracking pressure) is tunable: a small
 * vocabSize relative to bank size simulates a "tight" content domain where
 * literal word reuse across groups is common.
 */
export function generateSyntheticBank(options: SyntheticBankOptions): CategoryGroup[] {
  const rng = options.rng ?? Math.random;
  const riskWordRate = options.riskWordRate ?? 0.15;
  const vocab = buildVocab(options.vocabSize);

  const bank: CategoryGroup[] = [];
  for (let i = 0; i < options.size; i++) {
    const difficulty = DIFFICULTY_ORDER[i % DIFFICULTY_ORDER.length] as Difficulty;
    const picked = shuffle(vocab, rng).slice(0, 4) as [string, string, string, string];

    let riskWords: string[] | undefined;
    if (rng() < riskWordRate) {
      const remaining = vocab.filter((w) => !picked.includes(w));
      riskWords = shuffle(remaining, rng).slice(0, 1 + Math.floor(rng() * 2));
    }

    bank.push({
      id: `synthetic-${i}`,
      category: `Synthetic Category ${i}`,
      difficulty,
      words: picked,
      riskWords,
    });
  }
  return bank;
}
