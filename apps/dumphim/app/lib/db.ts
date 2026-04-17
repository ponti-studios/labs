import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  trackers,
  votes,
  getDb as parentGetDb,
  closeDb as parentCloseDb,
  type DumphimTracker,
  type DumphimVote,
  type NewDumphimTracker,
  type NewDumphimVote,
  type DumphimTrackerParsed,
} from "@pontistudios/db";

const dbUrl = process.env.DATABASE_URL ?? process.env.VITE_DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

function getDb() {
  if (_db) return _db;
  const sql = postgres(dbUrl!);
  _db = drizzle(sql, { schema: { trackers, votes } });
  _client = sql;
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const instance = getDb();
    return Reflect.get(instance, prop);
  },
});

export function closeDb() {
  if (_client) {
    _client.end();
    _client = null;
    _db = null;
  }
}

export { trackers, votes };
export type {
  DumphimTracker,
  DumphimVote,
  NewDumphimTracker,
  NewDumphimVote,
  DumphimTrackerParsed,
};
