/**
 * Data-access layer for the RealiTea puzzle domain (`games`, `feeds`,
 * `feed_games`, `articles`, `daily_puzzles` — physically still named
 * `rhobh_daily_puzzles`, see packages/db/src/schema/realitea.ts).
 *
 * All exported functions are standalone — there is no class wrapper because
 * the module has zero instance state. Every function operates on the shared
 * `db` instance from `@pontistudios/db`, and functions are independently
 * importable for tree-shaking and targeted test mocking.
 *
 * Puzzles are queried by (gameId, dateUtc) — the intended game and date they
 * should be served on. There is no promotion or status lifecycle; puzzles
 * are created for their date and served directly.
 *
 * Article reuse is prevented structurally, not by scanning history: once an
 * article is consumed by a puzzle its `status` flips to 'used' and it drops
 * out of every future `status = 'pending'` selection query.
 */

import type { Article, DailyPuzzle, Game, RealiteaAttempt } from "~/lib/server/db";
import {
  and,
  articles,
  count,
  dailyPuzzles,
  db,
  desc,
  eq,
  feedGames,
  games,
  gte,
  inArray,
  lt,
  lte,
  realiteaAttempts,
  sql,
} from "~/lib/server/db";

import { addDaysToDateKey, buildDateRange, getDateKey } from "./date";
import type { PuzzleRecord } from "./types";

// ── Games ────────────────────────────────────────────────────────────────────

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const row = await db.query.games.findFirst({ where: eq(games.slug, slug) });
  return row ?? null;
}

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Collect all unique normalized answers from this game's repeat-cooldown
 * window (`game.repeatWindowDays` days back from `date`).
 *
 * Used during puzzle generation to avoid repeating an answer that was used
 * too recently within the same game.
 */
export async function getRecentAnswers(game: Game, date: Date): Promise<Set<string>> {
  const cutoff = new Date(date);
  cutoff.setUTCDate(cutoff.getUTCDate() - game.repeatWindowDays);
  const cutoffDateValue = getDateKey(cutoff);
  const rows = await db
    .select({ normalizedAnswer: dailyPuzzles.normalizedAnswer })
    .from(dailyPuzzles)
    .where(and(eq(dailyPuzzles.gameId, game.id), gte(dailyPuzzles.dateUtc, cutoffDateValue)));
  return new Set(rows.map((r) => r.normalizedAnswer));
}

/**
 * Collect all unique normalized answers ever stored for this game.
 *
 * Used both during generation (to avoid clashes with existing inventory) and
 * during word validation (to allow stored puzzle answers as valid guesses).
 */
export async function getStoredAnswers(gameId: number): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: dailyPuzzles.normalizedAnswer })
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.gameId, gameId));
  return new Set(rows.map((r) => r.normalizedAnswer));
}

/**
 * Find the puzzle for a given game and date key, preferring the most
 * recently created record if multiple exist, joined with the article it
 * was generated from.
 *
 * Returns `null` if no puzzle exists for that date.
 */
export async function loadPuzzleForDate(
  gameId: number,
  dateKey: string,
): Promise<PuzzleRecord | null> {
  const rows = await db
    .select({ puzzle: dailyPuzzles, article: articles })
    .from(dailyPuzzles)
    .innerJoin(articles, eq(dailyPuzzles.articleId, articles.id))
    .where(and(eq(dailyPuzzles.gameId, gameId), eq(dailyPuzzles.dateUtc, dateKey)))
    .orderBy(desc(dailyPuzzles.createdAt))
    .limit(1);
  const row = rows[0];
  return row ? { ...row.puzzle, article: row.article } : null;
}

/**
 * Most-recently-created puzzle for a game, regardless of date. Used as a
 * last-resort fallback when nothing exists for the requested date.
 */
export async function loadMostRecentPuzzle(gameId: number): Promise<PuzzleRecord | null> {
  const rows = await db
    .select({ puzzle: dailyPuzzles, article: articles })
    .from(dailyPuzzles)
    .innerJoin(articles, eq(dailyPuzzles.articleId, articles.id))
    .where(eq(dailyPuzzles.gameId, gameId))
    .orderBy(desc(dailyPuzzles.createdAt))
    .limit(1);
  const row = rows[0];
  return row ? { ...row.puzzle, article: row.article } : null;
}

// ── Article inventory (ingest + selection) ──────────────────────────────────

/**
 * Insert newly-seen articles for a feed, deduped globally on `url`.
 * Re-ingesting a feed that returns the same items is a no-op.
 */
export async function upsertArticles(
  feedId: number,
  items: {
    url: string;
    title: string;
    description?: string;
    imageUrl?: string;
    publishedAt?: Date;
  }[],
): Promise<number> {
  if (items.length === 0) return 0;
  const inserted = await db
    .insert(articles)
    .values(
      items.map((item) => ({
        feedId,
        url: item.url,
        title: item.title,
        description: item.description ?? null,
        imageUrl: item.imageUrl ?? null,
        publishedAt: item.publishedAt ?? null,
      })),
    )
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });
  return inserted.length;
}

/**
 * Pending articles eligible for `game` (reachable via one of its feeds),
 * oldest published first, capped at `limit`.
 */
export async function getPendingArticlesForGame(game: Game, limit: number): Promise<Article[]> {
  const rows = await db
    .select({ article: articles })
    .from(articles)
    .innerJoin(feedGames, eq(feedGames.feedId, articles.feedId))
    .where(and(eq(feedGames.gameId, game.id), eq(articles.status, "pending")))
    .orderBy(articles.publishedAt)
    .limit(limit);
  return rows.map((r) => r.article);
}

export async function markArticleUsed(articleId: number): Promise<void> {
  await db.update(articles).set({ status: "used" }).where(eq(articles.id, articleId));
}

/**
 * Record a failed generation attempt against its source article. Retries
 * with a cap: the article goes back to 'pending' until `rejectionCount`
 * exceeds `maxRejections`, then it's permanently marked 'rejected'.
 */
export async function recordArticleRejection(
  articleId: number,
  reason: string,
  maxRejections: number,
): Promise<void> {
  const row = await db.query.articles.findFirst({ where: eq(articles.id, articleId) });
  if (!row) return;
  const rejectionCount = row.rejectionCount + 1;
  await db
    .update(articles)
    .set({
      rejectionCount,
      rejectionReason: reason,
      status: rejectionCount > maxRejections ? "rejected" : "pending",
    })
    .where(eq(articles.id, articleId));
}

/**
 * Mark pending articles older than `game.articleExpiryDays` as 'expired' so
 * they drop out of future selection. Returns the number expired.
 */
export async function expireStaleArticles(game: Game, now: Date): Promise<number> {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - game.articleExpiryDays);
  const result = await db
    .update(articles)
    .set({ status: "expired" })
    .where(
      and(
        eq(articles.status, "pending"),
        lt(articles.publishedAt, cutoff),
        inArray(
          articles.feedId,
          db
            .select({ feedId: feedGames.feedId })
            .from(feedGames)
            .where(eq(feedGames.gameId, game.id)),
        ),
      ),
    )
    .returning({ id: articles.id });
  return result.length;
}

/** Count of pending (usable) articles for a game — the ingest backlog depth. */
export async function countPendingArticlesForGame(gameId: number): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(articles)
    .innerJoin(feedGames, eq(feedGames.feedId, articles.feedId))
    .where(and(eq(feedGames.gameId, gameId), eq(articles.status, "pending")));
  return rows[0]?.value ?? 0;
}

// ── Inventory helpers ─────────────────────────────────────────────────────────

/**
 * Count the number of puzzle records for `gameId` in the inventory window
 * that starts one day after `fromDateKey` and extends `days` days forward.
 *
 * Used by health checks to verify adequate future puzzle coverage.
 */
export async function countInventoryForRange(
  gameId: number,
  fromDateKey: string,
  days: number,
): Promise<number> {
  const startKey = addDaysToDateKey(fromDateKey, 1);
  if (!startKey) return 0;
  const dateKeys = buildDateRange(startKey, { daysAhead: days });
  if (dateKeys.length === 0) return 0;
  const [row] = await db
    .select({ value: count() })
    .from(dailyPuzzles)
    .where(and(eq(dailyPuzzles.gameId, gameId), inArray(dailyPuzzles.dateUtc, dateKeys)));
  return row?.value ?? 0;
}

/**
 * Return the `date_utc` values that already have a puzzle for `gameId` in
 * [fromKey, toKey].
 *
 * Used by the reconcile script to determine which dates need gap-filling
 * without an inline Drizzle query.
 */
export async function getExistingDateKeys(
  gameId: number,
  fromKey: string,
  toKey: string,
): Promise<string[]> {
  const rows = await db
    .select({ dateUtc: dailyPuzzles.dateUtc })
    .from(dailyPuzzles)
    .where(
      and(
        eq(dailyPuzzles.gameId, gameId),
        gte(dailyPuzzles.dateUtc, fromKey),
        lte(dailyPuzzles.dateUtc, toKey),
      ),
    );
  return rows.map((r) => r.dateUtc);
}

/**
 * Delete all puzzles for `gameId` whose `dateUtc` is >= `fromDateKey`.
 *
 * Returns the number of deleted records.
 */
export async function deletePuzzlesFromDate(gameId: number, fromDateKey: string): Promise<number> {
  const result = await db
    .delete(dailyPuzzles)
    .where(and(eq(dailyPuzzles.gameId, gameId), gte(dailyPuzzles.dateUtc, fromDateKey)))
    .returning({ id: dailyPuzzles.id });
  return result.length;
}

// ── Attempts (server-side guess tracking) ────────────────────────────────────

export async function loadAttempt(
  userId: string,
  gameId: number,
  dateUtc: string,
): Promise<RealiteaAttempt | null> {
  const row = await db.query.realiteaAttempts.findFirst({
    where: and(
      eq(realiteaAttempts.hominemUserId, userId),
      eq(realiteaAttempts.gameId, gameId),
      eq(realiteaAttempts.dateUtc, dateUtc),
    ),
  });
  return row ?? null;
}

export async function createAttempt(
  userId: string,
  gameId: number,
  dateUtc: string,
): Promise<RealiteaAttempt> {
  const [row] = await db
    .insert(realiteaAttempts)
    .values({ hominemUserId: userId, gameId, dateUtc })
    .returning();
  return row;
}

export async function appendGuess(
  attemptId: number,
  guess: { word: string; states: ("absent" | "correct" | "present")[] },
  status: "playing" | "solved" | "failed",
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .update(realiteaAttempts)
    .set({
      guesses: sql`${realiteaAttempts.guesses} || ${JSON.stringify([guess])}::jsonb`,
      guessedAt: sql`${realiteaAttempts.guessedAt} || ${JSON.stringify([now])}::jsonb`,
      status,
      updatedAt: new Date(),
    })
    .where(eq(realiteaAttempts.id, attemptId));
}

export async function countRecentGuesses(
  userId: string,
  windowMs: number,
): Promise<number> {
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  const rows = await db
    .select({ guessedAt: realiteaAttempts.guessedAt })
    .from(realiteaAttempts)
    .where(
      and(
        eq(realiteaAttempts.hominemUserId, userId),
        gte(realiteaAttempts.updatedAt, new Date(cutoff)),
      ),
    );
  let total = 0;
  for (const row of rows) {
    for (const ts of row.guessedAt as string[]) {
      if (ts >= cutoff) total++;
    }
  }
  return total;
}

// ── History & stats ──────────────────────────────────────────────────────────

export interface AttemptWithPuzzle {
  attempt: RealiteaAttempt;
  puzzle: PuzzleRecord;
}

/**
 * A user's attempts for `gameId` within `[fromKey, toKey]` (inclusive),
 * newest date first, joined with the puzzle each attempt belongs to.
 * There's no FK between `realiteaAttempts` and `dailyPuzzles` (see the
 * schema's design note), so the join matches on `gameId` + `dateUtc`
 * instead — the same key `loadAttempt`/`createAttempt` already use to
 * correlate the two tables.
 *
 * The history page paginates by calendar week rather than row count, so the
 * caller supplies a 7-day window instead of a page/pageSize offset.
 */
export async function listAttemptsForUserInRange(
  userId: string,
  gameId: number,
  { fromKey, toKey }: { fromKey: string; toKey: string },
): Promise<AttemptWithPuzzle[]> {
  const rows = await db
    .select({ attempt: realiteaAttempts, puzzle: dailyPuzzles, article: articles })
    .from(realiteaAttempts)
    .innerJoin(
      dailyPuzzles,
      and(
        eq(dailyPuzzles.gameId, realiteaAttempts.gameId),
        eq(dailyPuzzles.dateUtc, realiteaAttempts.dateUtc),
      ),
    )
    .innerJoin(articles, eq(dailyPuzzles.articleId, articles.id))
    .where(
      and(
        eq(realiteaAttempts.hominemUserId, userId),
        eq(realiteaAttempts.gameId, gameId),
        gte(realiteaAttempts.dateUtc, fromKey),
        lte(realiteaAttempts.dateUtc, toKey),
      ),
    )
    .orderBy(desc(realiteaAttempts.dateUtc));

  return rows.map((row) => ({
    attempt: row.attempt,
    puzzle: { ...row.puzzle, article: row.article },
  }));
}

/** Earliest `dateUtc` with a puzzle for `gameId`, or `null` if none exist yet. */
export async function getEarliestPuzzleDateKey(gameId: number): Promise<string | null> {
  const rows = await db
    .select({ dateUtc: dailyPuzzles.dateUtc })
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.gameId, gameId))
    .orderBy(dailyPuzzles.dateUtc)
    .limit(1);
  return rows[0]?.dateUtc ?? null;
}

/**
 * ALL of a user's attempts for `gameId`, unpaginated, newest date first —
 * used only as input to stats/streak computation (see stats.ts), never
 * rendered directly. Row count is bounded by days-since-launch per user, so
 * a full fetch here is cheap even for a long-lived player.
 */
export async function loadAllAttemptsForUser(
  userId: string,
  gameId: number,
): Promise<RealiteaAttempt[]> {
  return db.query.realiteaAttempts.findMany({
    where: and(eq(realiteaAttempts.hominemUserId, userId), eq(realiteaAttempts.gameId, gameId)),
    orderBy: desc(realiteaAttempts.dateUtc),
  });
}

export type { Article, DailyPuzzle, Game };
