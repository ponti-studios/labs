import { Kysely, MysqlDialect, sql } from 'kysely'
import type { Database } from '@pontistudios/earth-db'

const databaseUrl = process.env.DATABASE_URL

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

async function main() {
  try {
    console.log('Importing mysql2/promise...')
    const mysql = await import('mysql2/promise')
    
    const config = parseConnectionUrl(databaseUrl!)
    console.log('Creating pool...')
    const mysqlPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
    
    console.log('Creating Kysely instance...')
    const db = new Kysely<Database>({
      dialect: new MysqlDialect({
        pool: mysqlPool,
      }),
    })
    
    console.log('Test 1: Raw SQL query...')
    const result1 = await db.executeQuery(
      sql`SELECT COUNT(*) as count FROM disaster_events`.compile(db)
    )
    console.log('Result 1:', result1)
    
    console.log('\nTest 2: Query builder...')
    const result2 = await db
      .selectFrom('disaster_events')
      .select(async (eb: any) => {
        console.log('eb:', typeof eb)
        return eb.fn.count('id').as('event_count')
      })
      .executeTakeFirst()
    console.log('Result 2:', result2)
    
    await mysqlPool.end()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
