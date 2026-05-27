import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { disasterEvents } from './schema/disaster';
import { relationshipPeople, relationshipStageHistory, relationshipEvents, relationshipNotes, relationshipCheckins, relationshipFlags, relationshipFriendInvites, relationshipFriendVotes, relationshipMetricsDaily } from './schema/relationships';
import { covidData, tflCameras, todos, tags, todoTags, embeddings } from './schema/playground';
import { trackers, votes } from './schema/social';
import { users, messages } from './schema/kuma';

export interface Database {
  disaster_events: typeof disasterEvents;
  relationship_people: typeof relationshipPeople;
  relationship_stage_history: typeof relationshipStageHistory;
  relationship_events: typeof relationshipEvents;
  relationship_notes: typeof relationshipNotes;
  relationship_checkins: typeof relationshipCheckins;
  relationship_flags: typeof relationshipFlags;
  relationship_invites: typeof relationshipFriendInvites;
  relationship_votes: typeof relationshipFriendVotes;
  relationship_metrics_daily: typeof relationshipMetricsDaily;
  covid_data: typeof covidData;
  tfl_cameras: typeof tflCameras;
  todos: typeof todos;
  tags: typeof tags;
  todo_tags: typeof todoTags;
  embeddings: typeof embeddings;
  trackers: typeof trackers;
  votes: typeof votes;
  users: typeof users;
  messages: typeof messages;
}

export interface DbConfig {
  databaseUrl: string;
}

let defaultDb: Kysely<Database> | null = null;

function parseConnectionUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || 'localhost',
    port: parseInt(parsed.port || '5432', 10),
    user: parsed.username || 'postgres',
    password: parsed.password || '',
    database: parsed.pathname?.slice(1) || 'test',
  };
}

export function createDb(config: DbConfig): Kysely<Database> {
  if (!config.databaseUrl || !config.databaseUrl.startsWith('postgres://') && !config.databaseUrl.startsWith('postgresql://')) {
    throw new Error(
      'databaseUrl must point to a PostgreSQL database (postgres://user:password@host:port/database)'
    );
  }

  const parsed = parseConnectionUrl(config.databaseUrl);

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: parsed.host,
        port: parsed.port,
        user: parsed.user,
        password: parsed.password,
        database: parsed.database,
        max: 10,
      }),
    }),
  });

  return db;
}

async function closeDbInstance(db: Kysely<Database>): Promise<void> {
  await db.destroy();
}

export async function withDb<T>(
  config: DbConfig,
  fn: (db: Kysely<Database>) => Promise<T>
): Promise<T> {
  const db = createDb(config);
  try {
    return await fn(db);
  } finally {
    await closeDbInstance(db);
  }
}

function getDatabaseUrlFromEnv(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://'))) {
    throw new Error(
      'DATABASE_URL must be set and point to a PostgreSQL database (postgres://user:password@host:port/database)'
    );
  }
  return databaseUrl;
}

export async function getDb(): Promise<Kysely<Database>> {
  if (defaultDb) return defaultDb;

  defaultDb = createDb({
    databaseUrl: getDatabaseUrlFromEnv(),
  });

  return defaultDb;
}

export async function closeDb(db?: Kysely<Database>): Promise<void> {
  if (db) {
    await closeDbInstance(db);
    return;
  }

  if (!defaultDb) return;
  await closeDbInstance(defaultDb);
  defaultDb = null;
}
