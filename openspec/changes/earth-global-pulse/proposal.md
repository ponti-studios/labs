## Why

The existing `apps/earth` demo currently fetches open events from a single
API and renders them on a globe.  With EONET unreliable and the project
already supporting a generic database layer, there is a strong opportunity to
turn the app into a more compelling real‑time earth dashboard.  By ingesting
multiple open datasets and overlaying satellite imagery, the globe can
provide a "global pulse" of fires, storms, earthquakes and weather that is
both beautiful and informative.

## What Changes

- Add a flexible ingestion framework capable of pulling a variety of free
  open feeds (EONET, USGS earthquakes, Global Forest Watch fire alerts,
  etc.) and upserting into the local database.
- Introduce support for satellite imagery layers from NASA GIBS (MODIS/VIIRS)
  and allow users to switch/animate them as globe backgrounds.
- Enhance the sync script to handle multiple sources and to gracefully fall
  back when an upstream service is down.
- Extend the front‑end to render event layers with category filtering, time
  controls, and map‑over imagery tiles.
- Update documentation with examples of adding new data sources and imagery
  layers.

## Capabilities

### New Capabilities
- `data-ingestion`: A pluggable sync engine that can fetch and normalize any
  event-style open dataset into the repository’s database.
- `satellite-imagery`: Ability to configure and display MODIS/VIIRS imagery
  from NASA GIBS as a tiled background on the 3D globe.
- `visual-events`: Rendering pipeline for arbitrary event layers on the globe
  with filtering and interaction.

### Modified Capabilities
- *none* – existing capabilities are extended but their requirements remain
  unchanged.

## Impact

Affected code and systems will include:

- `scripts/` – enhanced sync program and new source-specific helpers.
- `db/` – may add new tables (e.g. `events`) or columns for multiple feeds.
- `src/` – new React components for imagery controls, time slider,
  and event markers; modifications to `Globe.tsx`.
- `package.json` – additional dependencies such as `node-fetch` (if needed),
  or GIS libraries for bounding boxes.
- Documentation – README, plan, and new developer guides for adding sources.
- External APIs – USGS, GFW, NASA GIBS (WMTS) in addition to EONET.

No breaking changes to the existing database schema are planned; new tables
or columns will be additive.