import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export interface PostgresDbConfig {
  databaseUrl: string;
  prepare?: boolean;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

let defaultDb: PostgresJsDatabase<typeof schema> | null = null;
let defaultClient: postgres.Sql | null = null;

export function createPostgresDb(config: PostgresDbConfig): {
  db: PostgresJsDatabase<typeof schema>;
  client: postgres.Sql;
} {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = postgres(config.databaseUrl, {
    prepare: config.prepare ?? false,
    ssl:
      config.ssl ??
      (process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false),
  });

  const db = drizzle(client, { schema });

  return { db, client };
}

export function getPostgresDb(config?: PostgresDbConfig): {
  db: PostgresJsDatabase<typeof schema>;
  client: postgres.Sql;
} {
  if (defaultDb && defaultClient) {
    return { db: defaultDb, client: defaultClient };
  }

  const databaseUrl =
    config?.databaseUrl ||
    process.env.DATABASE_URL ||
    process.env.VITE_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is required. Set it in your .env file or pass it to getPostgresDb()."
    );
  }

  const { db, client } = createPostgresDb({
    databaseUrl,
    prepare: config?.prepare,
    ssl: config?.ssl,
  });

  defaultDb = db;
  defaultClient = client;

  return { db, client };
}

export async function closePostgresDb(): Promise<void> {
  if (defaultClient) {
    await defaultClient.end();
    defaultClient = null;
    defaultDb = null;
  }
}

// Re-export schema for convenience
export { schema };

// Export a singleton db instance for convenience
export const { db } = getPostgresDb();

// Export types
export type Database = PostgresJsDatabase<typeof schema>;
