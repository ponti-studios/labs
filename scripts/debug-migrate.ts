import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

try {
  const trackingRows = await client`select * from "labs"."__drizzle_migrations" order by created_at`;
  console.log("TRACKING_ROWS", JSON.stringify(trackingRows, null, 2));
  const tables = await client`select table_name from information_schema.tables where table_schema = 'labs' order by table_name`;
  console.log("LABS_TABLES", JSON.stringify(tables, null, 2));
} catch (e) {
  console.error("INTROSPECT_FAILED", e);
}

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
