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
    console.log('Importing mysql2...')
    const mysql2 = await import('mysql2')
    
    const config = parseConnectionUrl(databaseUrl!)
    console.log('Creating pool (non-promise)...')
    const pool = mysql2.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
    
    console.log('Getting connection from pool...')
    pool.getConnection((err, conn) => {
      if (err) {
        console.error('Error getting connection:', err)
        process.exit(1)
      }
      
      console.log('Executing query...')
      conn.query('SELECT COUNT(*) as count FROM disaster_events', (err, results) => {
        if (err) {
          console.error('Error executing query:', err)
          process.exit(1)
        }
        
        console.log('Query result:', results)
        conn.release()
        pool.end()
      })
    })
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
