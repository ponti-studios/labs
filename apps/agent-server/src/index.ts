import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { chatRoute } from './routes/chat.ts'

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
)

app.route('/chat', chatRoute)
app.get('/health', (c) => c.json({ status: 'ok', model: 'claude-sonnet-4-6' }))

const port = Number(process.env.PORT ?? 4000)
console.log(`Polly agent server running on http://localhost:${port}`)

export default { port, fetch: app.fetch }
