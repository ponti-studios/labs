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

// ── games ────────────────────────────────────────────────────────────────────
// Entity: a durable puzzle game/show (rhobh, vanderpump, ...). Owns the
// generation config that used to be hardcoded per-app (system prompt,
// answer length, cooldown window, article staleness cutoff).

export const games = labs.table("games", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  systemPromptPath: text("system_prompt_path").notNull(),
  answerLength: integer("answer_length").notNull().default(5),
  repeatWindowDays: integer("repeat_window_days").notNull().default(90),
  articleExpiryDays: integer("article_expiry_days").notNull().default(45),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── feeds ────────────────────────────────────────────────────────────────────
// Source: provenance for ingested articles. Feeds are game-agnostic — the
// same feed can seed more than one game via feed_games.

export const feeds = labs.table("feeds", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  kind: text("kind", { enum: ["rss"] })
    .notNull()
    .default("rss"),
  label: text("label").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── feed_games ───────────────────────────────────────────────────────────────
// Link: which feeds a given game is allowed to draw articles from.

export const feedGames = labs.table(
  "feed_games",
  {
    feedId: integer("feed_id")
      .notNull()
      .references(() => feeds.id, { onDelete: "cascade" }),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.feedId, table.gameId] })],
);

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
    feedId: integer("feed_id")
      .notNull()
      .references(() => feeds.id, { onDelete: "restrict" }),
    url: text("url").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
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

// ── daily_puzzles ────────────────────────────────────────────────────────────
// Entity: a puzzle for one game on one date, generated from exactly one
// article. Generalized from rhobh_daily_puzzles — game_id replaces the
// implicit "this table is only rhobh" assumption, article_id replaces the
// jsonb sources array now that generation is strictly one-article-in.

export const dailyPuzzles = labs.table(
  "daily_puzzles",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "restrict" }),
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "restrict" }),
    dateUtc: date("date_utc").notNull(),
    answer: text("answer").notNull(),
    answerType: text("answer_type").$type<PuzzleAnswerType>().notNull(),
    normalizedAnswer: text("normalized_answer").notNull(),
    clue: text("clue").notNull(),
    detail: text("detail").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    check("normalized_answer_length", sql`length(${table.normalizedAnswer}) = 5`),
    uniqueIndex("daily_puzzles_game_date_idx").on(table.gameId, table.dateUtc),
  ],
);

export type PuzzleAnswerType = "moment" | "object" | "phrase" | "place" | "storyline";

// ── realitea_attempts ────────────────────────────────────────────────────────
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
 * `RealiteaGuess` in app/lib/realitea/types.ts, but declared here rather than
 * imported: that module imports from this one, so importing back would be
 * circular. repository.ts touches both and will fail to compile if they drift.
 */
type StoredGuess = {
  word: string;
  states: ("absent" | "correct" | "present")[];
};

export const realiteaAttempts = labs.table(
  "realitea_attempts",
  {
    id: serial("id").primaryKey(),
    hominemUserId: text("hominem_user_id").notNull(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
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
    uniqueIndex("realitea_attempts_user_game_date_idx").on(
      table.hominemUserId,
      table.gameId,
      table.dateUtc,
    ),
    // Narrows the rate-limit scan to rows the player touched recently instead
    // of every attempt they have ever created.
    index("realitea_attempts_user_updated_idx").on(table.hominemUserId, table.updatedAt),
  ],
);

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Feed = typeof feeds.$inferSelect;
export type NewFeed = typeof feeds.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type DailyPuzzle = typeof dailyPuzzles.$inferSelect;
export type NewDailyPuzzle = typeof dailyPuzzles.$inferInsert;
export type RealiteaAttempt = typeof realiteaAttempts.$inferSelect;
export type NewRealiteaAttempt = typeof realiteaAttempts.$inferInsert;
