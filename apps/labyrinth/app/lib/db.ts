import { getDb } from "@pontistudios/db";

export const db = await getDb();

export type {
  NewPlaygroundEmbedding,
  NewPlaygroundTflCamera,
  NewPlaygroundTodo,
  PlaygroundEmbedding,
  PlaygroundTflCamera,
  PlaygroundTodo,
} from "@pontistudios/db";
