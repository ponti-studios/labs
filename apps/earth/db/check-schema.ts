const databaseUrl = process.env.DATABASE_URL

async function main() {
  console.log('Checking database tables...')
  
  try {
    const mysql = await import('mysql2/promise')
    const pool = mysql.createPool({
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    })
    
    const conn = await pool.getConnection()
    console.log('Connected to database')
    
    // List tables
    const [tables] = await conn.execute('SHOW TABLES')
    console.log('Tables:', tables)
    
    // Check disaster_events specifically
    try {
      const [rows] = await conn.execute('DESCRIBE disaster_events')
      console.log('disaster_events columns:', rows)
    } catch (e: any) {
      console.log('disaster_events table does not exist or error:', e.message)
    }
    
    conn.release()
    await pool.end()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
