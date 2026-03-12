<script lang="ts">
  import { onMount } from "svelte";
  import CesiumViewerComponent from "./lib/components/CesiumViewer.svelte";
  import Controls from "./lib/components/Controls.svelte";
  import CountryPopup from "./lib/components/covid/CountryPopup.svelte";
  import TflCameraPopup from "./lib/components/TflCameraPopup.svelte";
  import type { CesiumViewer } from "./lib/cesium/CesiumViewer";
  import type { CovidCountry } from "./lib/services/covidService";
  import { getTflCameras, type TflCamera } from "./lib/services/tflService";
  import {
    fetchAllCountriesSummary,
    getCountriesWithCoordinates,
    getCasesColor,
    findCountryByIso3,
  } from "./lib/services/covidService";

  type DockTab = "covid" | "satellites" | "intel" | "tfl" | "geospatial";

  interface ViewerSnapshot {
    longitude: number;
    latitude: number;
    height: number;
  }

  type RestoreTarget =
    | {
        kind: "country";
        tab: DockTab;
        label: string;
        iso3: string;
        camera: ViewerSnapshot | null;
      }
    | {
        kind: "tfl-camera";
        tab: DockTab;
        label: string;
        cameraId: string;
        camera: ViewerSnapshot | null;
      }
    | {
        kind: "intel-feed";
        tab: DockTab;
        label: string;
        feedId: string;
        tracking: boolean;
        camera: ViewerSnapshot | null;
      }
    | {
        kind: "satellite";
        tab: DockTab;
        label: string;
        satelliteId: string;
        tracking: boolean;
        camera: ViewerSnapshot | null;
      }
    | {
        kind: "tab";
        tab: DockTab;
        label: string;
        camera: ViewerSnapshot | null;
      };

  let viewer = $state<CesiumViewer | null>(null);
  let covidCountries = $state<CovidCountry[]>([]);
  let selectedCountry = $state<CovidCountry | null>(null);
  let showPopup = $state(false);
  let popupIso3 = $state<string>("");
  let popupCountryName = $state<string>("");
  let loadingCovid = $state(true);
  let tflCameras = $state<TflCamera[]>([]);
  let selectedTflCamera = $state<TflCamera | null>(null);
  let activeTab = $state<DockTab>("intel");
  let selectedIntelFeedId = $state("acled");
  let intelTracking = $state(false);
  let selectedSatelliteId = $state<string | null>(null);
  let satelliteTracking = $state(false);
  let lastRestoreTarget = $state<RestoreTarget | null>(null);

  function getViewerSnapshot(): ViewerSnapshot | null {
    return viewer?.getCameraPosition() ?? null;
  }

  function saveRestoreTarget(target: RestoreTarget | null) {
    if (target) {
      lastRestoreTarget = target;
    }
  }

  function rememberCurrentFocus() {
    const camera = getViewerSnapshot();

    if (selectedTflCamera) {
      saveRestoreTarget({
        kind: "tfl-camera",
        tab: "tfl",
        label: selectedTflCamera.commonName,
        cameraId: selectedTflCamera.id,
        camera,
      });
      return;
    }

    if (showPopup && selectedCountry) {
      saveRestoreTarget({
        kind: "country",
        tab: "covid",
        label: selectedCountry.country,
        iso3: selectedCountry.countryInfo.iso3,
        camera,
      });
      return;
    }

    if (activeTab === "satellites" && selectedSatelliteId) {
      saveRestoreTarget({
        kind: "satellite",
        tab: "satellites",
        label: selectedSatelliteId,
        satelliteId: selectedSatelliteId,
        tracking: satelliteTracking,
        camera,
      });
      return;
    }

    if (activeTab === "intel") {
      saveRestoreTarget({
        kind: "intel-feed",
        tab: "intel",
        label: selectedIntelFeedId.toUpperCase(),
        feedId: selectedIntelFeedId,
        tracking: intelTracking,
        camera,
      });
      return;
    }

    if (activeTab === "tfl") {
      saveRestoreTarget({
        kind: "tab",
        tab: "tfl",
        label: "TfL Cameras",
        camera,
      });
      return;
    }

    if (activeTab === "geospatial") {
      saveRestoreTarget({
        kind: "tab",
        tab: "geospatial",
        label: "Geo",
        camera,
      });
      return;
    }

    if (activeTab === "covid") {
      saveRestoreTarget({
        kind: "tab",
        tab: "covid",
        label: "COVID",
        camera,
      });
    }
  }

  function flyToSnapshot(snapshot: ViewerSnapshot | null) {
    if (!snapshot || !viewer) return;
    viewer.flyTo(snapshot.longitude, snapshot.latitude, snapshot.height, 1.8);
  }

  function restoreLastFocus() {
    const target = lastRestoreTarget;
    if (!target) return;

    activeTab = target.tab;

    if (target.kind === "country") {
      const country = findCountryByIso3(covidCountries, target.iso3);
      if (country) {
        selectCountry(country);
      }
    }

    if (target.kind === "tfl-camera") {
      const camera = tflCameras.find((item) => item.id === target.cameraId);
      if (camera) {
        selectedCountry = null;
        selectedTflCamera = camera;
        showPopup = false;
      }
    }

    if (target.kind === "intel-feed") {
      selectedIntelFeedId = target.feedId;
      intelTracking = target.tracking;
    }

    if (target.kind === "satellite") {
      selectedSatelliteId = target.satelliteId;
      satelliteTracking = target.tracking;
    }

    flyToSnapshot(target.camera);
  }

  function handleTabChange(nextTab: DockTab) {
    if (nextTab === activeTab) return;
    rememberCurrentFocus();
    activeTab = nextTab;
  }

  function handleIntelFeedSelect(feedId: string) {
    selectedIntelFeedId = feedId;
    saveRestoreTarget({
      kind: "intel-feed",
      tab: "intel",
      label: feedId.toUpperCase(),
      feedId,
      tracking: intelTracking,
      camera: getViewerSnapshot(),
    });
  }

  function handleSatelliteSelect(satelliteId: string) {
    selectedSatelliteId = satelliteId;
    saveRestoreTarget({
      kind: "satellite",
      tab: "satellites",
      label: satelliteId,
      satelliteId,
      tracking: satelliteTracking,
      camera: getViewerSnapshot(),
    });
  }

  function handleViewerReady(v: CesiumViewer) {
    console.log("[App] Viewer ready callback called with:", v);
    viewer = v;

    viewer.onCountryClick((iso3, name) => {
      console.log(`[App] Country clicked: ${name} (${iso3})`);
      const country = findCountryByIso3(covidCountries, iso3);
      if (country) {
        selectCountry(country);
      }
    });

    viewer.onTflCameraClick((cameraId) => {
      const camera = tflCameras.find((item) => item.id === cameraId);
      if (camera) {
        selectedCountry = null;
        showPopup = false;
        selectedTflCamera = camera;
        saveRestoreTarget({
          kind: "tfl-camera",
          tab: "tfl",
          label: camera.commonName,
          cameraId: camera.id,
          camera: getViewerSnapshot(),
        });
      }
    });
    
    if (covidCountries.length > 0) {
      addCovidPointsToGlobe();
      viewer.hideCovidPoints();
    }

    if (tflCameras.length > 0) {
      addTflCamerasToGlobe();
      viewer.hideTflCameras();
    }
  }

  onMount(async () => {
    try {
      loadingCovid = true;
      const [countries, cameras] = await Promise.all([
        fetchAllCountriesSummary(),
        getTflCameras(),
      ]);
      covidCountries = countries;
      tflCameras = cameras;
      loadingCovid = false;

      if (viewer) {
        addCovidPointsToGlobe();
        viewer.hideCovidPoints();
        addTflCamerasToGlobe();
        viewer.hideTflCameras();
      }
    } catch (error) {
      console.error("[App] Error loading globe data:", error);
      loadingCovid = false;
    }
  });

  function addCovidPointsToGlobe() {
    if (!viewer || covidCountries.length === 0) return;
    
    const countriesWithCoords = getCountriesWithCoordinates(covidCountries);
    const points = countriesWithCoords.map(c => ({
      iso3: c.iso3,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      cases: c.cases,
      color: getCasesColor(c.cases / (c.cases > 0 ? 1 : 1) * 1000), // Normalize for display
    }));
    
    viewer.addCovidPoints(points);
    console.log(`[App] Added ${points.length} COVID data points to globe`);
  }

  function addTflCamerasToGlobe() {
    if (!viewer || tflCameras.length === 0) return;
    viewer.addTflCameras(tflCameras);
  }

  function selectCountry(country: CovidCountry) {
    selectedCountry = country;
    popupIso3 = country.countryInfo.iso3;
    popupCountryName = country.country;
    showPopup = true;
    selectedTflCamera = null;
    saveRestoreTarget({
      kind: "country",
      tab: "covid",
      label: country.country,
      iso3: country.countryInfo.iso3,
      camera: getViewerSnapshot(),
    });
  }

  function clearCountry() {
    selectedCountry = null;
    showPopup = false;
    popupIso3 = "";
    popupCountryName = "";
  }

  function closePopup() {
    showPopup = false;
  }

  function closeTflPopup() {
    selectedTflCamera = null;
  }
</script>

<main class="app">
  <CesiumViewerComponent onViewerReady={handleViewerReady} />
  
  <Controls 
    {viewer} 
    {activeTab}
    {covidCountries}
    {selectedCountry}
    {selectedIntelFeedId}
    {intelTracking}
    {selectedSatelliteId}
    {satelliteTracking}
    tflCameraCount={tflCameras.length}
    restoreLabel={lastRestoreTarget ? `Return to ${lastRestoreTarget.label}` : ""}
    canRestore={Boolean(lastRestoreTarget)}
    onActiveTabChange={handleTabChange}
    onRestoreFocus={restoreLastFocus}
    onSelectIntelFeed={handleIntelFeedSelect}
    onIntelTrackingChange={(isTracking) => (intelTracking = isTracking)}
    onSelectSatellite={handleSatelliteSelect}
    onSatelliteTrackingChange={(isTracking) => (satelliteTracking = isTracking)}
    onSelectCountry={selectCountry}
    onClearCountry={clearCountry}
  />

  {#if showPopup && popupIso3}
    <CountryPopup
      iso3={popupIso3}
      countryName={popupCountryName}
      onClose={closePopup}
      {viewer}
    />
  {/if}

  {#if selectedTflCamera}
    <TflCameraPopup camera={selectedTflCamera} onClose={closeTflPopup} {viewer} />
  {/if}

  {#if loadingCovid}
    <div class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <span>Loading COVID data...</span>
      </div>
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, sans-serif;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
  }

  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(#app) {
    width: 100vw;
    height: 100vh;
  }

  .app {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .loading-overlay {
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 110;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(14px);
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .loading-content {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #0a0a0a;
    font-size: 13px;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(0, 0, 0, 0.12);
    border-top-color: #0a0a0a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
