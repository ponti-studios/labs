import { getPostgresDb } from "@pontistudios/db";

// Re-export the database connection and schema from the shared package
export const { db } = getPostgresDb();
export {
  covidData,
  tflCameras,
  todos,
  projects,
  embeddings,
  type CovidData,
  type CovidDataInsert,
  type TflCamera,
  type TflCameraInsert,
  type Todo,
  type TodoInsert,
  type Project,
  type ProjectInsert,
  type Embedding,
  type EmbeddingInsert,
} from "@pontistudios/db/schema";
