import { Kysely, MysqlDialect } from 'kysely'
import type { Database } from './types'
import mysql from 'mysql2'

export interface DbConfig {
  databaseUrl: string
  connectionLimit?: number
  queueLimit?: number
  enableKeepAlive?: boolean
}

let defaultDb: Kysely<Database> | null = null

function parseConnectionUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname || 'localhost',
    port: parseInt(parsed.port || '3306', 10),
    user: parsed.username || 'root',
    password: parsed.password || '',
    database: parsed.pathname?.slice(1) || 'test',
  }
}

export function createDb(config: DbConfig): Kysely<Database> {
  if (!config.databaseUrl || !config.databaseUrl.startsWith('mysql://')) {
    throw new Error(
      'databaseUrl must point to a MySQL database (mysql://user:password@host:port/database)'
    )
  }

  const parsed = parseConnectionUrl(config.databaseUrl)
  const pool = mysql.createPool({
    host: parsed.host,
    port: parsed.port,
    user: parsed.user,
    password: parsed.password,
    database: parsed.database,
    waitForConnections: true,
    connectionLimit: config.connectionLimit ?? 10,
    queueLimit: config.queueLimit ?? 0,
    enableKeepAlive: config.enableKeepAlive ?? true,
  })

  const db = new Kysely<Database>({
    // mysql2 callback pool is runtime-compatible with Kysely, but the
    // upstream type interface is narrower than mysql2's callback signatures.
    dialect: new MysqlDialect({ pool: pool as any }),
  })

  return db
}

async function closeDbInstance(db: Kysely<Database>): Promise<void> {
  await db.destroy()
}

export async function withDb<T>(
  config: DbConfig,
  fn: (db: Kysely<Database>) => Promise<T>
): Promise<T> {
  const db = createDb(config)
  try {
    return await fn(db)
  } finally {
    await closeDbInstance(db)
  }
}

function getDatabaseUrlFromEnv(): string {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl || !databaseUrl.startsWith('mysql://')) {
    throw new Error(
      'DATABASE_URL must be set and point to a MySQL database (mysql://user:password@host:port/database)'
    )
  }
  return databaseUrl
}

// Backward compatibility for existing scripts. Prefer createDb/withDb.
export async function getDb(): Promise<Kysely<Database>> {
  if (defaultDb) return defaultDb

  defaultDb = createDb({
    databaseUrl: getDatabaseUrlFromEnv(),
  })

  return defaultDb
}

// Backward compatibility for existing scripts that rely on singleton lifecycle.
export async function closeDb(db?: Kysely<Database>): Promise<void> {
  if (db) {
    await closeDbInstance(db)
    return
  }

  if (!defaultDb) return
  await closeDbInstance(defaultDb)
  defaultDb = null
}

