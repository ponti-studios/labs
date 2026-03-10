import type { PageContent, TabInfo } from './types.ts'

const API_BASE = 'http://localhost:4000'

export interface ChatContext {
  currentPage?: PageContent | null
  additionalPages?: PageContent[]
  tabs?: TabInfo[]
}

export async function streamChat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: ChatContext,
  onText: (text: string) => void
): Promise<void> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  })

  if (!response.ok) throw new Error(`Server error: HTTP ${response.status}`)
  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6)) as {
          type: 'text' | 'done' | 'error'
          text?: string
          error?: string
        }
        if (data.type === 'text' && data.text) onText(data.text)
        if (data.type === 'error') throw new Error(data.error)
      } catch (e) {
        if (e instanceof SyntaxError) continue
        throw e
      }
    }
  }
}
