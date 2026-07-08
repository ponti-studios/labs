import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const client = postgres("postgresql://postgres:postgres@localhost:5434/postgres", { max: 1 });
const db = drizzle(client);

try {
  await migrate(db, { migrationsFolder: "./migrations", migrationsSchema: "labs" });
  console.log("MIGRATION SUCCESS");
} catch (err) {
  console.error("MIGRATION FAILED");
  console.error(err);
} finally {
  await client.end();
}
