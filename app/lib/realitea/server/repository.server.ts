/**
 * Data-access layer for the RealiTea puzzle domain (`games_topics`,
 * `articles`, `games_puzzles` — physically still named
 * `rhobh_games_puzzles`, see packages/db/src/schema/realitea.ts).
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

import type {
  Article,
  GamesPuzzle,
  GamesTopic,
  GamesAttempt,
  RealiteaAdminActionKind,
} from "~/lib/server/db";
import {
  adminActions,
  and,
  articles,
  count,
  gamesPuzzles,
  db,
  desc,
  eq,
  gamesTopics,
  gte,
  inArray,
  lt,
  lte,
  gamesAttempts,
  generationCandidates,
  generationRuns,
  sql,
} from "~/lib/server/db";

import { addDaysToDateKey, buildDateRange, getDateKey } from "../core/date";
import type { PuzzleRecord } from "./types";

// ── Games ────────────────────────────────────────────────────────────────────

export async function getGameBySlug(slug: string): Promise<GamesTopic | null> {
  const row = await db.query.gamesTopics.findFirst({ where: eq(gamesTopics.slug, slug) });
  return row ?? null;
}

export async function getActiveGames(): Promise<GamesTopic[]> {
  return db.query.gamesTopics.findMany({ where: eq(gamesTopics.active, true), orderBy: gamesTopics.name });
}

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Collect all unique normalized answers from this game's repeat-cooldown
 * window (`game.repeatWindowDays` days back from `date`).
 *
 * Used during puzzle generation to avoid repeating an answer that was used
 * too recently within the same game.
 */
export async function getRecentAnswers(game: GamesTopic, date: Date): Promise<Set<string>> {
  const cutoff = new Date(date);
  cutoff.setUTCDate(cutoff.getUTCDate() - game.repeatWindowDays);
  const cutoffDateValue = getDateKey(cutoff);
  const rows = await db
    .select({ normalizedAnswer: gamesPuzzles.normalizedAnswer })
    .from(gamesPuzzles)
    .where(and(eq(gamesPuzzles.gamesTopicId, game.id), gte(gamesPuzzles.dateUtc, cutoffDateValue)));
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
    .select({ normalizedAnswer: gamesPuzzles.normalizedAnswer })
    .from(gamesPuzzles)
    .where(eq(gamesPuzzles.gamesTopicId, gameId));
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
    .select({ puzzle: gamesPuzzles, article: articles })
    .from(gamesPuzzles)
    .innerJoin(articles, eq(gamesPuzzles.articleId, articles.id))
    .where(and(eq(gamesPuzzles.gamesTopicId, gameId), eq(gamesPuzzles.dateUtc, dateKey)))
    .orderBy(desc(gamesPuzzles.createdAt))
    .limit(1);
  const row = rows[0];
  return row ? { ...row.puzzle, article: row.article } : null;
}

/**
 * Most-recently-created puzzle for a game, optionally bounded to a calendar
 * date. The unbounded form is used by tooling; active-puzzle fallback always
 * supplies `dateKey` so future inventory cannot be served.
 */
export async function loadMostRecentPuzzle(
  gameId: number,
  dateKey?: string,
): Promise<PuzzleRecord | null> {
  const rows = await db
    .select({ puzzle: gamesPuzzles, article: articles })
    .from(gamesPuzzles)
    .innerJoin(articles, eq(gamesPuzzles.articleId, articles.id))
    .where(
      dateKey
        ? and(eq(gamesPuzzles.gamesTopicId, gameId), lte(gamesPuzzles.dateUtc, dateKey))
        : eq(gamesPuzzles.gamesTopicId, gameId),
    )
    .orderBy(desc(gamesPuzzles.createdAt))
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
  gamesTopicId: number,
  items: {
    url: string;
    title: string;
    description?: string;
    articleText?: string;
    imageUrl?: string;
    publishedAt?: Date;
  }[],
): Promise<number> {
  if (items.length === 0) return 0;
  const inserted = await db
    .insert(articles)
    .values(
      items.map((item) => ({
        gamesTopicId,
        url: item.url,
        title: item.title,
        description: item.description ?? null,
        articleText: item.articleText ?? null,
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
export async function getPendingArticlesForGame(game: GamesTopic, limit: number): Promise<Article[]> {
  const rows = await db
    .select({ article: articles })
    .from(articles)
    .where(and(eq(articles.gamesTopicId, game.id), eq(articles.status, "pending")))
    .orderBy(articles.publishedAt)
    .limit(limit);
  return rows.map((r) => r.article);
}

export async function getPendingArticlesForTopics(topicIds: number[], limit: number): Promise<Article[]> {
  if (topicIds.length === 0) return [];
  const rows = await db
    .select({ article: articles })
    .from(articles)
    .where(and(inArray(articles.gamesTopicId, topicIds), eq(articles.status, "pending")))
    .orderBy(articles.publishedAt)
    .limit(limit);
  return rows.map((r) => r.article);
}

export async function getPendingArticlesByIds(articleIds: number[], limit: number): Promise<Article[]> {
  if (articleIds.length === 0) return [];
  const rows = await db
    .select({ article: articles })
    .from(articles)
    .where(and(inArray(articles.id, articleIds.slice(0, limit)), eq(articles.status, "pending")));
  return rows.map((r) => r.article);
}

export async function listTopicFeedHosts(): Promise<string[]> {
  const rows = await db
    .select({ feedUrl: gamesTopics.feedUrl })
    .from(gamesTopics)
    .where(eq(gamesTopics.active, true));
  return rows.flatMap((row) => {
    try {
      return [new URL(row.feedUrl).hostname.replace(/^www\./, "")];
    } catch {
      return [];
    }
  });
}

export async function countRecentGenerateActions(hominemUserId: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(adminActions)
    .where(
      and(
        eq(adminActions.hominemUserId, hominemUserId),
        inArray(adminActions.kind, ["generate", "preview"]),
        gte(adminActions.at, since),
      ),
    );
  return row?.value ?? 0;
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
export async function expireStaleArticles(game: GamesTopic, now: Date): Promise<number> {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - game.articleExpiryDays);
  const result = await db
    .update(articles)
    .set({ status: "expired" })
    .where(
      and(
        eq(articles.status, "pending"),
        lt(articles.publishedAt, cutoff),
        eq(articles.gamesTopicId, game.id),
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
    .where(and(eq(articles.gamesTopicId, gameId), eq(articles.status, "pending")));
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
    .from(gamesPuzzles)
    .where(and(eq(gamesPuzzles.gamesTopicId, gameId), inArray(gamesPuzzles.dateUtc, dateKeys)));
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
    .select({ dateUtc: gamesPuzzles.dateUtc })
    .from(gamesPuzzles)
    .where(
      and(
        eq(gamesPuzzles.gamesTopicId, gameId),
        gte(gamesPuzzles.dateUtc, fromKey),
        lte(gamesPuzzles.dateUtc, toKey),
      ),
    );
  return rows.map((r) => r.dateUtc);
}

/** Every published puzzle date for a topic, oldest first. */
export async function listAllPuzzleDateKeys(gameId: number): Promise<string[]> {
  const rows = await db
    .select({ dateUtc: gamesPuzzles.dateUtc })
    .from(gamesPuzzles)
    .where(eq(gamesPuzzles.gamesTopicId, gameId))
    .orderBy(gamesPuzzles.dateUtc);
  return rows.map((r) => r.dateUtc);
}

export async function listGenerationsForTopic(
  gameId: number,
  options: { limit?: number; dateKey?: string } = {},
) {
  const conditions = [eq(generationRuns.gamesTopicId, gameId)];
  if (options.dateKey) {
    conditions.push(sql`${generationRuns.dateKey} = ${options.dateKey}::date`);
  }
  return db
    .select({
      id: generationRuns.id,
      dateKey: generationRuns.dateKey,
      status: generationRuns.status,
      sourceMode: generationRuns.sourceMode,
      model: generationRuns.model,
      publishable: generationRuns.publishable,
      llmError: generationRuns.llmError,
      createdByEmail: generationRuns.createdByEmail,
      createdAt: generationRuns.createdAt,
      finishedAt: generationRuns.finishedAt,
    })
    .from(generationRuns)
    .where(and(...conditions))
    .orderBy(desc(generationRuns.createdAt))
    .limit(options.limit ?? 20);
}

export async function getGenerationWithCandidates(gameId: number, generationId: number) {
  const [generation] = await db
    .select({
      id: generationRuns.id,
      dateKey: generationRuns.dateKey,
      status: generationRuns.status,
      sourceMode: generationRuns.sourceMode,
      model: generationRuns.model,
      publishable: generationRuns.publishable,
      llmError: generationRuns.llmError,
      feedError: generationRuns.feedError,
      promptSource: generationRuns.promptSource,
      promptPath: generationRuns.promptPath,
      selectedIndex: generationRuns.selectedIndex,
      feedItemCount: generationRuns.feedItemCount,
      createdByEmail: generationRuns.createdByEmail,
      createdAt: generationRuns.createdAt,
      finishedAt: generationRuns.finishedAt,
    })
    .from(generationRuns)
    .where(and(eq(generationRuns.id, generationId), eq(generationRuns.gamesTopicId, gameId)))
    .limit(1);
  if (!generation) return null;

  const candidates = await db
    .select({
      id: generationCandidates.id,
      ordinal: generationCandidates.ordinal,
      payload: generationCandidates.payload,
      valid: generationCandidates.valid,
      reasons: generationCandidates.reasons,
      articleId: generationCandidates.articleId,
      articleTitle: articles.title,
      articleUrl: articles.url,
    })
    .from(generationCandidates)
    .leftJoin(articles, eq(generationCandidates.articleId, articles.id))
    .where(eq(generationCandidates.runId, generationId))
    .orderBy(generationCandidates.ordinal);

  return { generation, candidates };
}

/**
 * Delete all puzzles for `gameId` whose `dateUtc` is >= `fromDateKey`.
 *
 * Returns the number of deleted records. Prefer `deletePuzzlesInRange` for
 * generate ops — this unbounded form must not be called from admin HTTP.
 */
export async function deletePuzzlesFromDate(gameId: number, fromDateKey: string): Promise<number> {
  const result = await db
    .delete(gamesPuzzles)
    .where(and(eq(gamesPuzzles.gamesTopicId, gameId), gte(gamesPuzzles.dateUtc, fromDateKey)))
    .returning({ id: gamesPuzzles.id });
  return result.length;
}

/**
 * Delete puzzles for `gameId` whose `dateUtc` is in `[fromKey, toKey]`.
 */
export async function deletePuzzlesInRange(
  gameId: number,
  fromKey: string,
  toKey: string,
): Promise<number> {
  const result = await db
    .delete(gamesPuzzles)
    .where(
      and(
        eq(gamesPuzzles.gamesTopicId, gameId),
        gte(gamesPuzzles.dateUtc, fromKey),
        lte(gamesPuzzles.dateUtc, toKey),
      ),
    )
    .returning({ id: gamesPuzzles.id });
  return result.length;
}

export async function countAttemptsByDate(
  gameId: number,
  dateKeys: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>(dateKeys.map((dateKey) => [dateKey, 0]));
  if (dateKeys.length === 0) return counts;
  const rows = await db
    .select({ dateUtc: gamesAttempts.dateUtc, value: count() })
    .from(gamesAttempts)
    .where(and(eq(gamesAttempts.gamesTopicId, gameId), inArray(gamesAttempts.dateUtc, dateKeys)))
    .groupBy(gamesAttempts.dateUtc);
  for (const row of rows) {
    counts.set(row.dateUtc, row.value);
  }
  return counts;
}

export async function backfillPuzzlePublishedAt(): Promise<number> {
  const result = await db
    .update(gamesPuzzles)
    .set({ publishedAt: sql`${gamesPuzzles.createdAt}` })
    .where(sql`${gamesPuzzles.publishedAt} IS NULL`)
    .returning({ id: gamesPuzzles.id });
  return result.length;
}

export async function recordAdminAction(input: {
  hominemUserId?: string;
  email?: string | null;
  kind: RealiteaAdminActionKind;
  gamesTopicId: number;
  dateUtc?: string;
  dryRun?: boolean;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(adminActions).values({
    hominemUserId: input.hominemUserId ?? "system:generate",
    email: input.email ?? null,
    kind: input.kind,
    gamesTopicId: input.gamesTopicId,
    dateUtc: input.dateUtc,
    dryRun: input.dryRun ?? false,
    payload: input.payload ?? {},
    result: input.result ?? {},
  });
}

// ── Attempts (server-side guess tracking) ────────────────────────────────────

export async function loadAttempt(
  userId: string,
  gameId: number,
  dateUtc: string,
): Promise<GamesAttempt | null> {
  const row = await db.query.gamesAttempts.findFirst({
    where: and(
      eq(gamesAttempts.hominemUserId, userId),
      eq(gamesAttempts.gamesTopicId, gameId),
      eq(gamesAttempts.dateUtc, dateUtc),
    ),
  });
  return row ?? null;
}

export async function createAttempt(
  userId: string,
  gameId: number,
  dateUtc: string,
): Promise<GamesAttempt> {
  const [row] = await db
    .insert(gamesAttempts)
    .values({ hominemUserId: userId, gamesTopicId: gameId, dateUtc })
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
    .update(gamesAttempts)
    .set({
      guesses: sql`${gamesAttempts.guesses} || ${JSON.stringify([guess])}::jsonb`,
      guessedAt: sql`${gamesAttempts.guessedAt} || ${JSON.stringify([now])}::jsonb`,
      status,
      updatedAt: new Date(),
    })
    .where(eq(gamesAttempts.id, attemptId));
}

export async function countRecentGuesses(userId: string, windowMs: number): Promise<number> {
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  const rows = await db
    .select({ guessedAt: gamesAttempts.guessedAt })
    .from(gamesAttempts)
    .where(
      and(
        eq(gamesAttempts.hominemUserId, userId),
        gte(gamesAttempts.updatedAt, new Date(cutoff)),
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
  attempt: GamesAttempt;
  puzzle: PuzzleRecord;
}

/**
 * A user's attempts for `gameId` within `[fromKey, toKey]` (inclusive),
 * newest date first, joined with the puzzle each attempt belongs to.
 * There's no FK between `gamesAttempts` and `gamesPuzzles` (see the
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
    .select({ attempt: gamesAttempts, puzzle: gamesPuzzles, article: articles })
    .from(gamesAttempts)
    .innerJoin(
      gamesPuzzles,
      and(
        eq(gamesPuzzles.gamesTopicId, gamesAttempts.gamesTopicId),
        eq(gamesPuzzles.dateUtc, gamesAttempts.dateUtc),
      ),
    )
    .innerJoin(articles, eq(gamesPuzzles.articleId, articles.id))
    .where(
      and(
        eq(gamesAttempts.hominemUserId, userId),
        eq(gamesAttempts.gamesTopicId, gameId),
        gte(gamesAttempts.dateUtc, fromKey),
        lte(gamesAttempts.dateUtc, toKey),
      ),
    )
    .orderBy(desc(gamesAttempts.dateUtc));

  return rows.map((row) => ({
    attempt: row.attempt,
    puzzle: { ...row.puzzle, article: row.article },
  }));
}

/** Earliest `dateUtc` with a puzzle for `gameId`, or `null` if none exist yet. */
export async function getEarliestPuzzleDateKey(gameId: number): Promise<string | null> {
  const rows = await db
    .select({ dateUtc: gamesPuzzles.dateUtc })
    .from(gamesPuzzles)
    .where(eq(gamesPuzzles.gamesTopicId, gameId))
    .orderBy(gamesPuzzles.dateUtc)
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
): Promise<GamesAttempt[]> {
  return db.query.gamesAttempts.findMany({
    where: and(eq(gamesAttempts.hominemUserId, userId), eq(gamesAttempts.gamesTopicId, gameId)),
    orderBy: desc(gamesAttempts.dateUtc),
  });
}

export type { Article, GamesPuzzle, GamesTopic };

