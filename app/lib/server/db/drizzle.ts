import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * from "drizzle-orm";

type GlobalDb = typeof globalThis & {
  __labsSql?: postgres.Sql;
  __labsDb?: ReturnType<typeof drizzle<typeof schema>>;
};

const globalDb = globalThis as GlobalDb;

let _db: ReturnType<typeof drizzle<typeof schema>> | null = globalDb.__labsDb ?? null;
let _client: postgres.Sql | null = globalDb.__labsSql ?? null;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  if (process.env.NODE_ENV === "test") {
    return "postgresql://postgres:postgres@localhost:4433/hominem-test";
  }
  throw new Error("DATABASE_URL environment variable is required");
}

function poolSize() {
  if (process.env.NODE_ENV === "test") return 2;
  if (process.env.NODE_ENV === "production") return 10;
  return 4;
}

function initializeClient() {
  if (_client) return _client;
  _client = postgres(getDatabaseUrl(), {
    max: poolSize(),
    idle_timeout: 20,
    connect_timeout: 10,
  });
  globalDb.__labsSql = _client;
  return _client;
}

function initializeDb() {
  if (_db) return _db;
  _db = drizzle(initializeClient(), { schema });
  globalDb.__labsDb = _db;
  return _db;
}

export function getSql() {
  return initializeClient();
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return Reflect.get(initializeDb(), prop);
  },
});

export function closeDb() {
  if (_client) {
    _client.end();
    _client = null;
    _db = null;
    globalDb.__labsSql = undefined;
    globalDb.__labsDb = undefined;
  }
}
