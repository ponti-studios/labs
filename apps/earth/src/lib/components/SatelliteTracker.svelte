<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { CesiumViewer } from "../cesium/CesiumViewer";
  import type { Satellite } from "../services/satelliteService";
  import {
    fetchAllSatellites,
    formatSatelliteInfo,
  } from "../services/satelliteService";

  interface Props {
    viewer: CesiumViewer | null;
  }

  let { viewer }: Props = $props();

  let satellites = $state<Satellite[]>([]);
  let isTracking = $state(false);
  let selectedSatellite = $state<string | null>(null);
  let updateInterval: ReturnType<typeof setInterval> | null = null;
  let lastUpdate = $state<Date | null>(null);

  const UPDATE_INTERVAL = 5000; // Update every 5 seconds

  async function updateSatellites() {
    if (!viewer) return;

    const newSatellites = await fetchAllSatellites();

    // Update or create satellite entities
    newSatellites.forEach((sat) => {
      const existing = satellites.find((s) => s.id === sat.id);
      if (existing) {
        // Update position
        viewer.updateSatellitePosition(sat.id, sat.longitude, sat.latitude, sat.altitude);
      } else {
        // Create new satellite
        viewer.addSatellite(sat);
      }
    });

    satellites = newSatellites;
    lastUpdate = new Date();
  }

  function startTracking() {
    if (isTracking) return;

    isTracking = true;
    updateSatellites();

    updateInterval = setInterval(() => {
      updateSatellites();
    }, UPDATE_INTERVAL);
  }

  function stopTracking() {
    isTracking = false;
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }

    // Remove all satellites
    satellites.forEach((sat) => {
      viewer?.removeSatellite(sat.id);
    });
    satellites = [];
  }

  function flyToSatellite(satelliteId: string) {
    const satellite = satellites.find((s) => s.id === satelliteId);
    if (satellite && viewer) {
      selectedSatellite = satelliteId;
      viewer.flyTo(satellite.longitude, satellite.latitude, satellite.altitude + 1000000, 2);
    }
  }

  function toggleOrbit(satelliteId: string) {
    viewer?.toggleSatelliteOrbit(satelliteId);
  }

  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
</script>

<div class="satellite-tracker">
  <h3>🛰️ Live Satellites</h3>

  <div class="controls-row">
    <button
      class="track-btn"
      class:active={isTracking}
      disabled={!viewer}
      onclick={isTracking ? stopTracking : startTracking}
    >
      {isTracking ? "Stop Tracking" : "Start Tracking"}
    </button>
  </div>

  {#if lastUpdate}
    <p class="last-update">
      Last update: {lastUpdate.toLocaleTimeString()}
    </p>
  {/if}

  {#if satellites.length > 0}
    <div class="satellite-list">
      {#each satellites as sat}
        <div
          class="satellite-item"
          class:selected={selectedSatellite === sat.id}
        >
          <div class="satellite-header">
            <span class="satellite-type-icon">
              {sat.type === "iss" ? "🚀" : sat.type === "space-station" ? "🏠" : "📡"}
            </span>
            <span class="satellite-name">{sat.name}</span>
          </div>

          <div class="satellite-details">
            <div class="detail-row">
              <span>Lat: {sat.latitude.toFixed(2)}°</span>
              <span>Lon: {sat.longitude.toFixed(2)}°</span>
            </div>
            <div class="detail-row">
              <span>Alt: {(sat.altitude / 1000).toFixed(0)} km</span>
              <span>Vel: {sat.velocity.toFixed(0)} km/h</span>
            </div>
          </div>

          <div class="satellite-actions">
            <button
              class="action-btn"
              onclick={() => flyToSatellite(sat.id)}
            >
              Fly To
            </button>
            <button
              class="action-btn"
              onclick={() => toggleOrbit(sat.id)}
            >
              Toggle Orbit
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else if isTracking}
    <p class="status">Loading satellites...</p>
  {/if}

  {#if !viewer}
    <p class="status">Waiting for viewer...</p>
  {/if}
</div>

<style>
  .satellite-tracker {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .controls-row {
    margin-bottom: 0.75rem;
  }

  .track-btn {
    width: 100%;
    padding: 0.5rem 1rem;
    background: rgba(59, 130, 246, 0.3);
    border: 1px solid rgba(59, 130, 246, 0.5);
    color: white;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .track-btn:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.5);
  }

  .track-btn.active {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .track-btn.active:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.5);
  }

  .track-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .last-update {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 0 0.75rem 0;
    text-align: center;
  }

  .satellite-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .satellite-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0.75rem;
    transition: all 0.2s;
  }

  .satellite-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .satellite-item.selected {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(59, 130, 246, 0.1);
  }

  .satellite-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .satellite-type-icon {
    font-size: 1rem;
  }

  .satellite-name {
    font-weight: 500;
    font-size: 0.875rem;
  }

  .satellite-details {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.5rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .satellite-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    flex: 1;
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    border-radius: 3px;
    font-size: 0.75rem;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .status {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    text-align: center;
    padding: 1rem 0;
  }
</style>
