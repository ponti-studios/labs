import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Load environment variables from .env file
// Ensure this is loaded before accessing process.env.DATABASE_URL
// Adjust path if your .env file is located elsewhere relative to this file
// For Next.js/Remix, environment variables are often handled by the framework
// and might not require explicit dotenv.config() here if already globally available.
// However, for scripts or direct execution, it's good practice.
if (process.env.NODE_ENV !== "production") {
	dotenv.config({ path: "../../.env" }); // Adjust path to your .env file at the dumphim app root
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is not set.");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export type DbClient = typeof db;
