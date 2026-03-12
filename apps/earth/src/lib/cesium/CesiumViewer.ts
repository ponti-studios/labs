import * as Cesium from "cesium";
import type { Satellite } from "../services/satelliteService";
import { getSatelliteColor, calculateSmoothOrbitPath } from "../services/satelliteService";
import { PostProcessingManager } from "./effects/PostProcessingManager";
import { ParticleSystemManager } from "./effects/ParticleSystemManager";
import { ShaderMaterialManager } from "./effects/ShaderMaterialManager";
import { CameraTourManager } from "./navigation/CameraTourManager";
import { SceneModeManager } from "./navigation/SceneModeManager";
import type { PostProcessConfig } from "./effects/PostProcessingManager";
import type { ParticleSystemConfig } from "./effects/ParticleSystemManager";
import type { CameraTourConfig, TourStop } from "./navigation/CameraTourManager";

const TFL_CAMERA_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>`,
)}`;

/**
 * CesiumViewer - Custom element wrapper for Cesium
 * Keeps all Cesium state imperative (not in Svelte framework state)
 * Only exposes minimal API for Svelte to interact with
 */
export class CesiumViewer extends HTMLElement {
  private viewer: Cesium.Viewer | null = null;
  private container: HTMLDivElement | null = null;

  // Data collections
  private entityCollection: Map<string, Cesium.Entity> = new Map();
  private orbitCollection: Map<string, Cesium.Entity> = new Map();
  private satellitePositions: Map<string, { lon: number; lat: number; alt: number }> = new Map();
  private covidPoints: Map<string, Cesium.Entity> = new Map();
  private tflCameraPoints: Map<string, Cesium.Entity> = new Map();
  private conflictEntities: Map<string, Cesium.Entity> = new Map();
  private conflictZoneEntities: Map<string, Cesium.Entity> = new Map();
  
  // Click handlers
  private _isReady = false;
  private countryClickHandler: Cesium.ScreenSpaceEventHandler | null = null;
  private countryClickCallback: ((iso3: string, name: string) => void) | null = null;
  private tflCameraClickCallback:
    | ((cameraId: string, name: string) => void)
    | null = null;
  private highlightedCountry: string | null = null;
  private highlightedTflCamera: string | null = null;

  // Effect managers - lazy initialized
  private postProcessingManager: PostProcessingManager | null = null;
  private particleSystemManager: ParticleSystemManager | null = null;
  private shaderMaterialManager: ShaderMaterialManager | null = null;
  private cameraTourManager: CameraTourManager | null = null;
  private sceneModeManager: SceneModeManager | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    console.log("[CesiumViewer] connectedCallback");
    this.render();
    void this.initViewer();
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

  private async initViewer() {
    if (!this.container) {
      console.error("[CesiumViewer] No container found");
      return;
    }

    try {
      console.log("[CesiumViewer] Initializing viewer...");

      // Initialize terrain provider with world terrain
      const terrainProvider = await Cesium.createWorldTerrainAsync({
        requestVertexNormals: true,
        requestWaterMask: true,
      });

      // Initialize Cesium viewer with minimal UI and terrain
      this.viewer = new Cesium.Viewer(this.container, {
        terrainProvider,
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
        const imageryProvider = new Cesium.UrlTemplateImageryProvider({
          url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          subdomains: ["a", "b", "c", "d"],
          maximumLevel: 19,
          credit: "©OpenStreetMap, ©CartoDB",
        });
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
    this.clearCovidPoints();
    this.clearTflCameras();
    this.clearConflictEvents();
    this.clearConflictZones();
    this.removeCountryClickHandler();

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
    const positionProperty = new Cesium.CallbackPositionProperty(
      (_time: Cesium.JulianDate | undefined, result: Cesium.Cartesian3 | undefined) => {
        const pos = this.satellitePositions.get(satellite.id);
        if (pos) {
          return Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt, undefined, result);
        }
        return Cesium.Cartesian3.fromDegrees(0, 0, 0, undefined, result);
      },
      false
    );

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

    const orbitPositions = calculateSmoothOrbitPath(satellite);
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
   * Show COVID data points (make them visible)
   */
  showCovidPoints(): void {
    this.covidPoints.forEach((entity) => {
      (entity as any).show = true;
    });
  }

  /**
   * Hide COVID data points (make them invisible)
   */
  hideCovidPoints(): void {
    this.covidPoints.forEach((entity) => {
      (entity as any).show = false;
    });
  }

  addTflCameras(
    cameras: Array<{
      id: string;
      commonName: string;
      available: string;
      imageUrl: string;
      videoUrl: string;
      view: string;
      lat: number;
      lng: number;
    }>,
  ): void {
    if (!this.viewer) return;

    this.clearTflCameras();

    for (const camera of cameras) {
      const entity = this.viewer.entities.add({
        id: `tfl-${camera.id}`,
        position: Cesium.Cartesian3.fromDegrees(camera.lng, camera.lat, 40),
        billboard: {
          image: TFL_CAMERA_ICON,
          color: Cesium.Color.fromCssColorString(
            camera.available === "true" ? "#14b8a6" : "#64748b",
          ),
          width: 20,
          height: 20,
          scale: 1,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.1, 1.5e7, 0.45),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        properties: {
          tflCameraId: camera.id,
          name: camera.commonName,
          available: camera.available,
          imageUrl: camera.imageUrl,
          videoUrl: camera.videoUrl,
          view: camera.view,
          lat: camera.lat,
          lng: camera.lng,
        },
      });

      this.tflCameraPoints.set(camera.id, entity);
    }
  }

  clearTflCameras(): void {
    if (!this.viewer) return;

    this.tflCameraPoints.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });
    this.tflCameraPoints.clear();
    this.highlightedTflCamera = null;
  }

  showTflCameras(): void {
    this.tflCameraPoints.forEach((entity) => {
      (entity.show as any) = true;
    });
  }

  hideTflCameras(): void {
    this.tflCameraPoints.forEach((entity) => {
      (entity.show as any) = false;
    });
  }

  highlightTflCamera(id: string): void {
    if (this.highlightedTflCamera) {
      const previous = this.tflCameraPoints.get(this.highlightedTflCamera);
      if (previous?.billboard) {
        (previous.billboard.scale as any) = 1;
        (previous.billboard.color as any) = Cesium.Color.fromCssColorString(
          previous.properties?.available?.getValue() === "true" ? "#14b8a6" : "#64748b",
        );
      }
    }

    const entity = this.tflCameraPoints.get(id);
    if (entity?.billboard) {
      (entity.billboard.scale as any) = 1.25;
      (entity.billboard.color as any) = Cesium.Color.fromCssColorString("#2dd4bf");
      this.highlightedTflCamera = id;
    }
  }

  onTflCameraClick(callback: (cameraId: string, name: string) => void): void {
    this.tflCameraClickCallback = callback;
    this.setupInteractionHandler();
  }

  onCountryClick(callback: (iso3: string, name: string) => void): void {
    this.countryClickCallback = callback;
    this.setupInteractionHandler();
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
    this.tflCameraClickCallback = null;
  }

  private setupInteractionHandler(): void {
    if (!this.viewer) return;

    if (this.countryClickHandler) {
      this.countryClickHandler.destroy();
    }

    this.countryClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

    this.countryClickHandler.setInputAction(
      (click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = this.viewer?.scene.pick(click.position);
        const entity = pickedObject?.id;
        if (!entity) return;

        const cameraId = entity.properties?.tflCameraId?.getValue();
        const cameraName = entity.properties?.name?.getValue();
        if (cameraId && cameraName && this.tflCameraClickCallback) {
          this.highlightTflCamera(cameraId);
          this.tflCameraClickCallback(cameraId, cameraName);
          return;
        }

        const iso3 = entity.properties?.iso3?.getValue();
        const name = entity.properties?.name?.getValue();
        if (iso3 && name && this.countryClickCallback) {
          this.highlightCountry(iso3);
          this.countryClickCallback(iso3, name);
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );

    this.countryClickHandler.setInputAction(
      (move: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        const pickedObject = this.viewer?.scene.pick(move.endPosition);
        const properties = pickedObject?.id?.properties;
        if (this.viewer) {
          this.viewer.canvas.style.cursor =
            properties?.iso3?.getValue() || properties?.tflCameraId?.getValue()
              ? "pointer"
              : "default";
        }
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    );
  }

  // === Globe Style API ===

  /**
   * Available globe styles
   */
  static readonly STYLES = {
    DEFAULT: "default",
    DARK: "dark",
    MINIMAL: "minimal",
    WIRE: "wire",
    PAPER: "wireframe-paper",
    NEON: "neon",
    SATELLITE: "satellite",
  } as const;

  private currentImageryLayer: Cesium.ImageryLayer | null = null;

  private resetSceneStyle(): void {
    if (!this.viewer) return;

    this.viewer.scene.globe.baseColor = Cesium.Color.BLACK;
    this.viewer.scene.globe.enableLighting = true;
    this.viewer.scene.globe.showGroundAtmosphere = true;
    this.viewer.scene.globe.atmosphereLightIntensity = 10.0;
    this.viewer.scene.backgroundColor = Cesium.Color.BLACK;
    if (this.viewer.scene.moon) {
      this.viewer.scene.moon.show = true;
    }
    if (this.viewer.scene.skyAtmosphere) {
      this.viewer.scene.skyAtmosphere.show = true;
    }
  }

  /**
   * Apply a custom visual style to the globe
   */
  setGlobeStyle(style: (typeof CesiumViewer.STYLES)[keyof typeof CesiumViewer.STYLES]): void {
    if (!this.viewer) return;

    // Remove existing custom imagery
    if (this.currentImageryLayer) {
      this.viewer.imageryLayers.remove(this.currentImageryLayer);
      this.currentImageryLayer = null;
    }

    switch (style) {
      case "dark":
        this.applyDarkStyle();
        break;
      case "minimal":
        this.applyMinimalStyle();
        break;
      case "wire":
        this.applyWireframeStyle();
        break;
      case "wireframe-paper":
        this.applyPaperWireframeStyle();
        break;
      case "neon":
        this.applyNeonStyle();
        break;
      case "satellite":
        this.applySatelliteStyle();
        break;
      case "default":
      default:
        this.applyDefaultStyle();
        break;
    }

    console.log(`[CesiumViewer] Applied style: ${style}`);
  }

  private applyDefaultStyle(): void {
    if (!this.viewer) return;
    this.resetSceneStyle();

    // Reset to default Cesium World Imagery
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      maximumLevel: 19,
      credit: "©OpenStreetMap, ©CartoDB",
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);

    // Reset lighting
    this.viewer.scene.globe.enableLighting = true;
    this.viewer.scene.globe.atmosphereLightIntensity = 10.0;
  }

  private applyDarkStyle(): void {
    if (!this.viewer) return;
    this.resetSceneStyle();

    // Use CartoDB Dark Matter tiles
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      maximumLevel: 19,
      credit: "©OpenStreetMap, ©CartoDB",
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);

    // Darken the atmosphere
    this.viewer.scene.globe.atmosphereLightIntensity = 3.0;
    this.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#0a0a0a");
  }

  private applyMinimalStyle(): void {
    if (!this.viewer) return;
    this.resetSceneStyle();

    // Use OpenStreetMap with low saturation
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.OpenStreetMapImageryProvider({
      url: "https://{s}.tile.openstreetmap.org/",
      maximumLevel: 18,
      credit: "© OpenStreetMap contributors",
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);

    // Apply grayscale filter via CSS on the canvas is not possible,
    // so we'll set a very neutral lighting
    this.viewer.scene.globe.enableLighting = false;
  }

  private applyWireframeStyle(): void {
    if (!this.viewer) return;
    this.resetSceneStyle();

    // Use a minimal base map and enable wireframe
    this.viewer.imageryLayers.removeAll();

    // Just country boundaries
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      maximumLevel: 19,
      credit: "©OpenStreetMap, ©CartoDB",
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);

    // Reduce opacity of base layer
    this.currentImageryLayer.alpha = 0.3;

    // Set dark background
    this.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#050505");
    this.viewer.scene.globe.atmosphereLightIntensity = 2.0;
  }

  private applyPaperWireframeStyle(): void {
    if (!this.viewer) return;
    this.resetSceneStyle();

    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      maximumLevel: 19,
      credit: "©OpenStreetMap, ©CartoDB",
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);
    this.currentImageryLayer.alpha = 0.88;
    this.currentImageryLayer.brightness = 1.08;
    this.currentImageryLayer.contrast = 1.12;
    this.currentImageryLayer.saturation = 0.18;
    this.currentImageryLayer.gamma = 0.92;

    const cream = Cesium.Color.fromCssColorString("#f4edde");
    this.viewer.scene.backgroundColor = cream;
    this.viewer.scene.globe.baseColor = cream;
    this.viewer.scene.globe.enableLighting = false;
    this.viewer.scene.globe.atmosphereLightIntensity = 0.35;
    this.viewer.scene.globe.showGroundAtmosphere = false;
    if (this.viewer.scene.moon) {
      this.viewer.scene.moon.show = false;
    }
    if (this.viewer.scene.skyAtmosphere) {
      this.viewer.scene.skyAtmosphere.show = false;
    }
  }

  private applyNeonStyle(): void {
    if (!this.viewer) return;
    this.resetSceneStyle();

    // Dark base with cyan/teal tint
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      maximumLevel: 19,
      credit: "©OpenStreetMap, ©CartoDB",
    });
    this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);

    // Teal/Cyan atmosphere
    this.viewer.scene.globe.atmosphereLightIntensity = 15.0;
    this.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#001122");
  }

  private applySatelliteStyle(): void {
    if (!this.viewer) return;
    this.resetSceneStyle();

    // Use Sentinel-2 satellite imagery
    this.viewer.imageryLayers.removeAll();
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maximumLevel: 19,
      credit: "Esri",
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
      { id: "default", name: "Atlas", icon: "" },
      { id: "dark", name: "Dark", icon: "" },
      { id: "minimal", name: "Minimal", icon: "" },
      { id: "wire", name: "Wireframe", icon: "" },
      { id: "wireframe-paper", name: "Wireframe Paper", icon: "" },
      { id: "neon", name: "Neon", icon: "" },
      { id: "satellite", name: "Satellite", icon: "" },
    ];
  }

  // === ACLED Conflict Data API ===

  /**
   * Add conflict events to the globe
   */
  addConflictEvents(
    events: Array<{
      id: string;
      lat: number;
      lng: number;
      eventType: string;
      fatalities: number;
      location: string;
      country: string;
      date: string;
      color: string;
    }>,
  ): void {
    if (!this.viewer) return;

    // Clear existing conflict events
    this.clearConflictEvents();

    for (const event of events) {
      // Scale point size by fatalities (log scale)
      const baseSize = Math.max(14, Math.min(42, Math.log10((event.fatalities || 1) + 1) * 10));
      const heightAboveSurface = 60000;

      const entity = this.viewer.entities.add({
        id: `conflict-${event.id}`,
        position: Cesium.Cartesian3.fromDegrees(event.lng, event.lat, heightAboveSurface),
        point: {
          pixelSize: baseSize,
          color: Cesium.Color.fromCssColorString(event.color),
          outlineColor: Cesium.Color.fromCssColorString("#f5f1e8"),
          outlineWidth: 3,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.2, 1.5e7, 0.8),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: event.fatalities > 0 ? `${event.fatalities} dead` : event.eventType,
          font: "13px Geist, sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -baseSize - 8),
          translucencyByDistance: new Cesium.NearFarScalar(8e5, 1.0, 4e6, 0.0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        properties: {
          eventId: event.id,
          eventType: event.eventType,
          location: event.location,
          country: event.country,
          date: event.date,
          fatalities: event.fatalities,
        },
      });

      this.conflictEntities.set(event.id, entity);
    }

    console.log(`[CesiumViewer] Added ${events.length} conflict events`);
  }

  /**
   * Add conflict zones as heatmap circles
   */
  addConflictZones(
    zones: Array<{
      lat: number;
      lng: number;
      intensity: number;
      country: string;
      admin1: string;
      eventCount: number;
      fatalities: number;
    }>,
  ): void {
    if (!this.viewer) return;

    // Clear existing zones
    this.clearConflictZones();

    for (const zone of zones) {
      // Only show high-intensity zones
      if (zone.intensity < 20) continue;

      const radius = 50000 + zone.intensity * 1000; // 50km to 150km radius
      const heightAboveSurface = 10000; // 10km above surface

      // Color based on intensity
      let color = "#ff3b30"; // Red for high
      if (zone.intensity < 40)
        color = "#ff9500"; // Orange
      else if (zone.intensity < 60) color = "#ffcc00"; // Yellow

      const entity = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(zone.lng, zone.lat, heightAboveSurface),
        ellipse: {
          semiMinorAxis: radius,
          semiMajorAxis: radius,
          material: Cesium.Color.fromCssColorString(color).withAlpha(0.25),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(color).withAlpha(0.6),
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        },
        label: {
          text: `${zone.country} - ${zone.admin1}`,
          font: "12px Geist, sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 15),
          translucencyByDistance: new Cesium.NearFarScalar(1e6, 1.0, 5e6, 0.0),
        },
        properties: {
          zoneType: "conflict",
          country: zone.country,
          admin1: zone.admin1,
          eventCount: zone.eventCount,
          fatalities: zone.fatalities,
          intensity: zone.intensity,
        },
      });

      const zoneId = `${zone.country}-${zone.admin1}`;
      this.conflictZoneEntities.set(zoneId, entity);
    }

    console.log(`[CesiumViewer] Added ${this.conflictZoneEntities.size} conflict zones`);
  }

  /**
   * Clear all conflict events
   */
  clearConflictEvents(): void {
    if (!this.viewer) return;

    this.conflictEntities.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });
    this.conflictEntities.clear();
  }

  /**
   * Clear all conflict zones
   */
  clearConflictZones(): void {
    if (!this.viewer) return;

    this.conflictZoneEntities.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });
    this.conflictZoneEntities.clear();
  }

  /**
   * Show/hide conflict data
   */
  setConflictVisibility(visible: boolean): void {
    this.conflictEntities.forEach((entity) => {
      (entity.show as any) = visible;
    });
    this.conflictZoneEntities.forEach((entity) => {
      (entity.show as any) = visible;
    });
  }

  // === Geospatial Features API ===

  private geospatialMarkers: Map<string, Cesium.Entity> = new Map();
  private routePolylines: Map<string, Cesium.Entity> = new Map();

  /**
   * Add markers from geocoding results
   */
  addGeocodeMarkers(
    locations: Array<{
      id: string;
      lat: number;
      lng: number;
      address: string;
      type?: "origin" | "destination" | "result";
    }>,
  ): void {
    if (!this.viewer) return;

    for (const location of locations) {
      const colorMap: Record<string, string> = {
        origin: "#5d7f61", // status-live green
        destination: "#985252", // status-critical red
        result: "#6f8091", // status-info blue
      };

      const color = colorMap[location.type || "result"];

      const entity = this.viewer.entities.add({
        id: `geocode-${location.id}`,
        position: Cesium.Cartesian3.fromDegrees(location.lng, location.lat),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString(color),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: location.address.split(",")[0], // First part of address
          font: "13px sans-serif",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString(color),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
        },
      });

      this.geospatialMarkers.set(location.id, entity);
    }

    console.log(`[CesiumViewer] Added ${locations.length} geocode markers`);
  }

  /**
   * Draw a route line between two points
   */
  addRoute(
    routeId: string,
    waypoints: Array<{ lat: number; lng: number }>,
    color: string = "#6f8091",
  ): void {
    if (!this.viewer || waypoints.length < 2) return;

    // Remove existing route if it exists
    this.removeRoute(routeId);

    const positions = waypoints.map((wp) =>
      Cesium.Cartesian3.fromDegrees(wp.lng, wp.lat)
    );

    const entity = this.viewer.entities.add({
      id: `route-${routeId}`,
      polyline: {
        positions,
        width: 3,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: Cesium.Color.fromCssColorString(color),
        }),
        arcType: Cesium.ArcType.GEODESIC,
      },
    });

    this.routePolylines.set(routeId, entity);
    console.log(`[CesiumViewer] Added route: ${routeId}`);
  }

  /**
   * Remove a route by ID
   */
  removeRoute(routeId: string): void {
    const entity = this.routePolylines.get(routeId);
    if (entity && this.viewer) {
      this.viewer.entities.remove(entity);
      this.routePolylines.delete(routeId);
    }
  }

  /**
   * Clear all geospatial markers and routes
   */
  clearGeospatial(): void {
    if (!this.viewer) return;

    this.geospatialMarkers.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });
    this.geospatialMarkers.clear();

    this.routePolylines.forEach((entity) => {
      this.viewer?.entities.remove(entity);
    });
    this.routePolylines.clear();
  }

  /**
   * Fly to a geocoded location and zoom
   */
  flyToGeocodeResult(lat: number, lng: number, zoomLevel: number = 500000): void {
    this.flyTo(lng, lat, zoomLevel, 2);
  }

  // ============================================
  // EFFECT MANAGERS - Post Processing
  // ============================================

  /**
   * Apply post-processing effects configuration
   */
  applyPostProcessing(config: PostProcessConfig): void {
    if (!this.viewer) return;
    if (!this.postProcessingManager) {
      this.postProcessingManager = new PostProcessingManager(this.viewer);
    }
    this.postProcessingManager.applyConfig(config);
  }

  /**
   * Apply a post-processing preset (cinematic, neon, scientific, performance)
   */
  applyPostProcessingPreset(preset: "CINEMATIC" | "NEON" | "SCIENTIFIC" | "PERFORMANCE"): void {
    if (!this.viewer) return;
    if (!this.postProcessingManager) {
      this.postProcessingManager = new PostProcessingManager(this.viewer);
    }
    this.postProcessingManager.applyConfig(PostProcessingManager.PRESETS[preset]);
  }

  /**
   * Clear all post-processing effects
   */
  clearPostProcessing(): void {
    this.postProcessingManager?.clearAll();
  }

  // ============================================
  // EFFECT MANAGERS - Particle Systems
  // ============================================

  /**
   * Create a particle system effect
   */
  createParticleSystem(id: string, config: ParticleSystemConfig): void {
    if (!this.viewer) return;
    if (!this.particleSystemManager) {
      this.particleSystemManager = new ParticleSystemManager(this.viewer);
    }
    this.particleSystemManager.create(id, config);
  }

  /**
   * Create a conflict event visualization with fire and smoke
   */
  createConflictParticles(
    id: string,
    longitude: number,
    latitude: number,
    altitude: number,
    intensity: "low" | "medium" | "high" | "extreme"
  ): void {
    if (!this.viewer) return;
    if (!this.particleSystemManager) {
      this.particleSystemManager = new ParticleSystemManager(this.viewer);
    }
    this.particleSystemManager.createConflictEvent(id, longitude, latitude, altitude, intensity);
  }

  /**
   * Create an explosion effect
   */
  createExplosion(id: string, longitude: number, latitude: number, altitude: number, color?: string): void {
    if (!this.viewer) return;
    if (!this.particleSystemManager) {
      this.particleSystemManager = new ParticleSystemManager(this.viewer);
    }
    this.particleSystemManager.createExplosion(id, longitude, latitude, altitude, color);
  }

  /**
   * Remove a particle system
   */
  removeParticleSystem(id: string): void {
    this.particleSystemManager?.remove(id);
  }

  /**
   * Remove all particle systems
   */
  clearParticleSystems(): void {
    this.particleSystemManager?.removeAll();
  }

  // ============================================
  // EFFECT MANAGERS - Shader Materials
  // ============================================

  /**
   * Create a pulsing ring effect at a location
   */
  createPulseRing(
    id: string,
    longitude: number,
    latitude: number,
    options?: { radius?: number; color?: string; speed?: number; thickness?: number }
  ): void {
    if (!this.viewer) return;
    if (!this.shaderMaterialManager) {
      this.shaderMaterialManager = new ShaderMaterialManager(this.viewer);
    }
    this.shaderMaterialManager.createPulseRing(id, longitude, latitude, options);
  }

  /**
   * Create a radar scan effect at a location
   */
  createRadarScan(
    id: string,
    longitude: number,
    latitude: number,
    options?: { radius?: number; color?: string; speed?: number }
  ): void {
    if (!this.viewer) return;
    if (!this.shaderMaterialManager) {
      this.shaderMaterialManager = new ShaderMaterialManager(this.viewer);
    }
    this.shaderMaterialManager.createRadarScan(id, longitude, latitude, options);
  }

  /**
   * Create animated flow lines between points
   */
  createFlowLines(
    id: string,
    lines: Array<{
      start: { longitude: number; latitude: number };
      end: { longitude: number; latitude: number };
    }>,
    options?: { color?: string; speed?: number; width?: number }
  ): void {
    if (!this.viewer) return;
    if (!this.shaderMaterialManager) {
      this.shaderMaterialManager = new ShaderMaterialManager(this.viewer);
    }
    this.shaderMaterialManager.createFlowLines(id, lines, options);
  }

  /**
   * Remove a shader effect
   */
  removeShaderEffect(id: string): void {
    this.shaderMaterialManager?.remove(id);
  }

  /**
   * Clear all shader effects
   */
  clearShaderEffects(): void {
    this.shaderMaterialManager?.removeAll();
  }

  // ============================================
  // NAVIGATION - Camera Tours
  // ============================================

  /**
   * Start a camera tour
   */
  async startCameraTour(config: CameraTourConfig): Promise<void> {
    if (!this.viewer) return;
    if (!this.cameraTourManager) {
      this.cameraTourManager = new CameraTourManager(this.viewer);
    }
    await this.cameraTourManager.startTour(config);
  }

  /**
   * Start a preset camera tour
   */
  async startPresetTour(
    preset: "global-overview" | "conflict-tour" | "satellite-orbit" | "data-comparison" | "regional-focus",
    customStops?: TourStop[]
  ): Promise<void> {
    if (!this.viewer) return;
    if (!this.cameraTourManager) {
      this.cameraTourManager = new CameraTourManager(this.viewer);
    }
    const config = CameraTourManager.createPresetTour(preset, customStops);
    await this.cameraTourManager.startTour(config);
  }

  /**
   * Cancel the current camera tour
   */
  cancelCameraTour(): void {
    this.cameraTourManager?.cancel();
  }

  /**
   * Check if a tour is currently playing
   */
  isTourPlaying(): boolean {
    return this.cameraTourManager?.isTourPlaying() ?? false;
  }

  // ============================================
  // NAVIGATION - Scene Mode
  // ============================================

  /**
   * Switch scene mode (3D, 2D, Columbus)
   */
  switchSceneMode(mode: "3D" | "2D" | "Columbus", duration?: number): void {
    if (!this.viewer) return;
    if (!this.sceneModeManager) {
      this.sceneModeManager = new SceneModeManager(this.viewer);
    }
    this.sceneModeManager.switchToMode(mode, duration);
  }

  /**
   * Toggle between 3D and 2D modes
   */
  toggle3D2D(duration?: number): void {
    if (!this.viewer) return;
    if (!this.sceneModeManager) {
      this.sceneModeManager = new SceneModeManager(this.viewer);
    }
    this.sceneModeManager.toggle3D2D(duration);
  }

  /**
   * Cycle through all scene modes
   */
  cycleSceneMode(duration?: number): "3D" | "2D" | "Columbus" {
    if (!this.viewer) return "3D";
    if (!this.sceneModeManager) {
      this.sceneModeManager = new SceneModeManager(this.viewer);
    }
    return this.sceneModeManager.cycleMode(duration);
  }

  /**
   * Get current scene mode
   */
  getSceneMode(): "3D" | "2D" | "Columbus" {
    return this.sceneModeManager?.getCurrentMode() ?? "3D";
  }

  get ready(): boolean {
    return this._isReady;
  }
}

// Register the custom element
customElements.define("cesium-viewer", CesiumViewer);
