import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@pontistudios/db/schema";

// Database connection using postgres.js (what Supabase uses under the hood)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// For serverless environments, use prepare: false
const client = postgres(connectionString, {
  prepare: false,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(client, { schema });

// Export schema for convenience
export { schema };
