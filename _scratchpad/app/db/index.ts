import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { covidData, tflCameras } from './schema';

// Get database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

let _db: ReturnType<typeof drizzle> | null = null;
let _client: postgres.Sql | null = null;

function initializeDb() {
  if (_db) return _db;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  _client = postgres(DATABASE_URL);
  _db = drizzle(_client, { schema: { tflCameras, covidData } });
  return _db;
}

// Getter that initializes the database connection lazily
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const dbInstance = initializeDb();
    return Reflect.get(dbInstance, prop);
  },
});

export { tflCameras, covidData };

// Close database connection
export function closeDb() {
  if (_client) {
    _client.end();
    _client = null;
    _db = null;
  }
}
