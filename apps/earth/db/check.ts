import { getDb, closeDb } from '@pontistudios/earth-db'

async function main() {
  console.log('Starting db check...')
  
  try {
    console.log('Calling getDb()...')
    const db = await getDb()
    console.log('getDb() returned')
    
    console.log('Querying...')
    const result = await db
      .selectFrom('disaster_events')
      .select((eb: any) => eb.fn.count('id').as('event_count'))
      .executeTakeFirst()
    console.log('DB connection OK. disaster_events count:', Number((result as any)?.event_count ?? 0))
  } catch (error) {
    console.error('DB check failed:', error)
    throw error
  }
}

main()
  .catch((error) => {
    console.error('Error in main:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    console.log('Closing database connection...')
    await closeDb()
    console.log('Database connection closed')
  })


