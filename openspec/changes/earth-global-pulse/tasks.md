## 1. Data ingestion framework

- [x] 1.1 Rename `scripts/sync-nasa.ts` to `scripts/sync.ts` and convert it into a generic loader that reads a list of source definitions. (renamed; added example sources and updated script entry `sync`)
- [x] 1.2 Add a `source` column to the `disaster_events` table and generate a migration for it. (manual SQL applied; table now has source+timestamp columns)
- [ ] 1.3 Implement two sample source handlers: EONET (v3+v2 fallback) and USGS earthquakes.
- [ ] 1.4 Extend `db/types.ts` and related types to include `timestamp` and optional `source` fields.
- [ ] 1.5 Write tests for the ingestion logic using a mocked fetch response.

## 2. Satellite imagery support

- [ ] 2.1 Add a `satelliteLayers.ts` config listing a few GIBS layer names/URLs.
- [ ] 2.2 Create a `SatelliteLayer` component wrapping `react-globe.gl` tile layer support.
- [ ] 2.3 Add a UI control (dropdown) to select the active imagery layer.
- [ ] 2.4 Verify that switching layers updates the globe background correctly.

## 3. Event visualization & controls

- [ ] 3.1 Modify `Globe.tsx` to accept multiple event datasets and render them as point clusters.
- [ ] 3.2 Add a time slider component that filters events by `timestamp`.
- [ ] 3.3 Add category/source filters to the UI and hook them into the query.
- [ ] 3.4 Write a simple integration test that loads the globe with mock data and verifies markers appear.

## 4. Documentation and examples

- [ ] 4.1 Update README with instructions for adding new data sources and imagery layers.
- [ ] 4.2 Add a short tutorial in `docs/plan.md` demonstrating how to ingest a new feed.
- [ ] 4.3 Document the schedule/cron suggestion for running `sync.ts` periodically.

## 5. Finalize and cleanup

- [ ] 5.1 Run lint/format and fix any issues introduced by new code.
- [ ] 5.2 Add or update any necessary dependencies in `package.json`.
- [ ] 5.3 Commit all changes, update openspec artifacts, and prepare for review.
