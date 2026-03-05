import { Kysely, MysqlDialect, sql } from 'kysely'
import type { Database } from './types'
// use mysql2 (callback API) because Kysely's MysqlDriver expects a pool
// that supports `getConnection(callback)`. The promise wrapper doesn't
// support callbacks, which caused queries to hang when we supplied a
// promise pool earlier.
import mysql from 'mysql2'

const databaseUrl = process.env.DATABASE_URL

let db: Kysely<Database> | null = null
let pool: any = null
let initPromise: Promise<Kysely<Database>> | null = null

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

async function initializeDb(): Promise<Kysely<Database>> {
  if (db) return db
  if (initPromise) return initPromise

  initPromise = (async () => {
    if (!databaseUrl || !databaseUrl.startsWith('mysql://')) {
      throw new Error(
        'DATABASE_URL must be set and point to a MySQL database (mysql://user:password@host:port/database)'
      )
    }

    const config = parseConnectionUrl(databaseUrl)

    // Create pool with callback-style mysql2. Kysely will call
    // pool.getConnection(callback) internally. We can still obtain a
    // promise-based interface later via pool.promise() if needed.
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
    })

    // Create Kysely database
    console.log('[earth-db] Creating Kysely instance...')
    db = new Kysely<Database>({
      dialect: new MysqlDialect({
        pool: pool,
      }),
    })
    console.log('[earth-db] Kysely instance created')
    
    // Force a simple query to test the connection
    console.log('[earth-db] Running test query...')
    const result = await db.executeQuery(sql`SELECT 1`.compile(db))
    console.log('[earth-db] Test query result:', result)

    return db
  })()

  return initPromise
}

export async function getDb(): Promise<Kysely<Database>> {
  return initializeDb()
}

export async function closeDb() {
  if (db) {
    try {
      await db.destroy()
    } catch (e) {
      console.error('[earth-db] Error destroying db:', e)
    }
  }

  if (pool) {
    try {
      await pool.end()
    } catch (e) {
      console.error('[earth-db] Error closing pool:', e)
    }
  }
}

