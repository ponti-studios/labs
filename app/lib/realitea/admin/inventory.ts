import { addDaysToDateKey, buildDateRange, getDateKey } from "../core/date";
import { isLiveDate, liveDateKeys, PRIMARY_PLAYER_TZ, REALITEA_READY_INVENTORY_DAYS } from "../ops";
import {
  countAttemptsByDate,
  countInventoryForRange,
  countPendingArticlesForGame,
  getActiveGames,
  getExistingDateKeys,
  getGameBySlug,
  loadPuzzleForDate,
} from "../server/repository.server";

export type InventoryCellState = "live" | "ready" | "missing";

export type InventoryCell = {
  dateKey: string;
  state: InventoryCellState;
  isUtcToday: boolean;
  isPacificToday: boolean;
  attemptCount: number;
};

export function buildInventoryCells(input: {
  now: Date;
  existingKeys: string[];
  attemptCounts: Map<string, number>;
}): InventoryCell[] {
  const utcToday = getDateKey(input.now, "UTC");
  const pacificToday = getDateKey(input.now, PRIMARY_PLAYER_TZ);
  const startKey = addDaysToDateKey(utcToday, -7);
  if (!startKey) return [];
  const dateKeys = buildDateRange(startKey, { daysAhead: 7 + 1 + REALITEA_READY_INVENTORY_DAYS });
  const existing = new Set(input.existingKeys);
  const live = liveDateKeys(input.now);

  return dateKeys.map((dateKey) => {
    const hasPuzzle = existing.has(dateKey);
    const state: InventoryCellState = !hasPuzzle
      ? "missing"
      : live.has(dateKey)
        ? "live"
        : "ready";
    return {
      dateKey,
      state,
      isUtcToday: dateKey === utcToday,
      isPacificToday: dateKey === pacificToday,
      attemptCount: input.attemptCounts.get(dateKey) ?? 0,
    };
  });
}

export async function resolveAdminGame(slug: string) {
  const requested = await getGameBySlug(slug);
  if (requested) return requested;
  const [fallback] = await getActiveGames();
  return fallback ?? null;
}

export async function loadAdminOverview(slug: string, now = new Date()) {
  const game = await resolveAdminGame(slug);
  if (!game) return null;

  const utcToday = getDateKey(now, "UTC");
  const startKey = addDaysToDateKey(utcToday, -7);
  const endKey = addDaysToDateKey(utcToday, REALITEA_READY_INVENTORY_DAYS);
  if (!startKey || !endKey) return null;

  const [existingKeys, pendingArticles, inventoryDepth, todayPuzzle] = await Promise.all([
    getExistingDateKeys(game.id, startKey, endKey),
    countPendingArticlesForGame(game.id),
    countInventoryForRange(game.id, utcToday, REALITEA_READY_INVENTORY_DAYS),
    loadPuzzleForDate(game.id, utcToday),
  ]);
  const dateKeys = buildDateRange(startKey, { endKey });
  const attemptCounts = await countAttemptsByDate(game.id, dateKeys);

  return {
    game: { id: game.id, slug: game.slug, name: game.name, feedLabel: game.feedLabel },
    utcToday,
    pacificToday: getDateKey(now, PRIMARY_PLAYER_TZ),
    pendingArticles,
    inventoryDepth,
    todayPuzzlePresent: todayPuzzle !== null,
    cells: buildInventoryCells({ now, existingKeys, attemptCounts }),
  };
}

export async function loadAdminDate(slug: string, dateKey: string, now = new Date()) {
  const game = await resolveAdminGame(slug);
  if (!game) return null;
  const [puzzle, attemptCounts] = await Promise.all([
    loadPuzzleForDate(game.id, dateKey),
    countAttemptsByDate(game.id, [dateKey]),
  ]);
  return {
    game: { id: game.id, slug: game.slug, name: game.name },
    dateKey,
    live: isLiveDate(dateKey, now),
    attemptCount: attemptCounts.get(dateKey) ?? 0,
    puzzle: puzzle
      ? {
          id: puzzle.id,
          answer: puzzle.answer,
          answerType: puzzle.answerType,
          clue: puzzle.clue,
          detail: puzzle.detail,
          promptPath: puzzle.promptPath,
          model: puzzle.model,
          publishedAt: puzzle.publishedAt,
          article: {
            id: puzzle.article.id,
            url: puzzle.article.url,
            title: puzzle.article.title,
            status: puzzle.article.status,
            rejectionCount: puzzle.article.rejectionCount,
            rejectionReason: puzzle.article.rejectionReason,
            articleTextLength: puzzle.article.articleText?.length ?? 0,
          },
        }
      : null,
  };
}
