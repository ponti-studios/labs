import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

function assertSafe(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set to a test database when running these tests");
  }
  const parsed = new URL(url);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)) {
    throw new Error(`Unsafe test database host: ${parsed.hostname}`);
  }
  return url;
}

let _pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!_pool) {
    _pool = new pg.Pool({
      connectionString: assertSafe(),
      max: 1,
      idleTimeoutMillis: 60000,
    });
  }
  return _pool;
}

export function createTestDb(schema: Record<string, unknown>) {
  return drizzle(getPool(), { schema });
}

export async function cleanAll() {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM labs.daily_puzzles");
    await client.query("DELETE FROM labs.feed_games");
    await client.query("DELETE FROM labs.articles");
    await client.query("DELETE FROM labs.feeds");
    await client.query("DELETE FROM labs.games");
  } finally {
    client.release();
  }
}
