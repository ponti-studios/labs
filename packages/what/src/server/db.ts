import postgres from "postgres";
import * as schema from "@pontistudios/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { DatabaseEnv } from "@pontistudios/env";

const { DATABASE_URL } = DatabaseEnv.parse(process.env);
const postgresSql = postgres(DATABASE_URL, {
  max: Number(process.env.DB_POOL_SIZE ?? 10),
  idle_timeout: 20,
  connect_timeout: 10,
});

/** This game service owns this client instance while sharing the workspace schema package. */
export const db = drizzle(postgresSql, { schema });

export function getSql() {
  return postgresSql;
}

export async function closeDb() {
  await postgresSql.end({ timeout: 5 });
}

export * from "drizzle-orm";
export * from "@pontistudios/db/schema";
export * from "@pontistudios/db/env";

export default postgresSql;
