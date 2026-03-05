## Context

The current `apps/earth` demo is a simple globe showing events fetched from a
single NASA EONET endpoint.  We have already cleaned up the repository and
added a generic sync script as part of the earlier `prepare-earth-repo-for-success`
change.  With the EONET API now unreliable, the natural next step is to
broaden the data sources and provide richer visual context (satellite
imagery).  This change introduces cross-cutting behavior: ingestion of
multiple feeds, a small data model extension, and integration of remote
imagery tiles onto the globe.

## Goals / Non-Goals

**Goals:**

- Build a **data-ingestion framework** that can fetch from any HTTP JSON/GeoJSON
  endpoint and normalize results into a common table(s).
- Add support for **satellite imagery** backgrounds using NASA GIBS WMTS/tiles.
- Enable the globe UI to show multiple event layers with time filtering.
- Keep the existing SQLite/MySQL flexibility; ingestion should not require a
  server-side component beyond the sync script.
- Documentation and examples for adding new sources or imagery layers.

**Non-Goals:**

- No attempt to build a full backend service; sync script remains a CLI tool.
- No heavy analytics or machine‑learning features – this is a visualization
  playground.
- We will not attempt to replicate every GIS function (PostGIS, etc.) in the
  initial phase; spatial queries may be limited to bounding-box filtering.

## Decisions

- **Data model**: reuse the existing `disaster_events` table for all point-based
  feeds.  Add a `source` column to distinguish origins if necessary; treat all
  records as `NewDisasterEvent`.  Polygon geometries (like weather cells) will
  be flattened to centroid points to avoid schema complexity.

- **Ingestion engine**: extend `scripts/sync-nasa.ts` to become a generic
  `sync.js` that accepts a config of sources.  Each source defines a URL,
  parser function, and optional schedule.  Use Kysely for upsert logic with
  `.onConflict().doUpdateSet()`.

- **Imagery tiles**: integrate a new `SatelliteLayer` component wrapping
  `react-globe.gl`'s `Globe` `customLayer` prop.  Fetch WMTS tile URLs from a
  small config file; allow switching layers via a dropdown.  Use Leaflet-style
  tile URL templates (`{z}/{x}/{y}.png`) from GIBS.

- **Time slider**: store a `timestamp` field in each ingested record.  add a
  React slider control bound to a React Query that re-fetches events for the
  selected day.  Filtering occurs client-side; the SQL query will include a
  `WHERE occurred_at >= ? AND occurred_at <= ?` clause when necessary.

- **Dependency choices**: keep dependencies minimal.  `node-fetch` is not
  required under Bun; use built-in `fetch`.  For tile handling we’ll rely on
  whatever `react-globe.gl` exposes (it already supports texture layers).

## Risks / Trade-offs

- [API outages] → multiple sources may fail simultaneously (seen with EONET).
  **Mitigation:** retry logic, fallback to previous cache, and ability to
  disable problematic sources.
- [Data volume] → ingesting high-frequency feeds could bloat the local DB.
  **Mitigation:** add optional retention policy or use `ON CONFLICT` updates
  to avoid duplicates.
- [Tile licensing] → some satellite layers may have usage restrictions.  **Mitigation:** stick to GIBS which is public domain and clearly credit NASA.
- [Performance] → rendering thousands of points on the globe may slow down.
  **Mitigation:** cluster points or throttle rendering; limit initial query
  window (e.g. last 7 days).

## Migration Plan

1. Add `source` column to `disaster_events` (optional).  Run a one-off
   migration script if the table exists already.
2. Extend `scripts/sync-nasa.ts` into a generic `sync.ts` and adjust README.
3. Add new UI components (layer selector, time slider) and modify existing
   `Globe.tsx` to accept additional props.
4. Update documentation with examples of two sources (EONET and USGS) and one
   imagery layer (MODIS True Color).
5. Deploy changes by merging to `main` and running `pnpm run db:migrate:diff` to
   generate any new migrations needed.

## Open Questions

- Should we persist images locally or rely on GIBS CDN?  (probably the CDN,
  since local caching is handled by the browser.)
- How to expose data source configuration (JSON file, environment variable?
  CLI arguments?)
- Do we need polygon support or is point-centroid sufficient?  Could defer
  until a later change. 