import type { GamesTopic } from "~/lib/server/db";

import { addDaysToDateKey, buildDateRange, daysBetweenDateKeys, getDateKey, isDateKey } from "./core/date";
import { generatePuzzleForGame } from "./generation/generate.server";
import {
  countAttemptsByDate,
  deletePuzzlesInRange,
  getExistingDateKeys,
  recordAdminAction,
} from "./server/repository.server";
import { REALITEA_READY_INVENTORY_DAYS } from "./generation/candidate-validation";

export const PRIMARY_PLAYER_TZ = "America/Los_Angeles";
export const MAX_GENERATE_SPAN_DAYS = 14;
export const GENERATE_ACTOR = "system:generate";

export function computeGaps(dateRange: string[], existingKeys: string[]): string[] {
  const existing = new Set(existingKeys);
  return dateRange.filter((dateKey) => !existing.has(dateKey));
}

export function liveDateKeys(now = new Date()): Set<string> {
  return new Set([getDateKey(now, "UTC"), getDateKey(now, PRIMARY_PLAYER_TZ)]);
}

export function isLiveDate(dateKey: string, now = new Date()): boolean {
  return liveDateKeys(now).has(dateKey);
}

export type GenerateWindowInput = {
  force: boolean;
  daysAhead: number;
  from?: string;
  to?: string;
  todayKey: string;
  now?: Date;
};

export type GenerateWindow =
  | { ok: true; fromKey: string; toKey: string; dateKeys: string[]; force: boolean }
  | { ok: false; error: string };

export function resolveGenerateWindow(input: GenerateWindowInput): GenerateWindow {
  if ((input.from === undefined) !== (input.to === undefined)) {
    return { ok: false, error: "--from and --to must be provided together" };
  }

  if (input.from !== undefined && input.to !== undefined) {
    const from = input.from;
    const to = input.to;
    if (!isDateKey(from) || !isDateKey(to)) {
      return { ok: false, error: "--from and --to must be YYYY-MM-DD" };
    }
    const span = daysBetweenDateKeys(from, to);
    if (span === null || span < 0) {
      return { ok: false, error: "--from must be on or before --to" };
    }
    if (span + 1 > MAX_GENERATE_SPAN_DAYS) {
      return { ok: false, error: `range cannot exceed ${MAX_GENERATE_SPAN_DAYS} days` };
    }
    const live = liveDateKeys(input.now);
    if ([...live].some((liveKey) => from <= liveKey)) {
      return { ok: false, error: "range must start after the live UTC and America/Los_Angeles dates" };
    }
    return {
      ok: true,
      fromKey: from,
      toKey: to,
      dateKeys: buildDateRange(from, { endKey: to }),
      force: input.force,
    };
  }

  if (!Number.isInteger(input.daysAhead) || input.daysAhead < 1 || input.daysAhead > MAX_GENERATE_SPAN_DAYS) {
    return { ok: false, error: `--days-ahead must be an integer from 1 to ${MAX_GENERATE_SPAN_DAYS}` };
  }

  const fromKey = addDaysToDateKey(input.todayKey, 1);
  if (!fromKey) return { ok: false, error: "failed to compute tomorrow from todayKey" };
  const dateKeys = buildDateRange(fromKey, { daysAhead: input.daysAhead });
  const toKey = dateKeys[dateKeys.length - 1];
  if (!toKey) return { ok: false, error: "empty generate window" };
  return { ok: true, fromKey, toKey, dateKeys, force: input.force };
}

export async function planGapFill(game: GamesTopic, window: Extract<GenerateWindow, { ok: true }>) {
  const existingKeys = await getExistingDateKeys(game.id, window.fromKey, window.toKey);
  return {
    dateKeys: window.dateKeys,
    existingKeys,
    missingKeys: computeGaps(window.dateKeys, existingKeys),
  };
}

export async function planScopedRegenerate(
  game: GamesTopic,
  window: Extract<GenerateWindow, { ok: true }>,
  now = new Date(),
) {
  const liveInRange = window.dateKeys.filter((dateKey) => isLiveDate(dateKey, now));
  if (liveInRange.length > 0) {
    return { ok: false as const, code: "LIVE_DATE" as const, liveInRange };
  }
  const attemptCounts = await countAttemptsByDate(game.id, window.dateKeys);
  const datesWithAttempts = [...attemptCounts.entries()].filter(([, count]) => count > 0);
  if (datesWithAttempts.length > 0) {
    return { ok: false as const, code: "HAS_ATTEMPTS" as const, datesWithAttempts };
  }
  const existingKeys = await getExistingDateKeys(game.id, window.fromKey, window.toKey);
  return { ok: true as const, dateKeys: window.dateKeys, existingKeys, attemptCounts };
}

export async function gapFillOne(game: GamesTopic, dateKey: string, maxAttempts = 1) {
  return generatePuzzleForGame(game, dateKey, { maxAttempts, actor: GENERATE_ACTOR });
}

export async function runGenerateWindow(game: GamesTopic, window: Extract<GenerateWindow, { ok: true }>) {
  if (window.force) {
    const plan = await planScopedRegenerate(game, window);
    if (!plan.ok) {
      await recordAdminAction({
        kind: "regenerate_dry_run",
        gamesTopicId: game.id,
        payload: { from: window.fromKey, to: window.toKey, code: plan.code },
        result: plan,
      });
      return { deletedCount: 0, generatedCount: 0, failedCount: 0, aborted: plan };
    }
    const deletedCount = await deletePuzzlesInRange(game.id, window.fromKey, window.toKey);
    let generatedCount = 0;
    let failedCount = 0;
    for (const dateKey of window.dateKeys) {
      const puzzle = await generatePuzzleForGame(game, dateKey, { actor: GENERATE_ACTOR });
      if (puzzle) generatedCount++;
      else failedCount++;
    }
    await recordAdminAction({
      kind: "gap_fill",
      gamesTopicId: game.id,
      payload: { force: true, from: window.fromKey, to: window.toKey },
      result: { deletedCount, generatedCount, failedCount },
    });
    return { deletedCount, generatedCount, failedCount, aborted: null };
  }

  const plan = await planGapFill(game, window);
  let generatedCount = 0;
  let failedCount = 0;
  for (const dateKey of plan.missingKeys) {
    const puzzle = await generatePuzzleForGame(game, dateKey, { actor: GENERATE_ACTOR });
    if (puzzle) generatedCount++;
    else failedCount++;
  }
  await recordAdminAction({
    kind: "gap_fill",
    gamesTopicId: game.id,
    dateUtc: window.fromKey,
    payload: { force: false, from: window.fromKey, to: window.toKey, missing: plan.missingKeys },
    result: { generatedCount, failedCount },
  });
  return { deletedCount: 0, generatedCount, failedCount, aborted: null };
}

export { REALITEA_READY_INVENTORY_DAYS };
