import type { LoaderFunctionArgs } from "react-router";

import { count, db, desc, inArray, rhobhDailyPuzzles } from "@pontistudios/db";
import pino from "pino";

import { requireAdminAuth } from "~/lib/server/admin-auth";
import { addDaysToDateKey, getDateKey } from "~/lib/realitea-date";
import { loadPuzzleForDate } from "~/lib/realitea-db";

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
    .where(inArray(rhobhDailyPuzzles.dateUtc, dateKeys));
  return rows[0]?.value ?? 0;
}

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

  const [puzzle, totalPuzzles, recentPuzzles, inventoryDepth] = await Promise.all([
    loadPuzzleForDate(dateKey),
    db
      .select({ value: count() })
      .from(rhobhDailyPuzzles)
      .then((rows) => rows[0]?.value ?? 0),
    db.query.rhobhDailyPuzzles.findMany({
      orderBy: desc(rhobhDailyPuzzles.createdAt),
      limit: 14,
    }),
    getInventoryDepth(dateKey, 7),
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
