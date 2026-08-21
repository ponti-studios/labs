import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { DbEnv } from "./env";
import * as schema from "./schema";

const { url } = DbEnv.parse(process.env);
const postgresSql = postgres(url, {
  max: Number(process.env.DB_POOL_SIZE ?? 10),
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(postgresSql, { schema });

export function getSql() {
  return postgresSql;
}

export async function closeDb() {
  await postgresSql.end({ timeout: 5 });
}
