import { getDb } from "@pontistudios/db";

export const db = await getDb();

export type {
  Embedding,
  NewEmbedding,
  NewRhobhDailyPuzzle,
  NewTflCamera,
  NewTodo,
  RhobhDailyPuzzle,
  TflCamera,
  Todo,
} from "@pontistudios/db";
