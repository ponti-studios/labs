import { date, jsonb, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { labs } from "./base";

export const rhobhDailyPuzzles = labs.table(
  "rhobh_daily_puzzles",
  {
    id: serial("id").primaryKey(),
    dateUtc: date("date_utc").notNull(),
    franchise: text("franchise").notNull(),
    answer: text("answer").notNull(),
    answerType: text("answer_type").notNull(),
    normalizedAnswer: text("normalized_answer").notNull(),
    clue: text("clue").notNull(),
    detail: text("detail").notNull(),
    role: text("role").notNull(),
    newsMode: text("news_mode").notNull(),
    sourceUrls: jsonb("source_urls").$type<string[]>().notNull(),
    sourceTitles: jsonb("source_titles").$type<string[]>().notNull(),
    sourcePublishedAt: jsonb("source_published_at").$type<string[]>().notNull(),
    sourceSummary: jsonb("source_summary").$type<string[]>().notNull(),
    generationStatus: text("generation_status").notNull(),
    validationStatus: text("validation_status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("rhobh_daily_puzzles_franchise_date_idx").on(table.franchise, table.dateUtc),
  ],
);

export type RhobhDailyPuzzle = typeof rhobhDailyPuzzles.$inferSelect;
export type NewRhobhDailyPuzzle = typeof rhobhDailyPuzzles.$inferInsert;
