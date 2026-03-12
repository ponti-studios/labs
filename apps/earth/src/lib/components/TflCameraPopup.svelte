<script lang="ts">
  import { gsap } from "gsap";
  import { onMount } from "svelte";
  import type { CesiumViewer } from "../cesium/CesiumViewer";
  import type { TflCamera } from "../services/tflService";

  interface Props {
    camera: TflCamera;
    onClose: () => void;
    viewer: CesiumViewer | null;
  }

  let { camera, onClose, viewer }: Props = $props();

  let drawerEl: HTMLDivElement | null = null;

  const fallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='960' height='540' viewBox='0 0 960 540'%3E%3Crect width='960' height='540' fill='%23ebe6dc'/%3E%3Crect x='24' y='24' width='912' height='492' rx='18' fill='%23f6f0e4' stroke='%230000001f'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2376706a' font-family='Geist,sans-serif' font-size='28'%3ECamera unavailable%3C/text%3E%3C/svg%3E";

  onMount(() => {
    if (!drawerEl) return;

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline.fromTo(
      drawerEl,
      { x: 28, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.32 },
    );
    timeline.fromTo(
      drawerEl.querySelectorAll(".drawer-section"),
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.22, stagger: 0.05, ease: "power2.out" },
      0.1,
    );

    return () => {
      timeline.kill();
    };
  });

  function flyToCamera() {
    viewer?.flyTo(camera.lng, camera.lat, 2400, 1.8);
  }

  const statusLabel = $derived(camera.available === "true" ? "Live" : "Offline");
  const viewLabel = $derived(camera.view || "London traffic monitor");
  const coordinateLabel = $derived(`${camera.lat.toFixed(4)} / ${camera.lng.toFixed(4)}`);
</script>

<div class="drawer-shell" onkeydown={(event) => event.key === "Escape" && onClose()} role="presentation">
  <div class="drawer-wash"></div>

  <div
    bind:this={drawerEl}
    class="drawer panel-card"
    role="dialog"
    aria-modal="true"
    aria-label={`${camera.commonName} camera details`}
  >
    <header class="drawer-header drawer-section">
      <div>
        <p class="panel-kicker">London camera</p>
        <h2>{camera.commonName}</h2>
      </div>

      <button class="panel-button" type="button" onclick={onClose}>
        Close
      </button>
    </header>

    <section class="drawer-hero drawer-section">
      <img
        src={camera.imageUrl || fallbackImage}
        alt={camera.commonName}
        class="drawer-image"
        onerror={(event) => {
          const target = event.currentTarget as HTMLImageElement;
          target.src = fallbackImage;
        }}
      />

      <div class="hero-overlay">
        <div class="hero-pills">
          <span class="panel-pill" class:live={camera.available === "true"}>{statusLabel}</span>
          <span class="panel-pill warning">TfL JamCam</span>
        </div>
        <p class="hero-caption">{viewLabel}</p>
      </div>
    </section>

    <section class="drawer-section section-block panel-card-subtle">
      <div class="section-head">
        <p class="panel-kicker">Coordinates</p>
        <span class="panel-label">{coordinateLabel}</span>
      </div>

      <div class="metric-grid">
        <div class="metric-tile">
          <span class="panel-label">Latitude</span>
          <strong>{camera.lat.toFixed(4)}</strong>
        </div>
        <div class="metric-tile">
          <span class="panel-label">Longitude</span>
          <strong>{camera.lng.toFixed(4)}</strong>
        </div>
      </div>
    </section>

    <section class="drawer-section section-block panel-card-subtle">
      <p class="panel-kicker">Brief</p>
      <p class="panel-copy">
        A compact London traffic feed pinned to the globe as a contextual reference, not a separate product surface.
      </p>
    </section>

    <footer class="drawer-actions drawer-section">
      <button class="panel-button panel-button-primary" type="button" onclick={flyToCamera}>
        Target on globe
      </button>
      {#if camera.videoUrl}
        <a class="panel-button" href={camera.videoUrl} target="_blank" rel="noreferrer">
          Open video
        </a>
      {/if}
    </footer>
  </div>
</div>

<style>
  .drawer-shell {
    position: fixed;
    inset: 0;
    z-index: 180;
    pointer-events: none;
  }

  .drawer-wash {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(10, 10, 10, 0) 48%, rgba(10, 10, 10, 0.08) 100%);
  }

  .drawer {
    position: absolute;
    top: 84px;
    right: 0;
    bottom: 0;
    width: min(420px, calc(100vw - 24px));
    border-radius: 0;
    border-left: 1px solid var(--border-default);
    border-top: 1px solid var(--border-default);
    box-shadow: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
    overflow-y: auto;
    pointer-events: auto;
  }

  .drawer-header,
  .drawer-actions,
  .section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .drawer-section {
    flex: 0 0 auto;
  }

  h2 {
    margin: var(--space-1) 0 0;
    color: var(--text-primary);
    font-size: var(--text-xl);
    font-weight: 600;
    letter-spacing: -0.04em;
    line-height: 1.05;
  }

  .drawer-hero {
    position: relative;
    min-height: 240px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-panel-1);
  }

  .drawer-image {
    width: 100%;
    height: 100%;
    min-height: 240px;
    object-fit: cover;
    display: block;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: var(--space-4);
    background: linear-gradient(180deg, rgba(22, 21, 20, 0.06), rgba(22, 21, 20, 0.34));
  }

  .hero-pills {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .hero-caption {
    margin: 0;
    color: var(--text-on-dark);
    font-size: var(--text-md);
    line-height: 1.45;
    max-width: 260px;
  }

  .section-block {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .metric-tile {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .metric-tile strong {
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 500;
  }

  .drawer-actions {
    margin-top: auto;
  }

  .drawer-actions > * {
    flex: 1;
  }

  @media (max-width: 760px) {
    .drawer {
      top: auto;
      left: 0;
      right: 0;
      width: 100%;
      max-height: 72vh;
      border-top: 1px solid var(--border-default);
      border-left: none;
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    }

    .drawer-header,
    .drawer-actions,
    .section-head {
      flex-direction: column;
      align-items: stretch;
    }

    .metric-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
