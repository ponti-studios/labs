import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { labs } from "./base";

// ── games_topics ─────────────────────────────────────────────────────────────
// Entity: a durable RealiTea topic and its source feed. These used to be
// separate game + feed rows connected by feed_games, but the catalog is
// intentionally one topic per feed, so the join carried no independent
// meaning.

export const gamesTopics = labs.table("games_topics", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  feedUrl: text("feed_url").notNull().unique(),
  feedKind: text("feed_kind", { enum: ["rss"] })
    .notNull()
    .default("rss"),
  feedLabel: text("feed_label").notNull(),
  systemPromptPath: text("system_prompt_path").notNull(),
  answerLength: integer("answer_length").notNull().default(5),
  repeatWindowDays: integer("repeat_window_days").notNull().default(90),
  articleExpiryDays: integer("article_expiry_days").notNull().default(45),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── articles ─────────────────────────────────────────────────────────────────
// Entity: an ingested article, deduped globally on url. Game-agnostic —
// eligibility for a game is derived via feed_games, and "used" is global:
// once an article becomes a puzzle for any game it is retired everywhere.

export const articleStatusValues = ["pending", "used", "rejected", "expired"] as const;
export type ArticleStatus = (typeof articleStatusValues)[number];

export const articles = labs.table(
  "articles",
  {
    id: serial("id").primaryKey(),
    gamesTopicId: integer("games_topic_id")
      .notNull()
      .references(() => gamesTopics.id, { onDelete: "restrict" }),
    url: text("url").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    articleText: text("article_text"),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at"),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
    status: text("status", { enum: articleStatusValues }).notNull().default("pending"),
    rejectionCount: integer("rejection_count").notNull().default(0),
    rejectionReason: text("rejection_reason"),
  },
  (table) => [
    index("articles_status_idx").on(table.status),
    index("articles_published_at_idx").on(table.publishedAt),
  ],
);

export const generationRunStatusValues = ["running", "succeeded", "failed"] as const;
export type GenerationRunStatus = (typeof generationRunStatusValues)[number];

export const generationSourceModeValues = [
  "inventory",
  "feeds",
  "articles",
  "rss",
  "fixtures",
] as const;
export type GenerationSourceMode = (typeof generationSourceModeValues)[number];

export const generationPromptSourceValues = ["file", "paste"] as const;
export type GenerationPromptSource = (typeof generationPromptSourceValues)[number];

export const realiteaAdminActionKindValues = [
  "preview",
  "generate",
  "publish",
  "replace",
  "hand_edit",
  "ingest",
  "gap_fill",
  "gap_fill_one",
  "regenerate_dry_run",
  "dispatch_generate",
  "lock_busy",
] as const;
export type RealiteaAdminActionKind = (typeof realiteaAdminActionKindValues)[number];

// ── realitea_generation_runs ─────────────────────────────────────────────────
// Event: one generation (or compare-leg). Not the published puzzle.
// Retention may delete these rows; published games_puzzles.generation_run_id
// must SET NULL so live inventory is not deleted or blocked.

export const generationRuns = labs.table(
  "realitea_generation_runs",
  {
    id: serial("id").primaryKey(),
    gamesTopicId: integer("games_topic_id")
      .notNull()
      .references(() => gamesTopics.id, { onDelete: "restrict" }),
    dateKey: date("date_key").notNull(),
    status: text("status", { enum: generationRunStatusValues }).notNull().default("running"),
    sourceMode: text("source_mode", { enum: generationSourceModeValues }).notNull(),
    feedIds: jsonb("feed_ids").$type<number[]>().notNull().default([]),
    articleIds: jsonb("article_ids").$type<number[]>().notNull().default([]),
    feedUrl: text("feed_url"),
    promptSource: text("prompt_source", { enum: generationPromptSourceValues }).notNull(),
    promptPath: text("prompt_path"),
    promptText: text("prompt_text").notNull(),
    model: text("model").notNull(),
    excludedAnswerCount: integer("excluded_answer_count").notNull().default(0),
    feedItemCount: integer("feed_item_count").notNull().default(0),
    selectedIndex: integer("selected_index"),
    feedError: text("feed_error"),
    llmError: text("llm_error"),
    compareGroupId: text("compare_group_id"),
    publishable: boolean("publishable").notNull().default(false),
    createdByHominemUserId: text("created_by_hominem_user_id").notNull(),
    createdByEmail: text("created_by_email"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
  },
  (table) => [
    index("realitea_generation_runs_topic_created_idx").on(table.gamesTopicId, table.createdAt),
    index("realitea_generation_runs_date_created_idx").on(table.dateKey, table.createdAt),
  ],
);

// ── realitea_generation_candidates ───────────────────────────────────────────
// Child of a run. article_id is required before publish; null for rss/fixtures.

export const generationCandidates = labs.table(
  "realitea_generation_candidates",
  {
    id: serial("id").primaryKey(),
    runId: integer("run_id")
      .notNull()
      .references(() => generationRuns.id, { onDelete: "cascade" }),
    ordinal: integer("ordinal").notNull(),
    payload: jsonb("payload").notNull(),
    normalizedAnswer: text("normalized_answer").notNull(),
    valid: boolean("valid").notNull(),
    reasons: jsonb("reasons").$type<string[]>().notNull().default([]),
    handEdited: boolean("hand_edited").notNull().default(false),
    articleId: integer("article_id").references(() => articles.id, { onDelete: "restrict" }),
  },
  (table) => [uniqueIndex("realitea_generation_candidates_run_ordinal_idx").on(table.runId, table.ordinal)],
);

// ── games_puzzles ────────────────────────────────────────────────────────────
// Entity: a puzzle for one game on one date, generated from exactly one
// article. Generalized from rhobh_games_puzzles — game_id replaces the
// implicit "this table is only rhobh" assumption, article_id replaces the
// jsonb sources array now that generation is strictly one-article-in.
//
// Provenance columns are nullable so existing rows stay valid. generation_run_id
// is SET NULL on run delete — never cascade, never restrict.

export const gamesPuzzles = labs.table(
  "games_puzzles",
  {
    id: serial("id").primaryKey(),
    gamesTopicId: integer("games_topic_id")
      .notNull()
      .references(() => gamesTopics.id, { onDelete: "restrict" }),
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "restrict" }),
    dateUtc: date("date_utc").notNull(),
    answer: text("answer").notNull(),
    answerType: text("answer_type").$type<PuzzleAnswerType>().notNull(),
    normalizedAnswer: text("normalized_answer").notNull(),
    clue: text("clue").notNull(),
    detail: text("detail").notNull(),
    promptPath: text("prompt_path"),
    model: text("model"),
    generationRunId: integer("generation_run_id").references(() => generationRuns.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    check("normalized_answer_length", sql`length(${table.normalizedAnswer}) = 5`),
    uniqueIndex("games_puzzles_games_topic_date_idx").on(table.gamesTopicId, table.dateUtc),
  ],
);

export type PuzzleAnswerType = "moment" | "object" | "phrase" | "place" | "storyline";

// ── games_attempts ────────────────────────────────────────────────────────
// Entity: one signed-in player's progress on one game's puzzle for one date.
// This is the authoritative guess history — before it existed, the guess API
// trusted a client-supplied `previousGuesses` array for both the six-guess cap
// and the already-guessed check, so a scripted client could bypass either.
//
// There is no FK on hominem_user_id: Better Auth owns the users table and it
// lives in Hominem's database, not this one. Anonymous players get no row at
// all — their single free guess is evaluated without being persisted.

export const attemptStatusValues = ["playing", "solved", "failed"] as const;
export type AttemptStatus = (typeof attemptStatusValues)[number];

/**
 * Persisted shape of a scored guess. Kept structurally identical to
 * `RealiteaGuess` in app/lib/realitea/core/types.ts, but declared here rather
 * than imported: the domain types sit above this schema, so importing back
 * would be circular. Drift will fail repository tests.
 */
type StoredGuess = {
  word: string;
  states: ("absent" | "correct" | "present")[];
};

export const gamesAttempts = labs.table(
  "games_attempts",
  {
    id: serial("id").primaryKey(),
    hominemUserId: text("hominem_user_id").notNull(),
    gamesTopicId: integer("games_topic_id")
      .notNull()
      .references(() => gamesTopics.id, { onDelete: "cascade" }),
    dateUtc: date("date_utc").notNull(),
    guesses: jsonb("guesses").$type<StoredGuess[]>().notNull().default([]),
    /**
     * ISO timestamp per entry in `guesses`, same order. Backs the
     * guesses-per-minute limit, which is per-player across puzzles (players
     * may work through older unplayed dates), so it cannot be derived from a
     * single row's six-guess cap alone — see countRecentGuesses.
     */
    guessedAt: jsonb("guessed_at").$type<string[]>().notNull().default([]),
    status: text("status", { enum: attemptStatusValues }).notNull().default("playing"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("games_attempts_user_games_topic_date_idx").on(
      table.hominemUserId,
      table.gamesTopicId,
      table.dateUtc,
    ),
    // Narrows the rate-limit scan to rows the player touched recently instead
    // of every attempt they have ever created.
    index("games_attempts_user_updated_idx").on(table.hominemUserId, table.updatedAt),
  ],
);

// ── realitea_puzzle_revisions ────────────────────────────────────────────────
// Snapshot of a published row (and deleted attempts) before an in-place replace.
// puzzle_id stays the live games_puzzles.id; replace does not insert a new puzzle.

export const puzzleRevisions = labs.table("realitea_puzzle_revisions", {
  id: serial("id").primaryKey(),
  gamesTopicId: integer("games_topic_id")
    .notNull()
    .references(() => gamesTopics.id, { onDelete: "restrict" }),
  dateUtc: date("date_utc").notNull(),
  puzzleId: integer("puzzle_id")
    .notNull()
    .references(() => gamesPuzzles.id, { onDelete: "restrict" }),
  snapshot: jsonb("snapshot").notNull(),
  attemptsSnapshot: jsonb("attempts_snapshot").notNull(),
  replacedByHominemUserId: text("replaced_by_hominem_user_id").notNull(),
  replacedAt: timestamp("replaced_at").defaultNow().notNull(),
});

// ── realitea_admin_actions ───────────────────────────────────────────────────
// Audit of operator commands. Never store ADMIN_SECRET in payload/result.

export const adminActions = labs.table(
  "realitea_admin_actions",
  {
    id: serial("id").primaryKey(),
    at: timestamp("at").defaultNow().notNull(),
    hominemUserId: text("hominem_user_id").notNull(),
    kind: text("kind", { enum: realiteaAdminActionKindValues }).notNull(),
    gamesTopicId: integer("games_topic_id")
      .notNull()
      .references(() => gamesTopics.id, { onDelete: "restrict" }),
    dateUtc: date("date_utc"),
    dryRun: boolean("dry_run").notNull().default(false),
    payload: jsonb("payload").notNull().default({}),
    result: jsonb("result").notNull().default({}),
  },
  (table) => [
    index("realitea_admin_actions_at_idx").on(table.at),
    index("realitea_admin_actions_kind_at_idx").on(table.kind, table.at),
    index("realitea_admin_actions_date_idx").on(table.dateUtc),
  ],
);

export type GamesTopic = typeof gamesTopics.$inferSelect;
export type NewGamesTopic = typeof gamesTopics.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type GamesPuzzle = typeof gamesPuzzles.$inferSelect;
export type NewGamesPuzzle = typeof gamesPuzzles.$inferInsert;
export type GamesAttempt = typeof gamesAttempts.$inferSelect;
export type NewGamesAttempt = typeof gamesAttempts.$inferInsert;
export type GenerationRun = typeof generationRuns.$inferSelect;
export type NewGenerationRun = typeof generationRuns.$inferInsert;
export type GenerationCandidate = typeof generationCandidates.$inferSelect;
export type NewGenerationCandidate = typeof generationCandidates.$inferInsert;
export type PuzzleRevision = typeof puzzleRevisions.$inferSelect;
export type NewPuzzleRevision = typeof puzzleRevisions.$inferInsert;
export type AdminAction = typeof adminActions.$inferSelect;
export type NewAdminAction = typeof adminActions.$inferInsert;

