import { getDb } from "@pontistudios/db";

export const db = await getDb();

export type {
  NewPlaygroundEmbedding,
  NewPlaygroundRhobhDailyPuzzle,
  NewPlaygroundTflCamera,
  NewPlaygroundTodo,
  PlaygroundEmbedding,
  PlaygroundRhobhDailyPuzzle,
  PlaygroundTflCamera,
  PlaygroundTodo,
} from "@pontistudios/db";
