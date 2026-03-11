<script lang="ts">
  import { onMount } from "svelte";
  import CesiumViewerComponent from "./lib/components/CesiumViewer.svelte";
  import Controls from "./lib/components/Controls.svelte";
  import CountryPopup from "./lib/components/covid/CountryPopup.svelte";
  import type { CesiumViewer } from "./lib/cesium/CesiumViewer";
  import type { CovidCountry } from "./lib/services/covidService";
  import {
    fetchAllCountriesSummary,
    getCountriesWithCoordinates,
    getCasesColor,
    findCountryByIso3,
  } from "./lib/services/covidService";

  // Viewer state
  let viewer = $state<CesiumViewer | null>(null);
  
  // COVID data state
  let covidCountries = $state<CovidCountry[]>([]);
  let selectedCountry = $state<CovidCountry | null>(null);
  let showPopup = $state(false);
  let popupIso3 = $state<string>("");
  let popupCountryName = $state<string>("");
  let loadingCovid = $state(true);

  // Handle viewer ready
  function handleViewerReady(v: CesiumViewer) {
    console.log("[App] Viewer ready callback called with:", v);
    viewer = v;
    
    // Setup country click handler
    viewer.onCountryClick((iso3, name) => {
      console.log(`[App] Country clicked: ${name} (${iso3})`);
      const country = findCountryByIso3(covidCountries, iso3);
      if (country) {
        selectCountry(country);
      }
    });
    
    // If we already have COVID data, add it to the globe
    if (covidCountries.length > 0) {
      addCovidPointsToGlobe();
    }
  }

  // Fetch COVID data on mount
  onMount(async () => {
    try {
      loadingCovid = true;
      const countries = await fetchAllCountriesSummary();
      covidCountries = countries;
      loadingCovid = false;
      
      // If viewer is already ready, add the points
      if (viewer) {
        addCovidPointsToGlobe();
      }
    } catch (error) {
      console.error("[App] Error fetching COVID data:", error);
      loadingCovid = false;
    }
  });

  // Add COVID data points to the globe
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

  // Select a country (from click or search)
  function selectCountry(country: CovidCountry) {
    selectedCountry = country;
    popupIso3 = country.countryInfo.iso3;
    popupCountryName = country.country;
    showPopup = true;
  }

  // Clear country selection
  function clearCountry() {
    selectedCountry = null;
    showPopup = false;
    popupIso3 = "";
    popupCountryName = "";
  }

  // Close popup
  function closePopup() {
    showPopup = false;
    // Don't clear selected country, just hide popup
  }
</script>

<main class="app">
  <CesiumViewerComponent onViewerReady={handleViewerReady} />
  
  <Controls 
    {viewer} 
    {covidCountries}
    {selectedCountry}
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
    bottom: 1rem;
    left: 1rem;
    z-index: 100;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .loading-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: white;
    font-size: 0.9rem;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
