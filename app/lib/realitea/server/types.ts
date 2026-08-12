import type { Article, GamesPuzzle as GamesPuzzleRow } from "~/lib/server/db";

export interface PuzzleRecord extends GamesPuzzleRow {
  article: Article;
}
