<script lang="ts">
  import { onMount } from 'svelte';
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

<div class="popup-overlay" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose()} role="button" tabindex="0" aria-label="Close popup">
  <div class="popup-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
    <div class="popup-header">
      <div class="header-left">
        {#if countryData?.countryInfo.flag}
          <img src={countryData.countryInfo.flag} alt="{countryName} flag" class="flag" />
        {/if}
        <div class="title-group">
          <h2>{countryName}</h2>
          {#if lastUpdated()}
            <span class="updated">Updated {lastUpdated()}</span>
          {/if}
        </div>
      </div>
      <div class="header-actions">
        <button class="fly-btn" onclick={flyToCountry} title="Fly to country">Target</button>
        <button class="close-btn" onclick={onClose}>Close</button>
      </div>
    </div>

    <div class="popup-tabs">
      <button class="tab-btn" class:active={activeTab === 'overview'} onclick={() => activeTab = 'overview'}>Overview</button>
      <button class="tab-btn" class:active={activeTab === 'trends'} onclick={() => activeTab = 'trends'}>Trends</button>
      <button class="tab-btn" class:active={activeTab === 'comparison'} onclick={() => activeTab = 'comparison'}>Compare</button>
    </div>

    <div class="popup-body">
      {#if loading}
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading COVID data...</p>
        </div>
      {:else if error}
        <div class="error-state">
          <p>{error}</p>
          <button class="secondary-btn" onclick={onClose}>Close</button>
        </div>
      {:else if countryData}
        {#if activeTab === 'overview'}
          <StatsOverview country={countryData} />
          {#if timeSeriesData.length > 0}
            <TimeSeriesChart data={timeSeriesData} metric="cases" title="Daily Cases" color="#e7eaee" showDaily={true} showMovingAverage={true} />
          {/if}
        {:else if activeTab === 'trends'}
          {#if timeSeriesData.length > 0}
            <TimeSeriesChart data={timeSeriesData} metric="cases" title="Daily Cases" color="#e7eaee" showDaily={true} showMovingAverage={true} />
            <TimeSeriesChart data={timeSeriesData} metric="deaths" title="Daily Deaths" color="#ff3b30" showDaily={true} showMovingAverage={true} />
            <VaccinationProgress data={timeSeriesData} title="Vaccination Progress" />
          {:else}
            <div class="no-data">
              <p>No historical data available</p>
            </div>
          {/if}
        {:else if activeTab === 'comparison'}
          {#if allCountries.length > 0}
            <TopCountriesChart countries={allCountries} metric="cases" title="Top Countries by Total Cases" color="#e7eaee" limit={15} />
            <TopCountriesChart countries={allCountries} metric="casesPerOneMillion" title="Cases per Million" color="#e7eaee" limit={15} />
            <TopCountriesChart countries={allCountries} metric="deathsPerOneMillion" title="Deaths per Million" color="#e7eaee" limit={15} />
          {:else}
            <div class="no-data">
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
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .popup-content {
    background-color: rgba(15, 17, 19, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    width: 100%;
    max-width: 480px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
    overflow: hidden;
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .flag {
    width: 44px;
    height: 30px;
    object-fit: cover;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }

  .title-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .popup-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #e7eaee;
    letter-spacing: -0.03em;
    font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }

  .updated {
    font-size: 12px;
    color: #7a828a;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .fly-btn, .close-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #b3bac2;
    cursor: pointer;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    letter-spacing: -0.01em;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fly-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.12);
    color: #e7eaee;
  }

  .close-btn:hover {
    background: rgba(255, 59, 48, 0.15);
    border-color: rgba(255, 59, 48, 0.3);
    color: #ff3b30;
  }

  .popup-tabs {
    display: flex;
    gap: 4px;
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }

  .tab-btn {
    flex: 1;
    padding: 10px 16px;
    background: transparent;
    border: none;
    color: #7a828a;
    cursor: pointer;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    letter-spacing: -0.01em;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tab-btn:hover {
    color: #b3bac2;
    background: rgba(255, 255, 255, 0.03);
  }

  .tab-btn.active {
    background: rgba(255, 255, 255, 0.08);
    color: #e7eaee;
  }

  .popup-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .popup-body::-webkit-scrollbar {
    width: 6px;
  }

  .popup-body::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
  }

  .popup-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .popup-body::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .loading-state, .error-state, .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    text-align: center;
    gap: 16px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: #e7eaee;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-state p, .error-state p, .no-data p {
    color: #7a828a;
    margin: 0;
    font-size: 14px;
  }

  .secondary-btn {
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #b3bac2;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .secondary-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
    color: #e7eaee;
  }
</style>
