<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    eyebrow?: string;
    title?: string;
    description?: string;
    children?: Snippet;
  }

  let { eyebrow = "", title = "", description = "", children }: Props = $props();
</script>

<section class="panel-section">
  {#if eyebrow || title || description}
    <header class="panel-section-head">
      {#if eyebrow}
        <p class="panel-kicker">{eyebrow}</p>
      {/if}
      {#if title}
        <h3>{title}</h3>
      {/if}
      {#if description}
        <p class="panel-copy">{description}</p>
      {/if}
    </header>
  {/if}
  <div class="panel-section-body">
    {@render children?.()}
  </div>
</section>

<style>
  .panel-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .panel-section-head {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--text-lg);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .panel-section-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
</style>
