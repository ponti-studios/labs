import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { anthropic, MODEL } from '../lib/claude.ts'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

type PageContent = {
  url: string
  title: string
  content: string
  type: 'generic' | 'youtube' | 'ubereats'
  metadata?: Record<string, unknown>
}

type TabInfo = {
  id: number
  title: string
  url: string
}

type ChatRequest = {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  context?: {
    currentPage?: PageContent
    additionalPages?: PageContent[]
    tabs?: TabInfo[]
  }
}

function buildSystemPrompt(context: ChatRequest['context']): string {
  const parts: string[] = [
    'You are Polly, a helpful AI assistant integrated into the user\'s browser as a Chrome extension.',
    'You can see the content of web pages the user is viewing and help them understand, analyze, and act on that content.',
    '',
    'Capabilities:',
    '- Analyze and summarize any web page content',
    '- Answer questions about content on open tabs',
    '- Help analyze Uber Eats spending and order history',
    '- Calculate and discuss YouTube playlist durations',
    '- General assistance and conversation',
    '',
    'Be concise. When no page context is provided, answer from general knowledge.',
  ]

  if (context?.currentPage) {
    const page = context.currentPage
    parts.push('', '---', `CURRENT PAGE: ${page.title}`, `URL: ${page.url}`)

    if (page.type === 'youtube' && page.metadata) {
      parts.push('', 'YouTube Data:', JSON.stringify(page.metadata, null, 2))
    } else if (page.type === 'ubereats' && page.metadata) {
      parts.push('', 'Uber Eats Order Data:', JSON.stringify(page.metadata, null, 2))
    } else if (page.content) {
      parts.push('', 'Page Content:', page.content.slice(0, 50000))
    }
  }

  if (context?.additionalPages?.length) {
    parts.push('', '---', 'ADDITIONAL PAGES IN CONTEXT:')
    for (const page of context.additionalPages) {
      parts.push('', `PAGE: ${page.title}`, `URL: ${page.url}`)
      if (page.content) parts.push(page.content.slice(0, 20000))
    }
  }

  if (context?.tabs?.length) {
    parts.push('', '---', 'OPEN TABS:')
    for (const tab of context.tabs) {
      parts.push(`- ${tab.title} (${tab.url})`)
    }
  }

  return parts.join('\n')
}

export const chatRoute = new Hono()

chatRoute.post('/', async (c) => {
  let body: ChatRequest
  try {
    body = await c.req.json<ChatRequest>()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { messages, context } = body
  if (!messages?.length) {
    return c.json({ error: 'messages array is required' }, 400)
  }

  const systemPrompt = buildSystemPrompt(context)
  const anthropicMessages: MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  return streamSSE(c, async (stream) => {
    try {
      const response = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: anthropicMessages,
      })

      for await (const event of response) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          await stream.writeSSE({
            data: JSON.stringify({ type: 'text', text: event.delta.text }),
          })
        }
      }

      await stream.writeSSE({ data: JSON.stringify({ type: 'done' }) })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      await stream.writeSSE({
        data: JSON.stringify({ type: 'error', error: message }),
      })
    }
  })
})
