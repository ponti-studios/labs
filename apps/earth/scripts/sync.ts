import { getDb, closeDb, type NewDisasterEvent } from '@pontistudios/earth-db'

let db: any

// generic sync script; sources can be added to this list
const sources: {
  name: string
  fetchFn: () => Promise<any[]>
}[] = [
  {
    name: 'eonet',
    fetchFn: async () => {
      // EONET logic with retries, geojson, and v2 fallback
      let url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open'
      let res = await fetch(url)
      console.log(`  [eonet] initial request returned ${res.status}`)
      if (!res.ok && res.status >= 500) {
        console.warn(`v3 events failed, trying geojson endpoint`)
        url = 'https://eonet.gsfc.nasa.gov/api/v3/events/geojson?status=open'
        res = await fetch(url)
        console.log(`  [eonet] geojson request returned ${res.status}`)
      }
      if (!res.ok) {
        console.warn('eonet still failing, skipping')
        return []
      }
      const json = await res.json()
      const raw =
        json.type === 'FeatureCollection' && Array.isArray(json.features)
          ? json.features.map((f: any) => f.properties)
          : json.events
      // map to normalized shape (closer to NewDisasterEvent)
      return raw.map((evt: any) => ({
        id: evt.id,
        title: evt.title,
        description: evt.description || null,
        source_url: evt.link || evt.sources?.[0]?.url || null,
        category_id: evt.categories?.[0]?.id || '',
        category_title: evt.categories?.[0]?.title || '',
        occurred_at: evt.geometry?.[0]?.date || new Date().toISOString(),
        geometry_type: evt.geometry?.[0]?.type || '',
        latitude: evt.geometry?.[0]?.coordinates?.[1] ?? 0,
        longitude: evt.geometry?.[0]?.coordinates?.[0] ?? 0,
        closed_at: evt.closed || null,
      }))
    },
  },
  {
    name: 'usgs',
    fetchFn: async () => {
      const res = await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
      )
      console.log(`  [usgs] request returned ${res.status}`)
      if (!res.ok) return []
      const json = await res.json()
      return json.features.map((f: any) => ({
        id: f.id,
        title: f.properties.title,
        description: null,
        source_url: f.properties.url,
        category_id: 'earthquake',
        category_title: 'Earthquake',
        occurred_at: new Date(f.properties.time).toISOString(),
        geometry_type: 'Point',
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        closed_at: null,
      }))
    },
  },
]

// helper for batching
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

async function main() {
  db = await getDb()
  for (const src of sources) {
    console.log(`${new Date().toISOString()} fetching from ${src.name}`)
    const events = await src.fetchFn()
    console.log(`${new Date().toISOString()} received ${events.length} items from ${src.name}`)
    let records: NewDisasterEvent[] = events.map((evt) => ({
      ...evt,
      source: src.name,
      timestamp: evt.occurred_at,
    } as any))

    // log duplicate ids in the fetched data
    const ids = records.map((r) => r.id)
    const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i)
    if (dupIds.length) {
      console.warn(`found ${dupIds.length} duplicate ids in fetched data:`,
        Array.from(new Set(dupIds)).slice(0, 20))
    }

    // remove duplicates within a single sync run by id to avoid errors
    const uniqueMap = new Map<string, NewDisasterEvent>()
    for (const r of records) {
      uniqueMap.set(r.id, r)
    }
    const deduped = Array.from(uniqueMap.values())
    if (deduped.length !== records.length) {
      console.log(`deduped removed ${records.length - deduped.length} items`)
    }
    records = deduped

    const batchSize = 500
    const batches = chunkArray(records, batchSize)
    let totalInserted = 0
    console.log(`inserting ${records.length} (deduped) records in ${batches.length} batches`)

    for (const batch of batches) {
      try {
        await db
          .insertInto('disaster_events')
          .values(batch)
          // MySQL syntax uses "on duplicate key update"
          .onDuplicateKeyUpdate(batch[0])
          .execute()
        totalInserted += batch.length
      } catch (e) {
        console.error('batch insert failed:', e)
      }
    }
    console.log(
      `${new Date().toISOString()} finished ${src.name}, inserted/updated ${totalInserted} rows`
    )
  }
  // use simple select string for count
  const [{ count }] = await db
    .selectFrom('disaster_events')
    .select(db.fn.count<number>('id').as('count'))
    .execute()
  console.log(`${new Date().toISOString()} total stored events:`, count)
  await closeDb()
}

main()
  .then(() => {
    console.log('main finished, exiting now')
    process.exit(0)
  })
  .catch((err) => {
    console.error('main error:', err)
    process.exit(1)
  })
