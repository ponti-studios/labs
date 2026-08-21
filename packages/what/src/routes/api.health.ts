import type { LoaderFunctionArgs } from "react-router";

import { count, db, desc, eq, gamesPuzzles } from "@pontistudios/db";
import { BRAND_NAME } from "~/config/brand";
import { createLogger } from "~/lib/logger.server";
import { requireAdminAuth } from "~/lib/infrastructure/admin-auth";
import { getDateKey } from "~/lib/puzzle/date";
import { DEFAULT_GAME_SLUG } from "~/lib/generation/catalog";
import { countPendingArticlesForGame } from "~/lib/data/articles.server";
import { getGameBySlug } from "~/lib/data/games.server";
import { countInventoryForRange, loadPuzzleForDate } from "~/lib/data/puzzles.server";

const logger = createLogger();

export async function loader({ request }: LoaderFunctionArgs) {
  const denied = requireAdminAuth(request);
  if (denied) return denied;

  const now = new Date();
  const dateKey = getDateKey(now);
  const requestLogger = logger.child({
    operation: "healthDashboard",
    timestamp: now.toISOString(),
    dateKey,
  });
  const game = await getGameBySlug(DEFAULT_GAME_SLUG);
  if (!game) {
    return Response.json(
      { health: "DEGRADED", error: `game not found: ${DEFAULT_GAME_SLUG}` },
      { status: 500 },
    );
  }

  const [puzzle, totalPuzzles, recentPuzzles, inventoryDepth, pendingArticleDepth] =
    await Promise.all([
      loadPuzzleForDate(game.id, dateKey),
      db
        .select({ value: count() })
        .from(gamesPuzzles)
        .where(eq(gamesPuzzles.gamesTopicId, game.id))
        .then((rows) => rows[0]?.value ?? 0),
      db.query.gamesPuzzles.findMany({
        where: eq(gamesPuzzles.gamesTopicId, game.id),
        orderBy: desc(gamesPuzzles.createdAt),
        limit: 14,
      }),
      countInventoryForRange(game.id, dateKey, 7),
      countPendingArticlesForGame(game.id),
    ]);

  const health = {
    health: puzzle && inventoryDepth >= 2 && totalPuzzles > 0 ? "OK" : "DEGRADED",
    checkedAt: now.toISOString(),
    dateKey,
    puzzle: puzzle
      ? { id: puzzle.id, dateKey: puzzle.dateUtc, answerType: puzzle.answerType, clue: puzzle.clue }
      : null,
    inventory: { depth: inventoryDepth, total: totalPuzzles },
    articleBacklog: { pending: pendingArticleDepth },
    recent: recentPuzzles.map((p) => ({
      id: p.id,
      dateKey: p.dateUtc,
      answerType: p.answerType,
      createdAt: p.createdAt,
    })),
  };

  requestLogger.info(
    { event: "[HEALTH_DASHBOARD_QUERIED]", status: health.health, inventoryDepth },
    "health dashboard queried",
  );
  return Response.json(health);
}
