<script lang="ts">
  interface Props {
    label: string;
    value: string | number;
    tone?: "default" | "live" | "critical";
  }

  let { label, value, tone = "default" }: Props = $props();
</script>

<div class="metric-card panel-card-subtle" class:live={tone === "live"} class:critical={tone === "critical"}>
  <span class="metric-value">{value}</span>
  <span class="panel-label">{label}</span>
</div>

<style>
  .metric-card {
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .metric-value {
    color: var(--text-primary);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .metric-card.live .metric-value {
    color: var(--status-live);
  }

  .metric-card.critical .metric-value {
    color: var(--status-critical);
  }
</style>
