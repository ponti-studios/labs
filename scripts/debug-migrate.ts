import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const STALE_HASH = "730a701c17adaf9dc6290167ee7afab6a9fff9590321e40276efa12cbc4af121";

try {
  const deleted = await client`delete from "labs"."__drizzle_migrations" where hash = ${STALE_HASH} returning *`;
  console.log("DELETED_STALE_ROW", JSON.stringify(deleted, null, 2));

  // case_updates never got created by whatever migration actually ran in the
  // stale row's place, but migration 0011 (never applied here) expects to
  // DROP it. Recreate the bare shape from 0000_baseline.sql so that DROP
  // succeeds naturally instead of hand-editing an already-applied migration.
  await client`
    create table if not exists "labs"."case_updates" (
      "id" text primary key not null,
      "case_id" text not null,
      "raw_content" text not null,
      "neutral_content" text not null,
      "round" integer not null,
      "created_at" timestamp default now() not null
    )
  `;
  console.log("RECREATED_CASE_UPDATES_SHELL");

  const trackingRows = await client`select * from "labs"."__drizzle_migrations" order by created_at`;
  console.log("TRACKING_ROWS", JSON.stringify(trackingRows, null, 2));
} catch (e) {
  console.error("INTROSPECT_FAILED", e);
}

try {
  await migrate(db, { migrationsFolder: "./migrations", migrationsSchema: "labs" });
  console.log("MIGRATE_DEBUG_SUCCESS");
  const tables = await client`select table_name from information_schema.tables where table_schema = 'labs' order by table_name`;
  console.log("FINAL_LABS_TABLES", JSON.stringify(tables, null, 2));
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
