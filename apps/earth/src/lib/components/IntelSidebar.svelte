<script lang="ts">
  import type { CesiumViewer } from "../cesium/CesiumViewer";
  import {
    getIntelOverview,
    intelFeeds,
    type IntelFeedDefinition,
  } from "../intel/feeds";
  import ConflictTracker from "./ConflictTracker.svelte";
  import IntelFeedCard from "./IntelFeedCard.svelte";
  import PanelMetric from "./panel/PanelMetric.svelte";
  import PanelSection from "./panel/PanelSection.svelte";

  interface Props {
    viewer: CesiumViewer | null;
    selectedFeedId: string;
    isAcledTracking: boolean;
    onSelectFeed: (feedId: string) => void;
    onTrackingChange: (isTracking: boolean) => void;
  }

  let {
    viewer,
    selectedFeedId,
    isAcledTracking,
    onSelectFeed,
    onTrackingChange,
  }: Props = $props();

  let activeOverlayIds = $derived(isAcledTracking ? ["acled"] : []);
  let lastRefreshLabel = $derived(isAcledTracking ? "ACLED live on globe" : "No live overlay");
  const overview = $derived(getIntelOverview(activeOverlayIds));

  function selectFeed(feedId: string) {
    onSelectFeed(feedId);
    if (feedId === "acled") {
      onTrackingChange(true);
    }
  }

  function updateAcledTracking(isTracking: boolean) {
    onTrackingChange(isTracking);
  }

  function openSource(feed: IntelFeedDefinition) {
    window.open(feed.sourceUrl, "_blank", "noopener,noreferrer");
  }
</script>

<div class="panel-stack">
  <PanelSection
    eyebrow="Intel registry"
    title="Global response grid"
    description="Structured feed selection, live overlay control, and next-up source readiness."
  >
    <div class="overview-grid">
      <PanelMetric label="Sources" value={overview.totalSources} />
      <PanelMetric label="Live" value={overview.liveSources} tone="live" />
      <PanelMetric label="Tracking" value={overview.activeOverlays} tone={overview.activeOverlays > 0 ? "critical" : "default"} />
    </div>

    <div class="overview-strip panel-card-subtle">
      <span class="panel-pill" class:live={overview.activeOverlays > 0}>
        {lastRefreshLabel}
      </span>
      <span class="panel-copy">
        {overview.activeOverlays > 0
          ? "ACLED is the only globe-backed live source in this pass."
          : "No feed is active yet. Click ACLED below to bring the live conflict layer onto the globe."}
      </span>
    </div>
  </PanelSection>

  <PanelSection eyebrow="Source library" title="Feeds">
    <div class="feed-list">
      {#each intelFeeds as feed}
        <div class="feed-item">
          <IntelFeedCard
            {feed}
            selected={selectedFeedId === feed.id}
            overlayActive={activeOverlayIds.includes(feed.id)}
            onSelect={selectFeed}
          />

          {#if selectedFeedId === feed.id}
            {#if feed.id === "acled"}
              <div class="live-panel panel-card">
                <div class="live-panel-head">
                  <div>
                    <p class="panel-kicker">Live overlay</p>
                    <strong>Conflict watch</strong>
                  </div>
                  <span class="panel-pill" class:live={activeOverlayIds.includes("acled")}>
                    {activeOverlayIds.includes("acled") ? "on globe" : "inactive"}
                  </span>
                </div>
                <ConflictTracker
                  {viewer}
                  isTracking={isAcledTracking}
                  onTrackingChange={updateAcledTracking}
                />
              </div>
            {:else}
              <div class="placeholder panel-card-subtle" class:planned={feed.id === "gdacs"}>
                <div class="detail-grid">
                  <div class="detail-card panel-card-subtle">
                    <span class="panel-label">Cadence</span>
                    <strong>{feed.cadence}</strong>
                  </div>
                  <div class="detail-card panel-card-subtle">
                    <span class="panel-label">Status</span>
                    <strong>{feed.availability}</strong>
                  </div>
                  <div class="detail-card panel-card-subtle detail-wide">
                    <span class="panel-label">Visual mode</span>
                    <strong>{feed.visualization}</strong>
                  </div>
                </div>

                <p class="panel-kicker">{feed.id === "gdacs" ? "Next overlay" : "Catalog source"}</p>
                <p class="panel-copy">
                  {feed.id === "gdacs"
                    ? "GDACS is planned next, but it does not render on the globe yet in this version."
                    : "This feed is listed in the source library only. It does not fetch or render yet."}
                </p>

                <div class="action-row">
                  <button class="panel-button panel-button-primary" type="button" onclick={() => openSource(feed)}>
                    Open source
                  </button>
                  <button class="panel-button panel-button-ghost" type="button" disabled>
                    {feed.availability === "planned" ? "Planned, not live" : "Catalog only"}
                  </button>
                </div>
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  </PanelSection>
</div>

<style>
  .overview-grid,
  .detail-grid {
    display: grid;
    gap: var(--space-3);
  }

  .overview-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .overview-strip,
  .placeholder,
  .live-panel {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .feed-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .feed-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-card {
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .detail-card strong,
  .live-panel-head strong {
    color: var(--text-primary);
    font-size: var(--text-md);
    font-weight: 600;
  }

  .detail-wide {
    grid-column: 1 / -1;
  }

  .live-panel {
    border: 1px solid var(--border-medium);
  }

  .live-panel-head,
  .action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .action-row > * {
    flex: 1;
  }

  .placeholder.planned {
    background: rgba(138, 106, 26, 0.06);
    border-color: rgba(138, 106, 26, 0.18);
  }

  @media (max-width: 760px) {
    .overview-grid,
    .detail-grid,
    .action-row {
      grid-template-columns: 1fr;
      flex-direction: column;
    }

    .action-row > * {
      width: 100%;
    }
  }
</style>
