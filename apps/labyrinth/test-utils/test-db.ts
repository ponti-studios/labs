import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const TEST_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:4433/labs-test";

function assertSafe(): string {
  const parsed = new URL(TEST_URL);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)) {
    throw new Error(`Unsafe test database host: ${parsed.hostname}`);
  }
  return TEST_URL;
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
