import { sql } from "drizzle-orm";
import { check, date, index, jsonb, serial, text, timestamp } from "drizzle-orm/pg-core";
import { labs } from "./base";

export const rhobhDailyPuzzles = labs.table(
  "rhobh_daily_puzzles",
  {
    id: serial("id").primaryKey(),
    dateUtc: date("date_utc"),
    franchise: text("franchise").notNull(),
    answer: text("answer").notNull(),
    answerType: text("answer_type").notNull(),
    normalizedAnswer: text("normalized_answer").notNull(),
    clue: text("clue").notNull(),
    detail: text("detail").notNull(),
    role: text("role").notNull(),
    status: text("status").notNull(),
    scheduledForDateKey: text("scheduled_for_date_key"),
    publishAt: timestamp("publish_at"),
    expireAt: timestamp("expire_at"),
    sourceUrls: jsonb("source_urls").$type<string[]>().notNull(),
    sourceTitles: jsonb("source_titles").$type<string[]>().notNull(),
    sourcePublishedAt: jsonb("source_published_at").$type<string[]>().notNull(),
    sourceSummary: jsonb("source_summary").$type<string[]>().notNull(),
    validationStatus: text("validation_status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("rhobh_daily_puzzles_status_idx").on(table.status),
    index("rhobh_daily_puzzles_scheduled_date_idx").on(table.scheduledForDateKey),
    check("status_must_be_valid", sql`${table.status} IN ('scheduled', 'published', 'consumed')`),
    check("normalized_answer_length", sql`length(${table.normalizedAnswer}) = 5`),
    check("window_order", sql`${table.publishAt} < ${table.expireAt}`),
  ],
);

export type RhobhDailyPuzzle = typeof rhobhDailyPuzzles.$inferSelect;
export type NewRhobhDailyPuzzle = typeof rhobhDailyPuzzles.$inferInsert;
