import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

try {
  await migrate(db, { migrationsFolder: "./migrations", migrationsSchema: "labs" });
  console.log("MIGRATE_DEBUG_SUCCESS");
} catch (e) {
  console.error("MIGRATE_DEBUG_FAILURE_START");
  console.error(e);
  if (e && typeof e === "object") {
    console.error(JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
  }
  console.error("MIGRATE_DEBUG_FAILURE_END");
  process.exitCode = 1;
} finally {
  await client.end();
}
