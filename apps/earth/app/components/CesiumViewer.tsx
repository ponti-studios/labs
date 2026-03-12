import { useEffect, useRef } from "react";
import {
  cesiumViewer,
  activeTab,
  selectedCountryIso3,
  selectedCameraId,
  selectedSatelliteId,
} from "../lib/signals/earth";

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    async function initCesium() {
      const Cesium = await import("cesium");
      const token = (import.meta as any).env?.VITE_CESIUM_TOKEN || "";
      Cesium.Ion.defaultAccessToken = token;

      const viewer = new Cesium.Viewer(containerRef.current!, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: true,
        shadows: false,
        shouldAnimate: true,
      });

      cesiumViewer.value = viewer;

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-0.1276, 51.5074, 500000),
      });
    }

    initCesium();

    return () => {
      if (cesiumViewer.value) {
        cesiumViewer.value.destroy();
        cesiumViewer.value = null;
      }
    };
  }, []);

  useEffect(() => {
    const viewer = cesiumViewer.value;
    if (!viewer) return;

    const iso3 = selectedCountryIso3.value;
    const tab = activeTab.value;

    if (iso3 && tab === "covid") {
      console.log("Fly to country:", iso3);
    }

    const cameraId = selectedCameraId.value;
    if (cameraId && tab === "tfl") {
      console.log("Fly to camera:", cameraId);
    }

    const satelliteId = selectedSatelliteId.value;
    if (satelliteId && tab === "satellites") {
      console.log("Fly to satellite:", satelliteId);
    }
  }, [
    cesiumViewer.value,
    activeTab.value,
    selectedCountryIso3.value,
    selectedCameraId.value,
    selectedSatelliteId.value,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}
