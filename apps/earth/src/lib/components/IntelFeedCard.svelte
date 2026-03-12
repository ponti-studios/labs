<script lang="ts">
  import type { IntelFeedAvailability, IntelFeedDefinition } from "../intel/feeds";

  interface Props {
    feed: IntelFeedDefinition;
    selected: boolean;
    overlayActive: boolean;
    onSelect: (feedId: string) => void;
  }

  let { feed, selected, overlayActive, onSelect }: Props = $props();

  const availabilityCopy: Record<IntelFeedAvailability, string> = {
    live: "live",
    planned: "planned",
    catalog: "catalog",
  };

  function getFooterCopy() {
    if (selected) {
      if (feed.id === "acled") {
        return overlayActive ? "Live overlay active" : "Activating live overlay";
      }
      return "Feed selected";
    }

    return feed.id === "acled" ? "Click to activate" : "Open feed";
  }
</script>

<button
  class="feed-card panel-card"
  class:selected
  aria-pressed={selected}
  type="button"
  onclick={() => onSelect(feed.id)}
  style:--feed-accent={feed.accent}
>
  <div class="feed-head">
    <div>
      <p class="panel-kicker">{feed.category}</p>
      <strong>{feed.shortLabel}</strong>
    </div>
    <span class="panel-pill" class:live={feed.availability === "live" || overlayActive} class:warning={feed.availability === "planned"}>
      {overlayActive ? "tracking" : availabilityCopy[feed.availability]}
    </span>
  </div>

  <p class="feed-title">{feed.label}</p>
  <p class="panel-copy">{feed.visualization}</p>
  <div class="feed-footer">
    <span class="panel-label">{getFooterCopy()}</span>
  </div>
</button>

<style>
  .feed-card {
    width: 100%;
    padding: 14px;
    border-color: var(--border-light);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    text-align: left;
    cursor: pointer;
    background:
      linear-gradient(180deg, var(--bg-panel-0), var(--bg-panel-0)),
      linear-gradient(90deg, color-mix(in srgb, var(--feed-accent) 12%, var(--bg-panel-0)), transparent);
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  }

  .feed-card:hover {
    border-color: var(--border-strong);
    background: var(--bg-panel-2);
  }

  .feed-card.selected {
    border-color: color-mix(in srgb, var(--feed-accent) 38%, var(--accent-primary));
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--feed-accent) 10%, var(--bg-panel-0)), var(--bg-panel-0)),
      linear-gradient(90deg, color-mix(in srgb, var(--feed-accent) 18%, var(--bg-panel-0)), transparent);
    box-shadow:
      inset 3px 0 0 color-mix(in srgb, var(--feed-accent) 72%, var(--accent-primary)),
      var(--shadow-sm);
  }

  .feed-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
  }

  strong {
    color: var(--text-primary);
    font-size: var(--text-md);
    font-weight: 600;
  }

  .feed-title {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--text-base);
    font-weight: 500;
    line-height: 1.45;
  }

  .feed-footer {
    display: flex;
    justify-content: flex-end;
  }
</style>
