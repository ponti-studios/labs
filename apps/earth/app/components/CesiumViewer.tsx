import { useEffect, useRef, useState } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";

const DEFAULT_IMAGERY_URL = "/tiles/imagery/{z}/{x}/{y}.png";
const DEFAULT_TERRAIN_URL = "/tiles/terrain/";
const FREE_TERRAIN_URL = "https://www.vr-theworld.com/vr-theworld/tiles1.0.0/73/";

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || viewerRef.current) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

    void (async () => {
      const Cesium = await import("cesium");
      const imageryUrl = import.meta.env.VITE_EARTH_IMAGERY_URL ?? DEFAULT_IMAGERY_URL;
      const terrainUrl = import.meta.env.VITE_EARTH_TERRAIN_URL ?? DEFAULT_TERRAIN_URL;
      const useFreePublicImagery = !import.meta.env.VITE_EARTH_IMAGERY_URL;
      const useFreePublicTerrain = !import.meta.env.VITE_EARTH_TERRAIN_URL;

      const viewer = new Cesium.Viewer(container, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        vrButton: false,
        shouldAnimate: true,
        scene3DOnly: true,
        baseLayer: false,
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      });

      const scene = viewer.scene;
      const controls = scene.screenSpaceCameraController;
      controls.enableInputs = true;
      controls.enableTranslate = true;
      controls.enableZoom = true;
      controls.enableRotate = true;
      controls.enableTilt = true;
      controls.enableLook = true;

      scene.backgroundColor = Cesium.Color.fromCssColorString("#05070a");
      scene.globe.baseColor = Cesium.Color.fromCssColorString("#071118");
      scene.globe.enableLighting = true;
      scene.globe.showGroundAtmosphere = true;
      if (scene.skyAtmosphere) scene.skyAtmosphere.show = true;
      scene.fog.enabled = true;
      scene.fog.density = 0.00008;

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(0, 20, 12000000),
      });

      resizeObserver = new ResizeObserver(() => {
        viewer.resize();
      });
      resizeObserver.observe(container);
      requestAnimationFrame(() => viewer.resize());

      viewerRef.current = viewer;
      setReady(true);

      await applyImagery(Cesium, viewer, imageryUrl, useFreePublicImagery);
      await applyTerrain(Cesium, viewer, terrainUrl, useFreePublicTerrain);

      if (disposed) {
        return;
      }
    })().catch((error) => {
      console.error("Failed to initialize Cesium viewer", error);
      setReady(true);
    });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      viewerRef.current?.destroy?.();
      viewerRef.current = null;
    };
  }, []);

  return (
    <div className="earth-viewport">
      {!ready && <div className="cesium-loading-overlay">Loading Cesium…</div>}
      <div ref={containerRef} className="earth-viewport-canvas" />
    </div>
  );
}

async function applyImagery(
  Cesium: any,
  viewer: any,
  imageryUrl: string,
  useFreePublicImagery: boolean,
) {
  try {
    if (useFreePublicImagery) {
      viewer.imageryLayers.addImageryProvider(
        new Cesium.OpenStreetMapImageryProvider({
          url: "https://tile.openstreetmap.org/",
        }),
      );
      return;
    }

    const provider = new Cesium.UrlTemplateImageryProvider({
      url: imageryUrl,
      maximumLevel: 20,
      credit: "Local imagery",
    });

    viewer.imageryLayers.addImageryProvider(provider);
  } catch (error) {
    console.warn("Imagery unavailable, falling back to NaturalEarthII", error);
    const fallback = await Cesium.TileMapServiceImageryProvider.fromUrl(
      Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
      { fileExtension: "jpg" },
    );
    viewer.imageryLayers.addImageryProvider(fallback);
  }
}

async function applyTerrain(
  Cesium: any,
  viewer: any,
  terrainUrl: string,
  useFreePublicTerrain: boolean,
) {
  try {
    if (useFreePublicTerrain) {
      viewer.terrainProvider = await Cesium.VRTheWorldTerrainProvider.fromUrl(FREE_TERRAIN_URL);
      return;
    }

    viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(terrainUrl);
  } catch (error) {
    console.warn("Terrain unavailable, using ellipsoid terrain", error);
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
  }
}
