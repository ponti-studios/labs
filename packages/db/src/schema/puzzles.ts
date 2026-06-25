import { sql } from "drizzle-orm";
import { check, date, index, jsonb, serial, text, timestamp } from "drizzle-orm/pg-core";
import { labs } from "./base";

export const rhobhDailyPuzzles = labs.table(
  "rhobh_daily_puzzles",
  {
    id: serial("id").primaryKey(),
    dateUtc: date("date_utc"),
    answer: text("answer").notNull(),
    answerType: text("answer_type").$type<PuzzleAnswerType>().notNull(),
    normalizedAnswer: text("normalized_answer").notNull(),
    clue: text("clue").notNull(),
    detail: text("detail").notNull(),
    status: text("status").notNull(),
    publishAt: timestamp("publish_at"),
    expireAt: timestamp("expire_at"),
    sources: jsonb("sources").$type<PuzzleSource[]>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("rhobh_daily_puzzles_status_idx").on(table.status),
    check("status_must_be_valid", sql`${table.status} IN ('scheduled', 'published', 'consumed')`),
    check("normalized_answer_length", sql`length(${table.normalizedAnswer}) = 5`),
    check("window_order", sql`${table.publishAt} < ${table.expireAt}`),
  ],
);

export interface PuzzleSource {
  url: string;
  title: string;
  publishedAt: string;
}

export type PuzzleAnswerType = "moment" | "object" | "phrase" | "place" | "storyline";
export type RhobhDailyPuzzle = typeof rhobhDailyPuzzles.$inferSelect;
export type NewRhobhDailyPuzzle = typeof rhobhDailyPuzzles.$inferInsert;
