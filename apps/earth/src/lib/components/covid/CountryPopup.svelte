<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { CesiumViewer } from '../../cesium/CesiumViewer';
  import type { CovidCountry, CovidTimeSeriesRecord } from '../../services/covidService';
  import {
    fetchAllCountriesSummary,
    fetchCountryTimeSeries,
    findCountryByIso3,
  } from '../../services/covidService';
  
  import StatsOverview from './StatsOverview.svelte';
  import TimeSeriesChart from './TimeSeriesChart.svelte';
  import VaccinationProgress from './VaccinationProgress.svelte';
  import TopCountriesChart from './TopCountriesChart.svelte';

  interface Props {
    iso3: string;
    countryName: string;
    onClose: () => void;
    viewer: CesiumViewer | null;
  }

  let { iso3, countryName, onClose, viewer }: Props = $props();

  let countryData = $state<CovidCountry | null>(null);
  let timeSeriesData = $state<CovidTimeSeriesRecord[]>([]);
  let allCountries = $state<CovidCountry[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let activeTab = $state<'overview' | 'trends' | 'comparison'>('overview');

  onMount(async () => {
    try {
      loading = true;
      error = null;

      // Fetch all data in parallel
      const [countries, timeSeries] = await Promise.all([
        fetchAllCountriesSummary(),
        fetchCountryTimeSeries(iso3),
      ]);

      allCountries = countries;
      timeSeriesData = timeSeries;
      countryData = findCountryByIso3(countries, iso3) || null;

      if (!countryData) {
        error = `No data available for ${countryName}`;
      }
    } catch (err) {
      error = 'Failed to load COVID data. Please try again.';
      console.error('Error loading COVID data:', err);
    } finally {
      loading = false;
    }
  });

  function flyToCountry() {
    if (!viewer || !countryData) return;
    
    const lat = countryData.countryInfo.lat;
    const lng = countryData.countryInfo.long;
    
    viewer.flyTo(lng, lat, 3000000, 2);
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  const lastUpdated = $derived(() => {
    if (!countryData) return null;
    const date = new Date(countryData.updated);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });
</script>

<div 
  class="popup-overlay" 
  onclick={onClose}
  onkeydown={(e) => e.key === 'Escape' && onClose()}
  role="button"
  tabindex="0"
  aria-label="Close popup"
>
  <div 
    class="popup-content" 
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="popup-title"
    tabindex="-1"
  >
    <div class="popup-header">
      <div class="header-left">
        {#if countryData?.countryInfo.flag}
          <img 
            src={countryData.countryInfo.flag} 
            alt="{countryName} flag" 
            class="flag"
          />
        {/if}
        <div class="title-group">
          <h2 id="popup-title">{countryName}</h2>
          {#if lastUpdated()}
            <span class="updated">Updated {lastUpdated()}</span>
          {/if}
        </div>
      </div>
      <div class="header-actions">
        <button class="fly-btn" onclick={flyToCountry} title="Fly to country">
          🎯
        </button>
        <button class="close-btn" onclick={onClose}>
          ✕
        </button>
      </div>
    </div>

    <div class="popup-tabs">
      <button 
        class="tab-btn" 
        class:active={activeTab === 'overview'}
        onclick={() => activeTab = 'overview'}
      >
        📊 Overview
      </button>
      <button 
        class="tab-btn" 
        class:active={activeTab === 'trends'}
        onclick={() => activeTab = 'trends'}
      >
        📈 Trends
      </button>
      <button 
        class="tab-btn" 
        class:active={activeTab === 'comparison'}
        onclick={() => activeTab = 'comparison'}
      >
        🌍 Compare
      </button>
    </div>

    <div class="popup-body">
      {#if loading}
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading COVID data...</p>
        </div>
      {:else if error}
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>{error}</p>
          <button onclick={onClose}>Close</button>
        </div>
      {:else if countryData}
        {#if activeTab === 'overview'}
          <StatsOverview country={countryData} />
          
          {#if timeSeriesData.length > 0}
            <TimeSeriesChart
              data={timeSeriesData}
              metric="cases"
              title="Daily Cases (7-day avg)"
              color="#3b82f6"
              showDaily={true}
              showMovingAverage={true}
            />
          {/if}
        {:else if activeTab === 'trends'}
          {#if timeSeriesData.length > 0}
            <TimeSeriesChart
              data={timeSeriesData}
              metric="cases"
              title="Daily Cases"
              color="#3b82f6"
              showDaily={true}
              showMovingAverage={true}
            />
            <TimeSeriesChart
              data={timeSeriesData}
              metric="deaths"
              title="Daily Deaths"
              color="#ef4444"
              showDaily={true}
              showMovingAverage={true}
            />
            <VaccinationProgress
              data={timeSeriesData}
              title="Estimated Vaccination Progress"
            />
          {:else}
            <div class="no-data">
              <span class="no-data-icon">📊</span>
              <p>No historical data available</p>
            </div>
          {/if}
        {:else if activeTab === 'comparison'}
          {#if allCountries.length > 0}
            <TopCountriesChart
              countries={allCountries}
              metric="cases"
              title="Top Countries by Total Cases"
              color="#3b82f6"
              limit={15}
            />
            <TopCountriesChart
              countries={allCountries}
              metric="casesPerOneMillion"
              title="Top Countries by Cases per Million"
              color="#f59e0b"
              limit={15}
            />
            <TopCountriesChart
              countries={allCountries}
              metric="deathsPerOneMillion"
              title="Top Countries by Deaths per Million"
              color="#ef4444"
              limit={15}
            />
          {:else}
            <div class="no-data">
              <span class="no-data-icon">🌍</span>
              <p>Comparison data not available</p>
            </div>
          {/if}
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .popup-content {
    background: rgba(20, 20, 25, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .flag {
    width: 40px;
    height: 26px;
    object-fit: cover;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .title-group {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .popup-header h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
  }

  .updated {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .fly-btn, .close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    border-radius: 8px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .fly-btn:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .popup-tabs {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
  }

  .tab-btn {
    flex: 1;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    border-radius: 6px;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .tab-btn.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    color: white;
  }

  .popup-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .popup-body::-webkit-scrollbar {
    width: 6px;
  }

  .popup-body::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  .popup-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .popup-body::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .loading-state,
  .error-state,
  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-state p,
  .error-state p,
  .no-data p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .error-icon,
  .no-data-icon {
    font-size: 2.5rem;
  }

  .error-state button {
    padding: 0.5rem 1.5rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .error-state button:hover {
    background: rgba(239, 68, 68, 0.3);
  }
</style>
