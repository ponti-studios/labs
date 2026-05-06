import { getDb } from "@pontistudios/db";

export const db = await getDb();

export type {
  NewPlaygroundEmbedding,
  NewPlaygroundProject,
  NewPlaygroundTflCamera,
  NewPlaygroundTodo,
  PlaygroundEmbedding,
  PlaygroundProject,
  PlaygroundTflCamera,
  PlaygroundTodo,
} from "@pontistudios/db";
