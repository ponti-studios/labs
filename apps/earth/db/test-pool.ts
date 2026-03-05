const databaseUrl = process.env.DATABASE_URL

async function main() {
  console.log('Testing raw mysql2 pool...')
  console.log('DATABASE_URL:', databaseUrl ? 'set' : 'NOT SET')
  
  try {
    const mysql = await import('mysql2/promise')
    console.log('Creating pool...')
    const pool = mysql.createPool({
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    })
    
    console.log('Getting connection...')
    const conn = await pool.getConnection()
    console.log('Got connection, executing query...')
    
    const [rows] = await conn.execute('SELECT COUNT(*) as count FROM disaster_events')
    console.log('Query result:', rows)
    
    conn.release()
    console.log('Connection released, closing pool...')
    await pool.end()
    console.log('Pool closed')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
