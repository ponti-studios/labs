<script lang="ts">
  import { onMount } from "svelte";
  import type { CesiumViewer } from "../cesium/CesiumViewer";

  interface Props {
    onViewerReady?: (viewer: CesiumViewer) => void;
  }

  let { onViewerReady }: Props = $props();

  let viewerElement: HTMLElement;
  let cesiumViewerEl: CesiumViewer | null = null;
  let isReadyCalled = false;

  onMount(() => {
    console.log("[CesiumViewerComponent] onMount");
    
    // Get the custom element directly
    cesiumViewerEl = viewerElement.querySelector("cesium-viewer") as CesiumViewer;
    console.log("[CesiumViewerComponent] Found viewer element:", cesiumViewerEl);

    const notifyReady = () => {
      console.log("[CesiumViewerComponent] notifyReady called, ready:", cesiumViewerEl?.ready);
      if (isReadyCalled || !onViewerReady || !cesiumViewerEl) return;
      
      if (cesiumViewerEl.ready) {
        console.log("[CesiumViewerComponent] Viewer is ready, calling callback");
        isReadyCalled = true;
        onViewerReady(cesiumViewerEl);
      }
    };

    // Listen for event on the custom element itself
    if (cesiumViewerEl) {
      cesiumViewerEl.addEventListener("viewer-ready", () => {
        console.log("[CesiumViewerComponent] Received viewer-ready event on custom element");
        notifyReady();
      });
    }

    // Try immediately
    notifyReady();

    // Poll as fallback
    const interval = setInterval(() => {
      notifyReady();
    }, 500);

    // Stop polling after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!isReadyCalled) {
        console.error("[CesiumViewerComponent] Viewer never became ready");
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  });
</script>

<div bind:this={viewerElement} class="viewer-wrapper">
  <cesium-viewer></cesium-viewer>
</div>

<style>
  .viewer-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .viewer-wrapper :global(cesium-viewer) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
