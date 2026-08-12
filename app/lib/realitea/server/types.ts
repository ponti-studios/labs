import type { Article, DailyPuzzle as DailyPuzzleRow } from "~/lib/server/db";

export interface PuzzleRecord extends DailyPuzzleRow {
  article: Pick<Article, "url" | "title" | "publishedAt">;
}
