import path from 'node:path'
import { fileURLToPath } from 'node:url'
import BetterSqlite3 from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import type { Database } from './types'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const databaseFile = process.env.DATABASE_FILE ?? path.resolve(currentDir, 'app.db')

// determine dialect based on DATABASE_URL or fallback to sqlite file
let dialect: any
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql://')) {
  // lazy import mysql2 to avoid pulling it for sqlite-only environments
  const { MySqlDialect } = await import('kysely/dist/esm/dialect/mysql/mysql-dialect.js')
  const mysql = await import('mysql2/promise')
  dialect = new MySqlDialect({
    pool: mysql.createPool(process.env.DATABASE_URL),
  })
} else {
  dialect = new SqliteDialect({
    database: new BetterSqlite3(databaseFile),
  })
}

export const db = new Kysely<Database>({
  dialect,
})

export async function closeDb() {
  await db.destroy()
}
