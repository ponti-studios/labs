import { getDb } from "@pontistudios/db";

export const db = await getDb();

export type {
  PlaygroundProject,
  PlaygroundTodo,
  PlaygroundEmbedding,
  PlaygroundTflCamera,
  NewPlaygroundProject,
  NewPlaygroundTodo,
  NewPlaygroundEmbedding,
  NewPlaygroundTflCamera,
} from "@pontistudios/db";
