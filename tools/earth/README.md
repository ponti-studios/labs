# Earth local tile pipeline

This workspace supports self-hosted tiles for Cesium, but the app now defaults to free public imagery and terrain providers when no local tiles are configured.

## Output locations

- imagery: `apps/earth/public/tiles/imagery/`
- terrain: `apps/earth/public/tiles/terrain/`

## Input locations

- imagery source: `tools/earth/source/imagery.tif`
- terrain source: `tools/earth/source/terrain.dem.tif`

## Generated tile layout

### Imagery
Expected XYZ style output:

```text
public/tiles/imagery/{z}/{x}/{y}.png
```

The viewer defaults to:

```text
/tiles/imagery/{z}/{x}/{y}.png
```

### Terrain
Expected quantized-mesh terrain output:

```text
public/tiles/terrain/layer.json
public/tiles/terrain/{z}/{x}/{y}.terrain
```

The viewer defaults to:

```text
/tiles/terrain/
```

## Commands

From the repo root:

```bash
pnpm earth:tiles:imagery
pnpm earth:tiles:terrain
```

You can override source/output paths:

```bash
node tools/earth/generate-imagery.mjs --source ./my-imagery.tif --output ./apps/earth/public/tiles/imagery
node tools/earth/generate-terrain.mjs --source ./my-terrain.dem.tif --output ./apps/earth/public/tiles/terrain
```

## Tooling requirements

### Imagery generation
Requires `gdal2tiles.py` from a GDAL installation.

### Terrain generation
Requires `ctb-tile` from Cesium Terrain Builder or a compatible quantized-mesh terrain tool.

## Current fallback behavior
If local tiles do not exist yet, the app falls back to:
- OpenStreetMap imagery
- VR-TheWorld terrain

If those public services fail, Cesium still falls back to:
- NaturalEarthII imagery
- ellipsoid terrain
