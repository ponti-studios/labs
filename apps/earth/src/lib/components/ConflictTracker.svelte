<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { CesiumViewer } from "../cesium/CesiumViewer";
  import {
    ACLED_COLORS,
    fetchACLEDEvents,
    getACLEDStats,
    getConflictZones,
    type ACLEDEvent,
    type ACLEDEventType,
  } from "../services/acledService";
  import PanelMetric from "./panel/PanelMetric.svelte";

  interface Props {
    viewer: CesiumViewer | null;
    isTracking?: boolean;
    onTrackingChange?: (isTracking: boolean) => void;
  }

  let { viewer, isTracking = false, onTrackingChange }: Props = $props();

  let events = $state<ACLEDEvent[]>([]);
  let loading = $state(true);
  let showZones = $state(true);
  let selectedTypes = $state<ACLEDEventType[]>([
    "Battles",
    "Violence against civilians",
    "Riots",
  ]);
  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  let hasFocusedLiveView = $state(false);

  const eventTypes: ACLEDEventType[] = [
    "Battles",
    "Violence against civilians",
    "Riots",
    "Protests",
    "Strategic developments",
  ];

  let stats = $derived(getACLEDStats(events));
  let filteredEvents = $derived(events.filter((event) => selectedTypes.includes(event.event_type)));

  onMount(() => {
    if (isTracking) {
      startTracking();
    }
  });

  onDestroy(() => {
    stopTracking();
    viewer?.clearConflictEvents();
    viewer?.clearConflictZones();
  });

  $effect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }
  });

  function startTracking() {
    hasFocusedLiveView = false;
    void loadConflictData();
    if (!refreshInterval) {
      refreshInterval = setInterval(loadConflictData, 5 * 60 * 1000);
    }
  }

  function stopTracking() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    viewer?.clearConflictEvents();
    viewer?.clearConflictZones();
  }

  async function loadConflictData() {
    try {
      loading = true;
      events = await fetchACLEDEvents();
      if (viewer && isTracking) {
        displayConflicts();
      }
    } catch (error) {
      console.error("Error loading conflict data:", error);
    } finally {
      loading = false;
    }
  }

  function displayConflicts() {
    if (!viewer) return;

    viewer.addConflictEvents(
      filteredEvents.map((event) => ({
        id: event.event_id_cnty,
        lat: event.latitude,
        lng: event.longitude,
        eventType: event.event_type,
        fatalities: event.fatalities,
        location: event.location,
        country: event.country,
        date: event.event_date,
        color: ACLED_COLORS[event.event_type],
      })),
    );

    if (showZones) {
      viewer.addConflictZones(getConflictZones(filteredEvents));
    } else {
      viewer.clearConflictZones();
    }

    focusLiveView();
  }

  function toggleTracking() {
    onTrackingChange?.(!isTracking);
  }

  function toggleEventType(type: ACLEDEventType) {
    if (selectedTypes.includes(type)) {
      selectedTypes = selectedTypes.filter((item) => item !== type);
    } else {
      selectedTypes = [...selectedTypes, type];
    }
    if (isTracking) {
      displayConflicts();
    }
  }

  function toggleZones() {
    showZones = !showZones;
    if (isTracking) {
      if (showZones) {
        viewer?.addConflictZones(getConflictZones(filteredEvents));
      } else {
        viewer?.clearConflictZones();
      }
    }
  }

  function flyToConflict(event: ACLEDEvent) {
    viewer?.flyTo(event.longitude, event.latitude, 1500000, 2);
  }

  function focusLiveView() {
    if (!viewer || hasFocusedLiveView || filteredEvents.length === 0) return;

    const focalEvent = stats.highSeverityEvents[0] ?? filteredEvents[0];
    if (!focalEvent) return;

    hasFocusedLiveView = true;
    viewer.flyTo(focalEvent.longitude, focalEvent.latitude, 6000000, 2.2);
  }
</script>

<div class="tracker-stack">
  <div class="tracker-grid">
    <PanelMetric label="Events" value={stats.totalEvents} />
    <PanelMetric label="Fatalities" value={stats.totalFatalities} tone="critical" />
  </div>

  <button class="panel-button" class:primary={isTracking} type="button" disabled={loading} onclick={toggleTracking}>
    {isTracking ? "Pause" : "Live"}
  </button>

  {#if isTracking && filteredEvents.length > 0}
    <button class="panel-button panel-button-ghost" type="button" onclick={focusLiveView}>
      Focus on conflicts
    </button>
  {/if}

  <div class="filter-row">
    {#each eventTypes as type}
      <button
        class="filter-chip"
        class:active={selectedTypes.includes(type)}
        style:--chip-accent={ACLED_COLORS[type]}
        type="button"
        onclick={() => toggleEventType(type)}
      >
        <span class="filter-dot"></span>
        <span>{type}</span>
      </button>
    {/each}
  </div>

  <label class="zone-row panel-card-subtle">
    <input type="checkbox" checked={showZones} onchange={toggleZones} />
    <span class="panel-copy">Show conflict zones</span>
  </label>

  {#if loading}
    <div class="panel-card-subtle loading-state">Loading conflict data.</div>
  {:else if stats.highSeverityEvents.length > 0}
    <div class="event-stack">
      <div class="event-group">
        <p class="panel-kicker">High severity</p>
        {#each stats.highSeverityEvents.slice(0, 4) as event}
          <button
            class="event-card panel-card-subtle"
            style:--event-accent={ACLED_COLORS[event.event_type]}
            type="button"
            onclick={() => flyToConflict(event)}
          >
            <div class="event-top">
              <strong>{event.country}</strong>
              <span class="event-pill">{event.fatalities} dead</span>
            </div>
            <div class="event-copy">
              <span class="event-copy-main">
                <span class="event-dot"></span>
                <span>{event.location}</span>
              </span>
              <span>{event.event_date}</span>
            </div>
          </button>
        {/each}
      </div>

      <div class="event-group">
        <p class="panel-kicker">Recent</p>
        {#each stats.recentEvents.slice(0, 5) as event}
          <button
            class="event-row"
            style:--event-accent={ACLED_COLORS[event.event_type]}
            type="button"
            onclick={() => flyToConflict(event)}
          >
            <span class="event-copy-main">
              <span class="event-dot"></span>
              <span>{event.event_type}</span>
            </span>
            <span>{event.country}</span>
            <span>{event.event_date}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .tracker-stack,
  .event-stack,
  .event-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .tracker-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .primary {
    background: var(--accent-primary);
    color: var(--text-on-dark);
    border-color: var(--accent-primary);
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .filter-chip,
  .event-row {
    border: 1px solid var(--border-light);
    background: var(--bg-panel-0);
    border-radius: var(--radius-full);
    color: var(--text-secondary);
    cursor: pointer;
    font: inherit;
  }

  .filter-chip {
    min-height: 34px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .filter-dot,
  .event-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--chip-accent, var(--event-accent, var(--status-info)));
    flex: 0 0 auto;
  }

  .filter-chip.active {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: var(--text-on-dark);
  }

  .zone-row {
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .loading-state {
    padding: 14px;
    color: var(--text-muted);
    font-size: var(--text-base);
  }

  .event-card {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    cursor: pointer;
    text-align: left;
  }

  .event-top,
  .event-copy,
  .event-row {
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

  .event-pill {
    color: var(--status-critical);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .event-copy,
  .event-row {
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .event-copy-main {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .event-row {
    min-height: 40px;
    padding: 0 12px;
    border-radius: var(--radius-md);
  }

  @media (max-width: 760px) {
    .tracker-grid {
      grid-template-columns: 1fr;
    }

    .event-copy,
    .event-row {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
