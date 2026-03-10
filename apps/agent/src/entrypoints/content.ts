import type { PageContent } from '../lib/types.ts'

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'GET_PAGE_CONTENT') {
        sendResponse(extractPageContent())
        return true
      }
    })
  },
})

function extractPageContent(): PageContent {
  const url = window.location.href
  const title = document.title

  if (url.includes('youtube.com')) {
    return extractYouTubeContent(url, title)
  }
  if (url.includes('ubereats.com')) {
    return extractUberEatsContent(url, title)
  }
  return extractGenericContent(url, title)
}

function extractGenericContent(url: string, title: string): PageContent {
  // Try to get main article content, fall back to body text
  const article =
    document.querySelector('article') ??
    document.querySelector('main') ??
    document.querySelector('[role="main"]') ??
    document.body

  // Remove script/style nodes from clone
  const clone = article.cloneNode(true) as HTMLElement
  for (const el of clone.querySelectorAll('script, style, nav, footer, header')) {
    el.remove()
  }

  const content = (clone.innerText ?? clone.textContent ?? '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 100000)

  return { url, title, content, type: 'generic' }
}

function parseTimestamp(str: string): number {
  const parts = str.trim().split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] ?? 0
}

function extractYouTubeContent(url: string, title: string): PageContent {
  const timeEls = document.querySelectorAll(
    'ytd-thumbnail-overlay-time-status-renderer span[aria-label], ' +
      'ytd-thumbnail-overlay-time-status-renderer span.ytd-thumbnail-overlay-time-status-renderer'
  )

  const durations: number[] = []
  for (const el of timeEls) {
    const text = el.textContent?.trim()
    if (text && /^\d+:\d+/.test(text)) {
      durations.push(parseTimestamp(text))
    }
  }

  const totalSeconds = durations.reduce((a, b) => a + b, 0)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  const playlistTitle =
    document.querySelector('h1.ytd-playlist-header-renderer')?.textContent?.trim() ?? title

  return {
    url,
    title: playlistTitle,
    content: `YouTube page with ${durations.length} videos. Total duration: ${h}h ${m}m ${s}s.`,
    type: 'youtube',
    metadata: {
      videoCount: durations.length,
      totalSeconds,
      totalDuration: `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      isPlaylist: url.includes('list='),
    },
  }
}

function extractUberEatsContent(url: string, title: string): PageContent {
  interface Order {
    restaurant: string
    amount: number
    date: string
  }

  const orders: Order[] = []

  // Try multiple selector strategies
  const orderCards = document.querySelectorAll(
    '[data-testid="order-card"], .order-card, [class*="OrderCard"]'
  )

  for (const card of orderCards) {
    const restaurantEl = card.querySelector(
      '[data-testid="restaurant-name"], [class*="restaurant"], [class*="Restaurant"]'
    )
    const amountEl = card.querySelector(
      '[data-testid="order-total"], [class*="total"], [class*="Total"]'
    )
    const dateEl = card.querySelector(
      '[data-testid="order-date"], [class*="date"], [class*="Date"], time'
    )

    const restaurant = restaurantEl?.textContent?.trim() ?? ''
    const amountText = amountEl?.textContent?.trim() ?? ''
    const date = dateEl?.textContent?.trim() ?? ''

    const amount = parseFloat(amountText.replace(/[^0-9.]/g, '')) || 0

    if (restaurant) orders.push({ restaurant, amount, date })
  }

  const totalSpending = orders.reduce((sum, o) => sum + o.amount, 0)

  // Restaurant breakdown
  const byRestaurant: Record<string, { count: number; total: number }> = {}
  for (const o of orders) {
    if (!byRestaurant[o.restaurant]) byRestaurant[o.restaurant] = { count: 0, total: 0 }
    byRestaurant[o.restaurant].count++
    byRestaurant[o.restaurant].total += o.amount
  }

  return {
    url,
    title: 'Uber Eats Order History',
    content: `Found ${orders.length} orders. Total spending: $${totalSpending.toFixed(2)}.`,
    type: 'ubereats',
    metadata: {
      orderCount: orders.length,
      totalSpending: parseFloat(totalSpending.toFixed(2)),
      orders,
      byRestaurant,
    },
  }
}
