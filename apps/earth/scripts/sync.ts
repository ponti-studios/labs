import { sql } from "kysely";
import { withDb, type NewDisasterEvent } from "@pontistudios/db";
import { getDbConfig } from "../db/env";

// generic sync script; sources can be added to this list
const sources: {
  name: string;
  fetchFn: () => Promise<any[]>;
}[] = [
  {
    name: "eonet",
    fetchFn: async () => {
      // EONET logic with retries, geojson, and v2 fallback
      let url = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open";
      let res = await fetch(url);
      console.log(`  [eonet] initial request returned ${res.status}`);
      if (!res.ok && res.status >= 500) {
        console.warn(`v3 events failed, trying geojson endpoint`);
        url = "https://eonet.gsfc.nasa.gov/api/v3/events/geojson?status=open";
        res = await fetch(url);
        console.log(`  [eonet] geojson request returned ${res.status}`);
      }
      if (!res.ok) {
        console.warn("eonet still failing, skipping");
        return [];
      }
      const json = await res.json();
      const raw =
        json.type === "FeatureCollection" && Array.isArray(json.features)
          ? json.features.map((f: any) => f.properties)
          : json.events;
      // map to normalized shape (closer to NewDisasterEvent)
      return raw.map((evt: any) => ({
        id: evt.id,
        title: evt.title,
        description: evt.description || null,
        source_url: evt.link || evt.sources?.[0]?.url || null,
        category_id: evt.categories?.[0]?.id || "",
        category_title: evt.categories?.[0]?.title || "",
        occurred_at: evt.geometry?.[0]?.date || new Date().toISOString(),
        geometry_type: evt.geometry?.[0]?.type || "",
        latitude: evt.geometry?.[0]?.coordinates?.[1] ?? 0,
        longitude: evt.geometry?.[0]?.coordinates?.[0] ?? 0,
        closed_at: evt.closed || null,
      }));
    },
  },
  {
    name: "usgs",
    fetchFn: async () => {
      const res = await fetch(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
      );
      console.log(`  [usgs] request returned ${res.status}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.features.map((f: any) => ({
        id: f.id,
        title: f.properties.title,
        description: null,
        source_url: f.properties.url,
        category_id: "earthquake",
        category_title: "Earthquake",
        occurred_at: new Date(f.properties.time).toISOString(),
        geometry_type: "Point",
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        closed_at: null,
      }));
    },
  },
];

// helper for batching
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  await withDb(getDbConfig(), async (db) => {
    for (const src of sources) {
      console.log(`${new Date().toISOString()} fetching from ${src.name}`);
      const events = await src.fetchFn();
      console.log(`${new Date().toISOString()} received ${events.length} items from ${src.name}`);
      let records: NewDisasterEvent[] = events.map(
        (evt) =>
          ({
            ...evt,
            source: src.name,
            timestamp: evt.occurred_at,
          }) as NewDisasterEvent,
      );

      const ids = records.map((r) => r.id);
      const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
      if (dupIds.length) {
        console.warn(
          `found ${dupIds.length} duplicate ids in fetched data:`,
          Array.from(new Set(dupIds)).slice(0, 20),
        );
      }

      const uniqueMap = new Map<string, NewDisasterEvent>();
      for (const r of records) {
        uniqueMap.set(r.id, r);
      }
      const deduped = Array.from(uniqueMap.values());
      if (deduped.length !== records.length) {
        console.log(`deduped removed ${records.length - deduped.length} items`);
      }
      records = deduped;

      const batchSize = 500;
      const batches = chunkArray(records, batchSize);
      let totalUpserted = 0;
      console.log(`upserting ${records.length} (deduped) records in ${batches.length} batches`);

      for (const batch of batches) {
        await db
          .insertInto("disaster_events")
          .values(batch)
          .onDuplicateKeyUpdate({
            title: sql`values(title)`,
            description: sql`values(description)`,
            source_url: sql`values(source_url)`,
            category_id: sql`values(category_id)`,
            category_title: sql`values(category_title)`,
            occurred_at: sql`values(occurred_at)`,
            geometry_type: sql`values(geometry_type)`,
            latitude: sql`values(latitude)`,
            longitude: sql`values(longitude)`,
            closed_at: sql`values(closed_at)`,
            source: sql`values(source)`,
            timestamp: sql`values(timestamp)`,
          })
          .execute();

        totalUpserted += batch.length;
      }
      console.log(
        `${new Date().toISOString()} finished ${src.name}, upserted ${totalUpserted} rows`,
      );
    }

    const [{ count }] = await db
      .selectFrom("disaster_events")
      .select(db.fn.count<number>("id").as("count"))
      .execute();
    console.log(`${new Date().toISOString()} total stored events:`, count);
  });
}

main()
  .then(() => {
    console.log("main finished");
  })
  .catch((err) => {
    console.error("main error:", err);
    process.exitCode = 1;
  });
