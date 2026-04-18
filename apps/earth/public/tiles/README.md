# Local Cesium tiles

This folder is the self-hosted source for Earth imagery and terrain.

## Expected layout

### Imagery

Use an XYZ-style tile pyramid:

```text
public/tiles/imagery/{z}/{x}/{y}.png
```

Recommended:

- 256x256 tiles
- Web Mercator projection
- zoom levels tuned to your source data

If you generate TMS tiles instead, update the viewer URL template accordingly. The generator script uses `--xyz` so the default viewer URL matches the output layout.

### Terrain

Use Cesium quantized-mesh terrain:

```text
public/tiles/terrain/layer.json
public/tiles/terrain/{z}/{x}/{y}.terrain
```

## Viewer configuration

The app uses free public defaults when no environment variables are set:

- imagery: OpenStreetMap
- terrain: VR-TheWorld

It also reads these optional environment variables to switch to local tiles:

```bash
VITE_EARTH_IMAGERY_URL=/tiles/imagery/{z}/{x}/{y}.png
VITE_EARTH_TERRAIN_URL=/tiles/terrain/
```

## Suggested generation tools

- `gdal2tiles.py` for raster tile pyramids
- `tippecanoe` for vector tiles
- Cesium Terrain Builder / quantized-mesh tooling for terrain

## Current behavior

If local tiles are missing, the app falls back to the free public providers.

If those providers fail, Cesium still falls back to:

- NaturalEarthII imagery
- ellipsoid terrain
