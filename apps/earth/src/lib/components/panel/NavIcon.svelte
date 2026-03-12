<script lang="ts">
  interface Props {
    name:
      | "intel"
      | "covid"
      | "satellites"
      | "locations"
      | "theme"
      | "chevron-up"
      | "chevron-down";
  }

  let { name }: Props = $props();
</script>

<svg viewBox="0 0 24 24" aria-hidden="true">
  {#if name === "intel"}
    <path d="M4 7.5h16M4 12h16M4 16.5h10" />
    <path d="M17 16.5h3" />
  {:else if name === "covid"}
    <circle cx="12" cy="12" r="5" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.2 2.2M16.2 16.2l2.2 2.2M18.4 5.6l-2.2 2.2M7.8 16.2l-2.2 2.2" />
  {:else if name === "satellites"}
    <path d="M12 4l2 2-2 2-2-2 2-2Z" />
    <path d="M6 10l2 2-2 2-2-2 2-2Zm12 0l2 2-2 2-2-2 2-2Z" />
    <path d="M12 16l2 2-2 2-2-2 2-2Z" />
    <path d="M8 8l8 8M16 8l-8 8" />
  {:else if name === "locations"}
    <path d="M12 20s5-5.1 5-9a5 5 0 1 0-10 0c0 3.9 5 9 5 9Z" />
    <circle cx="12" cy="11" r="1.8" />
  {:else if name === "theme"}
    <circle cx="12" cy="12" r="7" />
    <path d="M12 5v14M5 12h14" />
  {:else if name === "chevron-up"}
    <path d="m6 14 6-6 6 6" />
  {:else}
    <path d="m6 10 6 6 6-6" />
  {/if}
</svg>

<style>
  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 1.7;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex: 0 0 auto;
  }
</style>
