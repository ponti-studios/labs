<script lang="ts">
  import { onMount } from "svelte";
  import type { CesiumViewer } from "../cesium/CesiumViewer";
  import type { CovidCountry } from "../services/covidService";
  import SatelliteTracker from "./SatelliteTracker.svelte";

  interface Props {
    viewer: CesiumViewer | null;
    covidCountries: CovidCountry[];
    selectedCountry: CovidCountry | null;
    onSelectCountry: (country: CovidCountry) => void;
    onClearCountry: () => void;
  }

  let { 
    viewer, 
    covidCountries, 
    selectedCountry, 
    onSelectCountry,
    onClearCountry 
  }: Props = $props();

  let selectedLocation = $state("");
  let isFlying = $state(false);
  let isCollapsed = $state(false);
  let activeTab = $state<"covid" | "satellites" | "locations">("covid");
  let searchQuery = $state("");
  let showStylePicker = $state(false);
  
  // Globe styles - available everywhere
  const globeStyles = $derived(viewer?.getAvailableStyles() ?? []);
  let currentStyle = $state("satellite"); // Default to satellite

  // Load saved style preference on mount
  onMount(() => {
    const savedStyle = localStorage.getItem("earth-globe-style");
    if (savedStyle && viewer) {
      currentStyle = savedStyle;
      viewer.setGlobeStyle(savedStyle);
    }
  });

  const locations = [
    { name: "New York", lon: -74.006, lat: 40.7128, height: 500000 },
    { name: "London", lon: -0.1276, lat: 51.5074, height: 500000 },
    { name: "Tokyo", lon: 139.6917, lat: 35.6895, height: 500000 },
    { name: "Sydney", lon: 151.2093, lat: -33.8688, height: 500000 },
    { name: "Cape Town", lon: 18.4241, lat: -33.9249, height: 500000 },
  ];

  // Filter countries based on search
  let filteredCountries = $derived(
    covidCountries
      .filter(c => 
        c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.countryInfo.iso3?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 10)
  );

  function flyToLocation(name: string) {
    if (!viewer) return;

    const location = locations.find((l) => l.name === name);
    if (!location) return;

    isFlying = true;
    selectedLocation = name;

    viewer.flyTo(location.lon, location.lat, location.height, 2);

    setTimeout(() => {
      isFlying = false;
    }, 2000);
  }

  function flyToCountry(country: CovidCountry) {
    if (!viewer) return;
    
    viewer.flyToCountry(
      country.countryInfo.lat,
      country.countryInfo.long,
      country.countryInfo.iso3
    );
    
    onSelectCountry(country);
    searchQuery = "";
  }

  function handleClearCountry() {
    onClearCountry();
    // Fly back to world view
    if (viewer) {
      viewer.flyTo(0, 20, 20000000, 2);
    }
  }

  function addRandomPoint() {
    if (!viewer) return;

    const id = `point-${Date.now()}`;
    const lon = (Math.random() - 0.5) * 360;
    const lat = (Math.random() - 0.5) * 180;
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    viewer.addPoint(id, lon, lat, color, 15);
  }

  function clearAllPoints() {
    if (!viewer) return;
    viewer.clearEntities();
  }

  function getCurrentPosition() {
    if (!viewer) return;
    const pos = viewer.getCameraPosition();
    if (pos) {
      console.log("Camera position:", pos);
      alert(
        `Camera Position:\nLon: ${pos.longitude.toFixed(4)}\nLat: ${pos.latitude.toFixed(4)}\nHeight: ${pos.height.toFixed(0)}m`
      );
    }
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  function changeGlobeStyle(styleId: string) {
    if (!viewer) return;
    currentStyle = styleId;
    viewer.setGlobeStyle(styleId);
    // Save to localStorage
    localStorage.setItem("earth-globe-style", styleId);
    showStylePicker = false;
  }

  function getCurrentStyleIcon(): string {
    return globeStyles.find(s => s.id === currentStyle)?.icon ?? '🌍';
  }
</script>

<div class="controls" class:collapsed={isCollapsed}>
  <button class="toggle-btn" onclick={() => isCollapsed = !isCollapsed}>
    {isCollapsed ? '☰' : '✕'}
  </button>

  {#if !isCollapsed}
    <div class="controls-content">
      <div class="header-row">
        <h2>🌍 Earth Monitor</h2>
        
        <!-- Style Picker Button - Always Accessible -->
        <div class="style-picker-container">
          <button 
            class="style-toggle-btn" 
            onclick={() => showStylePicker = !showStylePicker}
            title="Change globe style"
          >
            <span class="current-style-icon">{getCurrentStyleIcon()}</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          
          {#if showStylePicker}
            <div class="style-dropdown">
              {#each globeStyles as style}
                <button
                  class="style-option"
                  class:active={currentStyle === style.id}
                  onclick={() => changeGlobeStyle(style.id)}
                >
                  <span class="style-icon">{style.icon}</span>
                  <span class="style-label">{style.name}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button
          class="tab-btn"
          class:active={activeTab === "covid"}
          onclick={() => activeTab = "covid"}
        >
          🦠 COVID
        </button>
        <button
          class="tab-btn"
          class:active={activeTab === "satellites"}
          onclick={() => activeTab = "satellites"}
        >
          🛰️ Satellites
        </button>
        <button
          class="tab-btn"
          class:active={activeTab === "locations"}
          onclick={() => activeTab = "locations"}
        >
          📍 Locations
        </button>
      </div>

      {#if activeTab === "covid"}
        <section>
          <h3>COVID-19 Tracker</h3>
          
          {#if selectedCountry}
            <div class="selected-country">
              <div class="country-header">
                <img 
                  src={selectedCountry.countryInfo.flag} 
                  alt="{selectedCountry.country} flag"
                  class="country-flag"
                />
                <span class="country-name">{selectedCountry.country}</span>
              </div>
              <div class="country-stats">
                <div class="stat-row">
                  <span class="stat-label">Cases:</span>
                  <span class="stat-value cases">{formatNumber(selectedCountry.cases)}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Deaths:</span>
                  <span class="stat-value deaths">{formatNumber(selectedCountry.deaths)}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Recovered:</span>
                  <span class="stat-value recovered">{formatNumber(selectedCountry.recovered)}</span>
                </div>
              </div>
              <button class="clear-btn" onclick={handleClearCountry}>
                🌍 Back to World View
              </button>
            </div>
          {:else}
            <div class="search-section">
              <p class="hint">Search for a country or click on the globe</p>
              <input
                type="text"
                placeholder="Search countries..."
                bind:value={searchQuery}
                class="search-input"
              />
              
              {#if searchQuery && filteredCountries.length > 0}
                <div class="search-results">
                  {#each filteredCountries as country}
                    <button
                      class="country-result"
                      onclick={() => flyToCountry(country)}
                    >
                      <img 
                        src={country.countryInfo.flag} 
                        alt="{country.country} flag"
                        class="result-flag"
                      />
                      <span class="result-name">{country.country}</span>
                      <span class="result-cases">{formatNumber(country.cases)}</span>
                    </button>
                  {/each}
                </div>
              {:else if searchQuery}
                <p class="no-results">No countries found</p>
              {/if}
            </div>
            
            <div class="stats-summary">
              <p class="summary-text">
                📊 Showing {covidCountries.length} countries with COVID data
              </p>
              <p class="hint">
                Click on any country dot to view detailed statistics
              </p>
            </div>
          {/if}
        </section>
      {:else if activeTab === "satellites"}
        <SatelliteTracker {viewer} />
      {:else}
        <section>
          <h3>Fly To Location</h3>
          <div class="button-group">
            {#each locations as location}
              <button
                class="location-btn"
                class:active={selectedLocation === location.name}
                disabled={isFlying || !viewer}
                onclick={() => flyToLocation(location.name)}
              >
                {location.name}
              </button>
            {/each}
          </div>
        </section>

        <section>
          <h3>Entities</h3>
          <div class="button-group">
            <button disabled={!viewer} onclick={addRandomPoint}>
              Add Random Point
            </button>
            <button disabled={!viewer} onclick={clearAllPoints}>
              Clear All Points
            </button>
          </div>
        </section>

        <section>
          <h3>Debug</h3>
          <button disabled={!viewer} onclick={getCurrentPosition}>
            Get Camera Position
          </button>
        </section>
      {/if}

      {#if !viewer}
        <p class="status">Loading viewer...</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 100;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    border-radius: 8px;
    backdrop-filter: blur(10px);
    max-height: calc(100vh - 2rem);
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .controls.collapsed {
    width: auto;
    min-width: unset;
  }

  .controls:not(.collapsed) {
    width: 300px;
  }

  .toggle-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 32px;
    height: 32px;
    padding: 0;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    border-radius: 4px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .controls-content {
    padding: 1rem;
    padding-top: 2.5rem;
    overflow-y: auto;
    max-height: calc(100vh - 2rem);
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 0.5rem;
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  /* Style Picker Dropdown */
  .style-picker-container {
    position: relative;
  }

  .style-toggle-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.4rem 0.6rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .style-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .current-style-icon {
    font-size: 1.2rem;
  }

  .dropdown-arrow {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .style-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: rgba(20, 20, 25, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 0.5rem;
    min-width: 150px;
    z-index: 1000;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }

  .style-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    text-align: left;
    font-size: 0.9rem;
    transition: all 0.15s;
  }

  .style-option:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .style-option.active {
    background: rgba(59, 130, 246, 0.3);
  }

  .style-label {
    font-size: 0.85rem;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 0.5rem;
  }

  .tab-btn {
    flex: 1;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.75rem;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .tab-btn.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
    color: white;
  }

  h3 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.7);
  }

  section {
    margin-bottom: 1.5rem;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }

  button:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button.location-btn.active {
    background: rgba(59, 130, 246, 0.5);
    border-color: rgba(59, 130, 246, 0.7);
  }

  .status {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    text-align: center;
    margin-top: 1rem;
  }

  /* COVID Styles */
  .selected-country {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1rem;
  }

  .country-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .country-flag {
    width: 36px;
    height: 24px;
    object-fit: cover;
    border-radius: 3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .country-name {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .country-stats {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.6);
  }

  .stat-value {
    font-weight: 600;
  }

  .stat-value.cases {
    color: #3b82f6;
  }

  .stat-value.deaths {
    color: #ef4444;
  }

  .stat-value.recovered {
    color: #10b981;
  }

  .clear-btn {
    width: 100%;
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
  }

  .clear-btn:hover {
    background: rgba(59, 130, 246, 0.3);
  }

  .search-section {
    margin-bottom: 1rem;
  }

  .hint {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 0 0.75rem 0;
    font-style: italic;
  }

  .search-input {
    width: 100%;
    padding: 0.6rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 0.9rem;
    box-sizing: border-box;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .search-input:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
  }

  .search-results {
    margin-top: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.3);
  }

  .country-result {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: white;
    cursor: pointer;
    text-align: left;
    width: 100%;
    font-size: 0.85rem;
  }

  .country-result:last-child {
    border-bottom: none;
  }

  .country-result:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .result-flag {
    width: 24px;
    height: 16px;
    object-fit: cover;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .result-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result-cases {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
  }

  .no-results {
    padding: 1rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
  }

  .stats-summary {
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .summary-text {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 0.5rem 0;
  }
</style>
