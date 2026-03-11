import { getPostgresDb } from "@pontistudios/db";

// Re-export the database connection and schema from the shared package
export const { db } = getPostgresDb();
export { schema } from "@pontistudios/db";
