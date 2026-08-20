import type { GamesTopic } from "~/lib/server/db";

import {
  CIRCUIT_BREAKER_THRESHOLD,
  createCircuitBreaker,
  recordCircuitAttempt,
  type CircuitBreaker,
} from "./circuit-breaker";
import { isLiveDate, type GenerateRange } from "./generate-range";
import { GAME_READY_INVENTORY_DAYS } from "./generation/candidate-validation";
import { generatePuzzleForGame } from "./generation/generate.server";
import { recordAdminAction } from "./server/admin-actions.server";
import { countAttemptsByDate } from "./server/attempts.server";
import { deletePuzzlesInRange, getExistingDateKeys } from "./server/puzzles.server";

export const GENERATE_ACTOR = "system:generate";

export async function planGapFill(game: GamesTopic, range: Extract<GenerateRange, { ok: true }>) {
  const existingKeys = await getExistingDateKeys(game.id, range.fromKey, range.toKey);
  const existing = new Set(existingKeys);
  return {
    dateKeys: range.dateKeys,
    existingKeys,
    missingKeys: range.dateKeys.filter((dateKey) => !existing.has(dateKey)),
  };
}

export async function planScopedRegenerate(
  game: GamesTopic,
  range: Extract<GenerateRange, { ok: true }>,
  now = new Date(),
) {
  const liveInRange = range.dateKeys.filter((dateKey) => isLiveDate(dateKey, now));
  if (liveInRange.length > 0)
    return { ok: false as const, code: "LIVE_DATE" as const, liveInRange };
  const attemptCounts = await countAttemptsByDate(game.id, range.dateKeys);
  const datesWithAttempts = [...attemptCounts.entries()].filter(([, count]) => count > 0);
  if (datesWithAttempts.length > 0)
    return { ok: false as const, code: "HAS_ATTEMPTS" as const, datesWithAttempts };
  const existingKeys = await getExistingDateKeys(game.id, range.fromKey, range.toKey);
  return { ok: true as const, dateKeys: range.dateKeys, existingKeys, attemptCounts };
}

export async function gapFillOne(game: GamesTopic, dateKey: string, maxAttempts = 1) {
  return generatePuzzleForGame(game, dateKey, { maxAttempts, actor: GENERATE_ACTOR });
}

async function recordCircuitOpen(
  game: GamesTopic,
  dateKey: string,
  circuit: CircuitBreaker,
): Promise<void> {
  await recordAdminAction({
    kind: "generation_circuit_open",
    gamesTopicId: game.id,
    dateUtc: dateKey,
    payload: {
      consecutiveFailures: circuit.consecutiveFailures,
      threshold: CIRCUIT_BREAKER_THRESHOLD,
    },
  });
}

async function generateDates(game: GamesTopic, dateKeys: string[], circuit: CircuitBreaker) {
  let generatedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  let circuitOpened = false;
  for (const dateKey of dateKeys) {
    if (circuit.open) {
      skippedCount++;
      continue;
    }
    const puzzle = await generatePuzzleForGame(game, dateKey, { actor: GENERATE_ACTOR });
    if (puzzle) generatedCount++;
    else failedCount++;
    if (recordCircuitAttempt(circuit, puzzle !== null)) {
      circuitOpened = true;
      await recordCircuitOpen(game, dateKey, circuit);
    }
  }
  return { generatedCount, failedCount, skippedCount, circuitOpened };
}

export async function runGenerateRange(
  game: GamesTopic,
  range: Extract<GenerateRange, { ok: true }>,
  circuit: CircuitBreaker = createCircuitBreaker(),
) {
  if (range.force) {
    const plan = await planScopedRegenerate(game, range);
    if (!plan.ok) {
      await recordAdminAction({
        kind: "regenerate_dry_run",
        gamesTopicId: game.id,
        payload: { from: range.fromKey, to: range.toKey, code: plan.code },
        result: plan,
      });
      return {
        deletedCount: 0,
        generatedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        circuitOpened: false,
        aborted: plan,
      };
    }
    const deletedCount = await deletePuzzlesInRange(game.id, range.fromKey, range.toKey);
    const result = await generateDates(game, range.dateKeys, circuit);
    await recordAdminAction({
      kind: "gap_fill",
      gamesTopicId: game.id,
      payload: { force: true, from: range.fromKey, to: range.toKey },
      result: { deletedCount, ...result },
    });
    return { deletedCount, ...result, aborted: null };
  }

  const plan = await planGapFill(game, range);
  const result = await generateDates(game, plan.missingKeys, circuit);
  await recordAdminAction({
    kind: "gap_fill",
    gamesTopicId: game.id,
    dateUtc: range.fromKey,
    payload: { force: false, from: range.fromKey, to: range.toKey, missing: plan.missingKeys },
    result,
  });
  return { deletedCount: 0, ...result, aborted: null };
}

export { GAME_READY_INVENTORY_DAYS };
