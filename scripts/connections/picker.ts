/**
 * Pure, DB-free prototype of the Connections daily-picker.
 *
 * Model: content generation produces independent 4-word "groups" (a category
 * bank). A daily puzzle is assembled at serve time by picking one group per
 * difficulty tier such that:
 *   - none of the 16 words repeat across the 4 chosen groups,
 *   - no word in one group is a "risk word" (plausible-but-wrong member) of
 *     another chosen group,
 *   - no chosen group was used within the cooldown window.
 *
 * Nothing here touches a database — usage history is passed in as a plain
 * Map so this can be exercised entirely with fixture data.
 */

export type Difficulty = "yellow" | "green" | "blue" | "purple";

export const DIFFICULTY_ORDER: readonly Difficulty[] = ["yellow", "green", "blue", "purple"];

export interface CategoryGroup {
  id: string;
  category: string;
  difficulty: Difficulty;
  words: readonly [string, string, string, string];
  /** Words NOT in this group that a solver could plausibly mistake for a member. */
  riskWords?: readonly string[];
}

export interface PickOptions {
  cooldownDays?: number;
  rng?: () => number;
  /** Backtracking budget per tier before giving up (perf/safety valve). */
  maxAttemptsPerTier?: number;
}

export interface PickSuccess {
  ok: true;
  groups: CategoryGroup[];
  attempts: number;
}

export interface PickFailure {
  ok: false;
  reason: string;
  tier?: Difficulty;
  attempts: number;
}

export type PickResult = PickSuccess | PickFailure;

const DAY_MS = 86_400_000;

export function daysBetween(fromISODate: string, toISODate: string): number {
  const from = Date.parse(`${fromISODate}T00:00:00Z`);
  const to = Date.parse(`${toISODate}T00:00:00Z`);
  return Math.round((to - from) / DAY_MS);
}

export function isOffCooldown(
  group: CategoryGroup,
  asOfISODate: string,
  usage: ReadonlyMap<string, string>,
  cooldownDays: number,
): boolean {
  const lastUsed = usage.get(group.id);
  if (!lastUsed) return true;
  return daysBetween(lastUsed, asOfISODate) >= cooldownDays;
}

function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

/**
 * Two groups collide if they'd make a bad daily grid together: either a
 * literal shared word, or one group's word is listed as a risk word of the
 * other (an unintended second plausible category for that tile).
 */
export function groupsCollide(a: CategoryGroup, b: CategoryGroup): boolean {
  const aWords = new Set(a.words.map(normalizeWord));
  const bWords = new Set(b.words.map(normalizeWord));
  for (const w of bWords) {
    if (aWords.has(w)) return true;
  }

  const aRisk = new Set((a.riskWords ?? []).map(normalizeWord));
  const bRisk = new Set((b.riskWords ?? []).map(normalizeWord));
  for (const w of bWords) {
    if (aRisk.has(w)) return true;
  }
  for (const w of aWords) {
    if (bRisk.has(w)) return true;
  }
  return false;
}

function collidesWithAny(candidate: CategoryGroup, chosen: readonly CategoryGroup[]): boolean {
  return chosen.some((g) => groupsCollide(candidate, g));
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Picks one collision-free group per difficulty tier via backtracking
 * search over randomly-shuffled per-tier candidate lists. Tiers are tried
 * easiest-first since that's the smallest realistic bank slice in practice
 * (fewest cheap/obvious categories tends to be the tightest constraint).
 */
export function pickDailyGroups(
  bank: readonly CategoryGroup[],
  asOfISODate: string,
  usage: ReadonlyMap<string, string>,
  options: PickOptions = {},
): PickResult {
  const cooldownDays = options.cooldownDays ?? 180;
  const rng = options.rng ?? Math.random;
  const maxAttemptsPerTier = options.maxAttemptsPerTier ?? 500;

  const eligibleByTier = new Map<Difficulty, CategoryGroup[]>();
  for (const tier of DIFFICULTY_ORDER) {
    const eligible = bank.filter((g) => g.difficulty === tier && isOffCooldown(g, asOfISODate, usage, cooldownDays));
    if (eligible.length === 0) {
      return { ok: false, reason: `no eligible groups for tier "${tier}"`, tier, attempts: 0 };
    }
    eligibleByTier.set(tier, shuffle(eligible, rng));
  }

  const chosen: CategoryGroup[] = [];
  const attemptBudget = maxAttemptsPerTier * DIFFICULTY_ORDER.length;
  let attempts = 0;
  let budgetExceeded = false;

  function backtrack(tierIndex: number): boolean {
    if (tierIndex === DIFFICULTY_ORDER.length) return true;
    const tier = DIFFICULTY_ORDER[tierIndex] as Difficulty;
    const candidates = eligibleByTier.get(tier);
    if (!candidates) return false;
    for (const candidate of candidates) {
      attempts++;
      if (attempts > attemptBudget) {
        budgetExceeded = true;
        return false;
      }
      if (collidesWithAny(candidate, chosen)) continue;
      chosen.push(candidate);
      if (backtrack(tierIndex + 1)) return true;
      chosen.pop();
    }
    return false;
  }

  const found = backtrack(0);
  if (!found) {
    return {
      ok: false,
      reason: budgetExceeded
        ? "exceeded backtracking attempt budget"
        : "exhausted candidate combinations without a collision-free set",
      attempts,
    };
  }
  return { ok: true, groups: chosen, attempts };
}

export function toGrid(groups: readonly CategoryGroup[], rng: () => number = Math.random): string[] {
  const words = groups.flatMap((g) => g.words);
  return shuffle(words, rng);
}
