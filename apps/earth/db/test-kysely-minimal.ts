import { Kysely, MysqlDialect } from 'kysely'
import mysql from 'mysql2/promise'

async function main() {
  console.log('Testing Kysely with minimal setup...')
  
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 1,
    enableKeepAlive: true,
  })
  
  const db = new Kysely<any>({
    dialect: new MysqlDialect({ pool }),
  })
  
  console.log('Executing query...')
  try {
    const result = await db.selectFrom('disaster_events').select(db.fn.count('id').as('count')).executeTakeFirst()
    console.log('Result:', result)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    console.log('Destroying db...')
    await db.destroy()
    console.log('Closing pool...')
    await pool.end()
    console.log('Done')
  }
}

main()
