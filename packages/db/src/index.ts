export * from './types'
export { createDb, withDb, getDb, closeDb } from './client'
export type { DbConfig } from './client'
export * from './env'
export * from './schema'

// PostgreSQL client for Drizzle ORM
export {
  createPostgresDb,
  getPostgresDb,
  closePostgresDb,
  schema,
  type Database,
  type PostgresDbConfig,
} from './postgres-client'
