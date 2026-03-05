import { db } from '../db/client'
import type { NewDisasterEvent } from '../db/types'

// `fetch` is globally available in Bun and modern Node

// fetch open events from NASA EONET
async function fetchEvents(attempt = 1): Promise<any[]> {
  const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open')
  if (!res.ok) {
    if (attempt < 3) {
      console.warn(`fetch failed (${res.status}); retrying...`)
      await new Promise((r) => setTimeout(r, 1000 * attempt))
      return fetchEvents(attempt + 1)
    }
    throw new Error(`eonet fetch failed: ${res.statusText}`)
  }
  const json = await res.json()
  return json.events as any[]
}

function toRecord(evt: any): NewDisasterEvent {
  const geom = evt.geometry?.[0] || {}
  return {
    id: evt.id,
    title: evt.title,
    description: evt.description || null,
    source_url: evt.sources?.[0]?.url || null,
    category_id: evt.categories?.[0]?.id || '',
    category_title: evt.categories?.[0]?.title || '',
    occurred_at: evt.geometry?.[0]?.date || new Date().toISOString(),
    geometry_type: geom.type || '',
    latitude: geom.coordinates?.[1] ?? 0,
    longitude: geom.coordinates?.[0] ?? 0,
    closed_at: evt.closed || null,
  }
}

async function main() {
  const events = await fetchEvents()
  console.log(`fetched ${events.length} events`)

  for (const evt of events) {
    const rec = toRecord(evt)
    await db
      .insertInto('disaster_events')
      .values(rec)
      .onConflict((oc) =>
        oc.column('id').doUpdateSet(rec)
      )
      .execute()
  }

  const [{ count }] = await db
    .selectFrom('disaster_events')
    .select(db.fn.count('*').as('count'))
    .execute()
  console.log('total stored events:', count)
  await db.destroy()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
