<script lang="ts">
  import { onDestroy } from "svelte";
  import type { CesiumViewer } from "../cesium/CesiumViewer";
  import type { Satellite } from "../services/satelliteService";
  import { fetchAllSatellites } from "../services/satelliteService";
  import PanelMetric from "./panel/PanelMetric.svelte";
  import PanelSection from "./panel/PanelSection.svelte";

  interface Props {
    viewer: CesiumViewer | null;
    selectedSatelliteId: string | null;
    isTracking: boolean;
    onSelectSatellite: (satelliteId: string) => void;
    onTrackingChange: (isTracking: boolean) => void;
  }

  let {
    viewer,
    selectedSatelliteId,
    isTracking,
    onSelectSatellite,
    onTrackingChange,
  }: Props = $props();

  let satellites = $state<Satellite[]>([]);
  let updateInterval: ReturnType<typeof setInterval> | null = null;
  let lastUpdate = $state<Date | null>(null);

  const UPDATE_INTERVAL = 5000;

  function cleanupTracking() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    satellites.forEach((satellite) => viewer?.removeSatellite(satellite.id));
    satellites = [];
  }

  async function updateSatellites() {
    if (!viewer) return;
    const newSatellites = await fetchAllSatellites();

    newSatellites.forEach((satellite) => {
      const existing = satellites.find((item) => item.id === satellite.id);
      if (existing) {
        viewer.updateSatellitePosition(
          satellite.id,
          satellite.longitude,
          satellite.latitude,
          satellite.altitude,
        );
      } else {
        viewer.addSatellite(satellite);
      }
    });

    satellites = newSatellites;
    lastUpdate = new Date();
  }

  function startTracking() {
    onTrackingChange(true);
    if (updateInterval) return;
    updateSatellites();
    updateInterval = setInterval(updateSatellites, UPDATE_INTERVAL);
  }

  function stopTracking() {
    onTrackingChange(false);
    cleanupTracking();
  }

  function flyToSatellite(satelliteId: string) {
    const satellite = satellites.find((item) => item.id === satelliteId);
    if (!satellite || !viewer) return;
    onSelectSatellite(satelliteId);
    viewer.flyTo(satellite.longitude, satellite.latitude, satellite.altitude + 1000000, 2);
  }

  function toggleOrbit(satelliteId: string) {
    viewer?.toggleSatelliteOrbit(satelliteId);
  }

  onDestroy(() => {
    cleanupTracking();
  });
</script>

<div class="panel-stack">
  <PanelSection
    eyebrow="Orbital feed"
    title="Live satellites"
    description="Track a small live constellation and jump directly to orbit positions."
  >
    <div class="overview-grid">
      <PanelMetric label="Tracked" value={satellites.length} tone={isTracking ? "live" : "default"} />
      <PanelMetric label="Update" value={lastUpdate ? lastUpdate.toLocaleTimeString() : "Standby"} />
    </div>

    <button
      class="panel-button"
      class:primary={isTracking}
      type="button"
      disabled={!viewer}
      onclick={isTracking ? stopTracking : startTracking}
    >
      {isTracking ? "Pause" : "Live"}
    </button>
  </PanelSection>

  {#if satellites.length > 0}
    <PanelSection eyebrow="Constellation" title="Objects">
      <div class="satellite-list">
        {#each satellites as satellite}
          <div class="satellite-card panel-card-subtle" class:selected={selectedSatelliteId === satellite.id}>
            <div class="satellite-head">
              <div>
                <p class="panel-kicker">{satellite.type}</p>
                <strong>{satellite.name}</strong>
              </div>
              <span class="panel-pill" class:live={isTracking}>live</span>
            </div>

            <div class="satellite-data">
              <span>Lat {satellite.latitude.toFixed(2)}°</span>
              <span>Lon {satellite.longitude.toFixed(2)}°</span>
              <span>Alt {(satellite.altitude / 1000).toFixed(0)} km</span>
              <span>Vel {satellite.velocity.toFixed(0)} km/h</span>
            </div>

            <div class="satellite-actions">
              <button class="panel-button panel-button-primary" type="button" onclick={() => flyToSatellite(satellite.id)}>
                Fly to
              </button>
              <button class="panel-button panel-button-ghost" type="button" onclick={() => toggleOrbit(satellite.id)}>
                Orbit
              </button>
            </div>
          </div>
        {/each}
      </div>
    </PanelSection>
  {:else}
    <div class="panel-card-subtle empty-state">
      {#if !viewer}
        Waiting for globe viewer.
      {:else if isTracking}
        Loading orbital positions.
      {:else}
        Tracking is idle.
      {/if}
    </div>
  {/if}
</div>

<style>
  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .primary {
    background: var(--accent-primary);
    color: var(--text-on-dark);
    border-color: var(--accent-primary);
  }

  .satellite-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .satellite-card {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .satellite-card.selected {
    border-color: var(--border-strong);
    background: var(--bg-primary);
  }

  .satellite-head,
  .satellite-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  strong {
    color: var(--text-primary);
    font-size: var(--text-md);
    font-weight: 600;
  }

  .satellite-data {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
    color: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .satellite-actions > * {
    flex: 1;
  }

  .empty-state {
    padding: 16px;
    color: var(--text-muted);
    font-size: var(--text-base);
  }

  @media (max-width: 760px) {
    .overview-grid,
    .satellite-data {
      grid-template-columns: 1fr;
    }
  }
</style>
