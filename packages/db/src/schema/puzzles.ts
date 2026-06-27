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
    sources: jsonb("sources").$type<PuzzleSource[]>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [check("normalized_answer_length", sql`length(${table.normalizedAnswer}) = 5`)],
);

export interface PuzzleSource {
  url: string;
  title: string;
  publishedAt: string;
}

export type PuzzleAnswerType = "moment" | "object" | "phrase" | "place" | "storyline";
export type RhobhDailyPuzzle = typeof rhobhDailyPuzzles.$inferSelect;
export type NewRhobhDailyPuzzle = typeof rhobhDailyPuzzles.$inferInsert;
