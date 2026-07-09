import type { LoaderFunctionArgs } from "react-router";

import { count, dailyPuzzles, db, desc, eq } from "@pontistudios/db";

import { createLogger } from "~/lib/logger.server";
import { requireAdminAuth } from "~/lib/server/admin-auth";
import { getDateKey } from "~/lib/realitea/date";
import {
  countInventoryForRange,
  countPendingArticlesForGame,
  getGameBySlug,
  loadPuzzleForDate,
} from "~/lib/realitea/repository";

const logger = createLogger();
const RHOBH_GAME_SLUG = "rhobh";

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

  const game = await getGameBySlug(RHOBH_GAME_SLUG);
  if (!game) {
    return Response.json(
      { health: "DEGRADED", error: `game not found: ${RHOBH_GAME_SLUG}` },
      {
        status: 500,
      },
    );
  }

  const [puzzle, totalPuzzles, recentPuzzles, inventoryDepth, pendingArticleDepth] =
    await Promise.all([
      loadPuzzleForDate(game.id, dateKey),
      db
        .select({ value: count() })
        .from(dailyPuzzles)
        .where(eq(dailyPuzzles.gameId, game.id))
        .then((rows) => rows[0]?.value ?? 0),
      db.query.dailyPuzzles.findMany({
        where: eq(dailyPuzzles.gameId, game.id),
        orderBy: desc(dailyPuzzles.createdAt),
        limit: 14,
      }),
      countInventoryForRange(game.id, dateKey, 7),
      countPendingArticlesForGame(game.id),
    ]);

  const isHealthy = !!puzzle && inventoryDepth >= 2 && totalPuzzles > 0;

  const health = {
    health: isHealthy ? "OK" : "DEGRADED",
    checkedAt: now.toISOString(),
    dateKey,
    puzzle: puzzle
      ? {
          id: puzzle.id,
          dateKey: puzzle.dateUtc,
          answerType: puzzle.answerType,
          clue: puzzle.clue,
        }
      : null,
    inventory: {
      depth: inventoryDepth,
      total: totalPuzzles,
    },
    articleBacklog: {
      pending: pendingArticleDepth,
    },
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
