import type { LoaderFunctionArgs } from "react-router";

import { and, count, db, desc, eq, inArray, rhobhDailyPuzzles } from "@pontistudios/db";
import pino from "pino";

import { requireAdminAuth } from "~/lib/server/admin-auth";
import { addDaysToDateKey, getPuzzleWindow } from "~/lib/realitea-puzzle";
import { getPublishedPuzzle } from "~/lib/realitea-puzzle.server";

const logger = pino(
  process.env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : {},
);

async function getInventoryDepth(fromDateKey: string, days: number): Promise<number> {
  const dateKeys: string[] = [];
  for (let i = 1; i <= days; i++) {
    const key = addDaysToDateKey(fromDateKey, i);
    if (key) dateKeys.push(key);
  }
  if (dateKeys.length === 0) return 0;
  const rows = await db
    .select({ value: count() })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.status, "scheduled"),
        inArray(rhobhDailyPuzzles.scheduledForDateKey, dateKeys),
      ),
    );
  return rows[0]?.value ?? 0;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const denied = requireAdminAuth(request);
  if (denied) return denied;

  const now = new Date();
  const window = getPuzzleWindow(now);
  const requestLogger = logger.child({
    operation: "healthDashboard",
    timestamp: now.toISOString(),
    dateKey: window.dateKey,
  });

  const [published, statusCounts, recentPuzzles, inventoryDepth] = await Promise.all([
    getPublishedPuzzle(now),
    db
      .select({ status: rhobhDailyPuzzles.status, value: count() })
      .from(rhobhDailyPuzzles)
      .groupBy(rhobhDailyPuzzles.status),
    db.query.rhobhDailyPuzzles.findMany({
      orderBy: desc(rhobhDailyPuzzles.createdAt),
      limit: 14,
    }),
    getInventoryDepth(window.dateKey, 7),
  ]);

  const byStatus = Object.fromEntries(statusCounts.map((r) => [r.status, r.value]));
  const totalPuzzles = statusCounts.reduce((sum, r) => sum + r.value, 0);

  const isHealthy = !!published && inventoryDepth >= 2 && totalPuzzles > 0;

  const health = {
    health: isHealthy ? "OK" : "DEGRADED",
    checkedAt: now.toISOString(),
    dateKey: window.dateKey,
    publishWindow: {
      publishAt: window.publishAt.toISOString(),
      expireAt: window.expireAt.toISOString(),
    },
    puzzle: published
      ? {
          id: published.id,
          dateKey: published.scheduledForDateKey,
          answerType: published.answerType,
          clue: published.clue,
        }
      : null,
    inventory: {
      depth: inventoryDepth,
      scheduled: byStatus["scheduled"] ?? 0,
      published: byStatus["published"] ?? 0,
      consumed: byStatus["consumed"] ?? 0,
      total: totalPuzzles,
    },
    recent: recentPuzzles.map((p) => ({
      id: p.id,
      dateKey: p.scheduledForDateKey,
      status: p.status,
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
