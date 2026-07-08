/**
 * Apply Drizzle migrations with full error output (drizzle-kit's spinner
 * swallows the underlying Postgres message in CI logs).
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { fileURLToPath } from "node:url";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "migrations");

const client = postgres(url, { max: 1 });
const db = drizzle(client);

try {
  await migrate(db, {
    migrationsFolder,
    migrationsSchema: "labs",
  });
  console.log("Migrations applied successfully");
} catch (err) {
  console.error("Migration failed");
  console.error(err);
  process.exitCode = 1;
} finally {
  await client.end();
}
