import * as Cesium from "cesium";
import type { Satellite } from "../services/satelliteService";
import { getSatelliteColor, calculateOrbitPath } from "../services/satelliteService";

/**
 * CesiumViewer - Custom element wrapper for Cesium
 * Keeps all Cesium state imperative (not in Svelte framework state)
 * Only exposes minimal API for Svelte to interact with
 */
export class CesiumViewer extends HTMLElement {
  private viewer: Cesium.Viewer | null = null;
  private container: HTMLDivElement | null = null;

  // Imperative state - not mirrored to Svelte
  private entityCollection: Map<string, Cesium.Entity> = new Map();
  private orbitCollection: Map<string, Cesium.Entity> = new Map();
  private satellitePositions: Map<string, { lon: number; lat: number; alt: number }> = new Map();
  private countryEntities: Map<string, Cesium.Entity> = new Map();
  private covidPoints: Map<string, Cesium.Entity> = new Map();
  private _isReady = false;
  private countryClickHandler: Cesium.ScreenSpaceEventHandler | null = null;
  private countryClickCallback: ((iso3: string, name: string) => void) | null = null;
  private highlightedCountry: string | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    console.log("[CesiumViewer] connectedCallback");
    this.render();
    this.initViewer();
  }

  disconnectedCallback() {
    console.log("[CesiumViewer] disconnectedCallback");
    this.destroyViewer();
  }

  private render() {
    this.style.display = "block";
    this.style.width = "100%";
    this.style.height = "100%";

    this.container = document.createElement("div");
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.appendChild(this.container);
  }

  private initViewer() {
    if (!this.container) {
      console.error("[CesiumViewer] No container found");
      return;
    }

    try {
      console.log("[CesiumViewer] Initializing viewer...");

      // Initialize Cesium viewer with minimal UI
      this.viewer = new Cesium.Viewer(this.container, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        creditContainer: document.createElement("div"), // Hide credits
        skyBox: new Cesium.SkyBox({
          sources: {
            positiveX: "/cesium/Assets/Textures/SkyBox/tycho2t3_80_px.jpg",
            negativeX: "/cesium/Assets/Textures/SkyBox/tycho2t3_80_mx.jpg",
            positiveY: "/cesium/Assets/Textures/SkyBox/tycho2t3_80_py.jpg",
            negativeY: "/cesium/Assets/Textures/SkyBox/tycho2t3_80_my.jpg",
            positiveZ: "/cesium/Assets/Textures/SkyBox/tycho2t3_80_pz.jpg",
            negativeZ: "/cesium/Assets/Textures/SkyBox/tycho2t3_80_mz.jpg",
          },
        }),
        skyAtmosphere: new Cesium.SkyAtmosphere(),
        shouldAnimate: false,
        targetFrameRate: 60,
      });

      // Configure scene - make globe solid and visible
      this.viewer.scene.globe.enableLighting = true;
      this.viewer.scene.globe.depthTestAgainstTerrain = true;

      // Ensure globe is not transparent
      this.viewer.scene.globe.baseColor = Cesium.Color.BLACK;
      this.viewer.scene.backgroundColor = Cesium.Color.BLACK;

      // Add a visible base layer if one isn't present
      if (!this.viewer.imageryLayers.length) {
        // Add default Cesium ion imagery as fallback
        const imageryProvider = new Cesium.IonImageryProvider({ assetId: 2 });
        this.viewer.imageryLayers.addImageryProvider(imageryProvider);
      }

      // Configure camera to allow zooming all the way to street level
      const screenSpaceController = this.viewer.scene.screenSpaceCameraController;
      screenSpaceController.minimumZoomDistance = 1; // 1 meter minimum - street level
      screenSpaceController.maximumZoomDistance = 10000000000; // Allow zooming out very far
      screenSpaceController.enableCollisionDetection = true;
      screenSpaceController.minimumPickingTerrainHeight = 0;

      // Allow camera to go underground and very close to surface
      this.viewer.scene.globe.depthTestAgainstTerrain = false; // Don't clip camera

      // Enable high-quality rendering at all zoom levels
      this.viewer.scene.globe.maximumScreenSpaceError = 2;

      // Enable lighting for better detail at close range
      this.viewer.scene.globe.enableLighting = true;

      // Apply default satellite style
      this.applySatelliteStyle();

      // Set initial view
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
        duration: 0,
      });

      this._isReady = true;
      console.log("[CesiumViewer] Viewer ready, dispatching event");

      // Dispatch event for Svelte to catch
      this.dispatchEvent(
        new CustomEvent("viewer-ready", {
          bubbles: true,
          composed: true,
          detail: { viewer: this },
        }),
      );
    } catch (error) {
      console.error("[CesiumViewer] Error initializing viewer:", error);
    }
  }

  private destroyViewer() {
    this.entityCollection.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });
    this.entityCollection.clear();

    this.orbitCollection.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });
    this.orbitCollection.clear();

    this.satellitePositions.clear();

    this.viewer?.destroy();
    this.viewer = null;
    this._isReady = false;

    if (this.container) {
      this.removeChild(this.container);
      this.container = null;
    }
  }

  // Public imperative API for Svelte to call

  flyTo(longitude: number, latitude: number, height: number, duration = 2): void {
    if (!this.viewer) return;

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      duration,
    });
  }

  addPoint(
    id: string,
    longitude: number,
    latitude: number,
    color: string = "#ff0000",
    size = 10,
  ): void {
    if (!this.viewer || this.entityCollection.has(id)) return;

    const cesiumColor = Cesium.Color.fromCssColorString(color);
    const entity = this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      point: {
        pixelSize: size,
        color: cesiumColor,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
    });

    this.entityCollection.set(id, entity);
  }

  removePoint(id: string): void {
    const entity = this.entityCollection.get(id);
    if (entity && this.viewer) {
      this.viewer.entities.remove(entity);
      this.entityCollection.delete(id);
    }
  }

  clearEntities(): void {
    if (!this.viewer) return;

    this.entityCollection.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });
    this.entityCollection.clear();
  }

  // Satellite API

  addSatellite(satellite: Satellite): void {
    if (!this.viewer || this.entityCollection.has(`sat-${satellite.id}`)) return;

    const color = getSatelliteColor(satellite.type);
    const pixelSize = satellite.type === "iss" || satellite.type === "space-station" ? 25 : 18;

    // Store initial position
    this.satellitePositions.set(satellite.id, {
      lon: satellite.longitude,
      lat: satellite.latitude,
      alt: satellite.altitude,
    });

    // Create a CallbackProperty that returns the current position every frame
    const positionProperty = new Cesium.CallbackProperty((time) => {
      const pos = this.satellitePositions.get(satellite.id);
      if (pos) {
        return Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt);
      }
      return Cesium.Cartesian3.fromDegrees(0, 0, 0);
    }, false);

    // Create satellite entity with label - make it very visible
    const entity = this.viewer.entities.add({
      id: `sat-${satellite.id}`,
      position: positionProperty,
      point: {
        pixelSize,
        color,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        scaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.8),
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always show on top
      },
      label: {
        text: satellite.name,
        font: "bold 16px sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -15),
        translucencyByDistance: new Cesium.NearFarScalar(1.5e5, 1.0, 1.5e7, 0.0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    this.entityCollection.set(`sat-${satellite.id}`, entity);

    console.log(
      `[CesiumViewer] Added satellite: ${satellite.name} at ${satellite.latitude.toFixed(2)}, ${satellite.longitude.toFixed(2)}`,
    );
  }

  updateSatellitePosition(id: string, longitude: number, latitude: number, altitude: number): void {
    // Simply update the stored position - CallbackProperty will pick it up
    this.satellitePositions.set(id, { lon: longitude, lat: latitude, alt: altitude });
  }

  removeSatellite(id: string): void {
    const entityId = `sat-${id}`;
    const entity = this.entityCollection.get(entityId);
    if (entity && this.viewer) {
      this.viewer.entities.remove(entity);
      this.entityCollection.delete(entityId);
    }

    // Also remove orbit if exists
    this.hideSatelliteOrbit(id);
    this.satellitePositions.delete(id);
  }

  showSatelliteOrbit(id: string): void {
    if (!this.viewer) return;

    // Remove existing orbit
    this.hideSatelliteOrbit(id);

    const pos = this.satellitePositions.get(id);
    if (!pos) return;

    // Create a temporary satellite object for orbit calculation
    const satellite: Satellite = {
      id,
      name: "",
      type: "satellite",
      latitude: pos.lat,
      longitude: pos.lon,
      altitude: pos.alt,
      velocity: 0,
      timestamp: new Date(),
    };

    const orbitPositions = calculateOrbitPath(satellite);
    const color = getSatelliteColor(satellite.type);

    const orbitEntity = this.viewer.entities.add({
      id: `orbit-${id}`,
      polyline: {
        positions: orbitPositions,
        width: 3,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          color: color.withAlpha(0.7),
        }),
        arcType: Cesium.ArcType.NONE,
      },
    });

    this.orbitCollection.set(id, orbitEntity);
  }

  hideSatelliteOrbit(id: string): void {
    const orbitEntity = this.orbitCollection.get(id);
    if (orbitEntity && this.viewer) {
      this.viewer.entities.remove(orbitEntity);
      this.orbitCollection.delete(id);
    }
  }

  toggleSatelliteOrbit(id: string): void {
    if (this.orbitCollection.has(id)) {
      this.hideSatelliteOrbit(id);
    } else {
      this.showSatelliteOrbit(id);
    }
  }

  clearSatellites(): void {
    if (!this.viewer) return;

    this.entityCollection.forEach((entity, id) => {
      if (id.startsWith("sat-")) {
        this.viewer?.entities.remove(entity);
      }
    });

    this.orbitCollection.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });

    this.entityCollection.clear();
    this.orbitCollection.clear();
    this.satellitePositions.clear();
  }

  getCameraPosition(): { longitude: number; latitude: number; height: number } | null {
    if (!this.viewer) return null;

    const cartographic = Cesium.Cartographic.fromCartesian(this.viewer.camera.position);

    return {
      longitude: Cesium.Math.toDegrees(cartographic.longitude),
      latitude: Cesium.Math.toDegrees(cartographic.latitude),
      height: cartographic.height,
    };
  }

  // === COVID-19 Country Data API ===

  /**
   * Add COVID data points for countries
   * Shows dots on the globe sized by case count
   */
  addCovidPoints(
    countries: Array<{
      iso3: string;
      name: string;
      lat: number;
      lng: number;
      cases: number;
      color: string;
    }>,
  ): void {
    if (!this.viewer) return;

    // Clear existing points
    this.clearCovidPoints();

    for (const country of countries) {
      // Scale point size based on cases (log scale)
      const baseSize = Math.max(5, Math.min(40, Math.log10(country.cases || 1) * 4));

      // Raise points above surface to prevent clipping
      const heightAboveSurface = 50000; // 50km above surface

      const entity = this.viewer.entities.add({
        id: `covid-${country.iso3}`,
        position: Cesium.Cartesian3.fromDegrees(country.lng, country.lat, heightAboveSurface),
        point: {
          pixelSize: baseSize,
          color: Cesium.Color.fromCssColorString(country.color),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
          // Points above surface won't clip, can use depth testing
          disableDepthTestDistance: 0,
        },
        label: {
          text: country.name,
          font: "12px sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -baseSize - 5),
          translucencyByDistance: new Cesium.NearFarScalar(5e5, 1.0, 2e6, 0.0),
          // Labels at same height as points
          disableDepthTestDistance: 0,
        },
        // Store metadata for click handling
        properties: {
          iso3: country.iso3,
          name: country.name,
          cases: country.cases,
        },
      });

      this.covidPoints.set(country.iso3, entity);
    }

    console.log(`[CesiumViewer] Added ${countries.length} COVID data points`);
  }

  /**
   * Clear all COVID data points
   */
  clearCovidPoints(): void {
    if (!this.viewer) return;

    this.covidPoints.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });
    this.covidPoints.clear();
  }

  /**
   * Register a callback for when a country is clicked
   */
  onCountryClick(callback: (iso3: string, name: string) => void): void {
    if (!this.viewer) return;

    this.countryClickCallback = callback;

    // Remove existing handler
    if (this.countryClickHandler) {
      this.countryClickHandler.destroy();
    }

    // Create new click handler
    this.countryClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

    this.countryClickHandler.setInputAction(
      (click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = this.viewer?.scene.pick(click.position);

        if (pickedObject && pickedObject.id) {
          const entity = pickedObject.id;
          const iso3 = entity.properties?.iso3?.getValue();
          const name = entity.properties?.name?.getValue();

          if (iso3 && name && this.countryClickCallback) {
            this.highlightCountry(iso3);
            this.countryClickCallback(iso3, name);
          }
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );

    // Also set up hover effect
    this.countryClickHandler.setInputAction((move: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      const pickedObject = this.viewer?.scene.pick(move.endPosition);
      if (this.viewer) {
        this.viewer.canvas.style.cursor =
          pickedObject && pickedObject.id?.properties?.iso3 ? "pointer" : "default";
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  /**
   * Highlight a country (currently just logs, can be extended for polygon highlighting)
   */
  highlightCountry(iso3: string): void {
    // Clear previous highlight
    if (this.highlightedCountry) {
      const prevEntity = this.covidPoints.get(this.highlightedCountry);
      if (prevEntity) {
        (prevEntity.point as any).outlineColor = Cesium.Color.WHITE;
        (prevEntity.point as any).outlineWidth = 1;
      }
    }

    // Highlight new country
    const entity = this.covidPoints.get(iso3);
    if (entity) {
      (entity.point as any).outlineColor = Cesium.Color.YELLOW;
      (entity.point as any).outlineWidth = 3;
      this.highlightedCountry = iso3;
    }
  }

  /**
   * Fly to a specific country by coordinates
   */
  flyToCountry(lat: number, lng: number, iso3: string): void {
    this.flyTo(lng, lat, 3000000, 2);
    this.highlightCountry(iso3);
  }

  /**
   * Remove country click handler
   */
  removeCountryClickHandler(): void {
    if (this.countryClickHandler) {
      this.countryClickHandler.destroy();
      this.countryClickHandler = null;
    }
    this.countryClickCallback = null;
  }

  // === Globe Style API ===

  /**
   * Available globe styles
   */
  static readonly STYLES = {
    DEFAULT: 'default',
    DARK: 'dark',
    NIGHT: 'night',
    MINIMAL: 'minimal',
    WIRE: 'wire',
    NEON: 'neon',
    SATELLITE: 'satellite'
  } as const;

  private currentImageryLayer: Cesium.ImageryLayer | null = null;

  /**
   * Apply a custom visual style to the globe
   */
  setGlobeStyle(style: typeof CesiumViewer.STYLES[keyof typeof CesiumViewer.STYLES]): void {
    if (!this.viewer) return;

    // Remove existing custom imagery
    if (this.currentImageryLayer) {
      this.viewer.imageryLayers.remove(this.currentImageryLayer);
      this.currentImageryLayer = null;
    }

    switch (style) {
      case 'dark':
        this.applyDarkStyle();
        break;
      case 'night':
        this.applyNightStyle();
        break;
      case 'minimal':
        this.applyMinimalStyle();
        break;
      case 'wire':
        this.applyWireframeStyle();
        break;
      case 'neon':
        this.applyNeonStyle();
        break;
      case 'satellite':
        this.applySatelliteStyle();
        break;
      case 'default':
      default:
        this.applyDefaultStyle();
        break;
    }

    console.log(`[CesiumViewer] Applied style: ${style}`);
  }

  private applyDefaultStyle(): void {
    if (!this.viewer) return;
    
    // Reset to default Cesium World Imagery
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.IonImageryProvider({ assetId: 2 });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);
    
    // Reset lighting
    this.viewer.scene.globe.enableLighting = true;
    this.viewer.scene.globe.atmosphereLightIntensity = 10.0;
  }

  private applyDarkStyle(): void {
    if (!this.viewer) return;
    
    // Use CartoDB Dark Matter tiles
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      maximumLevel: 19,
      credit: '©OpenStreetMap, ©CartoDB'
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);
    
    // Darken the atmosphere
    this.viewer.scene.globe.atmosphereLightIntensity = 3.0;
    this.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0a0a0a');
  }

  private applyNightStyle(): void {
    if (!this.viewer) return;
    
    // NASA Night Lights with city lights
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_ENCC/default//GoogleMapsCompatible_Level6/{z}/{y}/{x}.png',
      maximumLevel: 6,
      credit: 'NASA GIBS'
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);
    
    // Very dark atmosphere for night effect
    this.viewer.scene.globe.atmosphereLightIntensity = 1.0;
    this.viewer.scene.backgroundColor = Cesium.Color.BLACK;
  }

  private applyMinimalStyle(): void {
    if (!this.viewer) return;
    
    // Use OpenStreetMap with low saturation
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.OpenStreetMapImageryProvider({
      url: 'https://{s}.tile.openstreetmap.org/',
      maximumLevel: 18,
      credit: '© OpenStreetMap contributors'
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);
    
    // Apply grayscale filter via CSS on the canvas is not possible,
    // so we'll set a very neutral lighting
    this.viewer.scene.globe.enableLighting = false;
  }

  private applyWireframeStyle(): void {
    if (!this.viewer) return;
    
    // Use a minimal base map and enable wireframe
    this.viewer.imageryLayers.removeAll();
    
    // Just country boundaries
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      maximumLevel: 19,
      credit: '©OpenStreetMap, ©CartoDB'
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);
    
    // Reduce opacity of base layer
    this.currentImageryLayer.alpha = 0.3;
    
    // Set dark background
    this.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#050505');
    this.viewer.scene.globe.atmosphereLightIntensity = 2.0;
  }

  private applyNeonStyle(): void {
    if (!this.viewer) return;
    
    // Dark base with cyan/teal tint
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      maximumLevel: 19,
      credit: '©OpenStreetMap, ©CartoDB'
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);
    
    // Teal/Cyan atmosphere
    this.viewer.scene.globe.atmosphereLightIntensity = 15.0;
    this.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#001122');
  }

  private applySatelliteStyle(): void {
    if (!this.viewer) return;
    
    // Use Sentinel-2 satellite imagery
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 19,
      credit: 'Esri'
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);
    
    // Bright lighting for satellite view
    this.viewer.scene.globe.enableLighting = true;
    this.viewer.scene.globe.atmosphereLightIntensity = 20.0;
  }

  /**
   * Get available style names
   */
  getAvailableStyles(): Array<{ id: string; name: string; icon: string }> {
    return [
      { id: 'default', name: 'Default', icon: '🌍' },
      { id: 'dark', name: 'Dark Mode', icon: '🌑' },
      { id: 'night', name: 'Night Lights', icon: '🌃' },
      { id: 'minimal', name: 'Minimal', icon: '◯' },
      { id: 'wire', name: 'Wireframe', icon: '⌗' },
      { id: 'neon', name: 'Neon', icon: '✦' },
      { id: 'satellite', name: 'Satellite', icon: '📷' }
    ];
  }

  get ready(): boolean {
    return this._isReady;
  }
}

// Register the custom element
customElements.define("cesium-viewer", CesiumViewer);
