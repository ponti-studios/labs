<script lang="ts">
  import { fade } from 'svelte/transition';
  
  interface Props {
    viewer: any; // CesiumViewer custom element
  }
  
  let { viewer }: Props = $props();
  
  // State
  let activeEffects = $state<string[]>([]);
  let isTourPlaying = $state(false);
  let currentSceneMode = $state<'3D' | '2D' | 'Columbus'>('3D');
  let showPanel = $state(true);
  
  // Post-processing presets
  const presets = [
    { id: 'CINEMATIC', name: 'Cinematic', description: 'Bloom + DOF + AO' },
    { id: 'NEON', name: 'Neon', description: 'High bloom + silhouette' },
    { id: 'SCIENTIFIC', name: 'Scientific', description: 'Clean + FXAA' },
    { id: 'PERFORMANCE', name: 'Performance', description: 'FXAA only' },
  ] as const;
  
  // Camera tours
  const tours = [
    { id: 'global-overview', name: 'Global Overview' },
    { id: 'conflict-tour', name: 'Conflict Zones' },
    { id: 'satellite-orbit', name: 'Satellite Orbit' },
    { id: 'data-comparison', name: 'Data Comparison' },
  ] as const;
  
  // Apply post-processing preset
  function applyPreset(preset: typeof presets[number]['id']) {
    if (!viewer) return;
    viewer.applyPostProcessingPreset(preset);
    activeEffects = [...activeEffects, preset];
  }
  
  // Clear all effects
  function clearEffects() {
    if (!viewer) return;
    viewer.clearPostProcessing();
    viewer.clearParticleSystems();
    viewer.clearShaderEffects();
    activeEffects = [];
  }
  
  // Start camera tour
  async function startTour(tourId: typeof tours[number]['id']) {
    if (!viewer || isTourPlaying) return;
    isTourPlaying = true;
    await viewer.startPresetTour(tourId);
    isTourPlaying = false;
  }
  
  // Cancel tour
  function cancelTour() {
    if (!viewer) return;
    viewer.cancelCameraTour();
    isTourPlaying = false;
  }
  
  // Switch scene mode
  function switchMode(mode: '3D' | '2D' | 'Columbus') {
    if (!viewer) return;
    viewer.switchSceneMode(mode);
    currentSceneMode = mode;
  }
  
  // Toggle 3D/2D
  function toggle3D2D() {
    if (!viewer) return;
    viewer.toggle3D2D();
    currentSceneMode = viewer.getSceneMode();
  }
  
  // Demo effects
  function demoPulseRing() {
    if (!viewer) return;
    // Create pulse rings at some major cities
    const cities = [
      { lon: -74.006, lat: 40.7128, name: 'NYC' },
      { lon: 139.6917, lat: 35.6895, name: 'Tokyo' },
      { lon: -0.1276, lat: 51.5074, name: 'London' },
    ];
    cities.forEach((city, i) => {
      viewer.createPulseRing(`pulse-${city.name}`, city.lon, city.lat, {
        radius: 50000 + i * 10000,
        color: i === 0 ? '#00ffff' : i === 1 ? '#ff00ff' : '#ffff00',
        speed: 1 + i * 0.5,
      });
    });
    activeEffects = [...activeEffects, 'pulse-rings'];
  }
  
  function demoRadarScan() {
    if (!viewer) return;
    viewer.createRadarScan('radar-main', -95, 37, {
      radius: 200000,
      color: '#00ff00',
      speed: 1,
    });
    activeEffects = [...activeEffects, 'radar-scan'];
  }
  
  function demoParticles() {
    if (!viewer) return;
    // Create particle effects at conflict zones
    viewer.createConflictParticles('conflict-1', 37, 49, 50000, 'high');
    viewer.createConflictParticles('conflict-2', 34, 31, 30000, 'extreme');
    activeEffects = [...activeEffects, 'particles'];
  }
  
  function demoFlowLines() {
    if (!viewer) return;
    viewer.createFlowLines('trade-routes', [
      { start: { longitude: 121.4737, latitude: 31.2304 }, end: { longitude: -122.4194, latitude: 37.7749 } }, // Shanghai to SF
      { start: { longitude: -0.1276, latitude: 51.5074 }, end: { longitude: 139.6917, latitude: 35.6895 } }, // London to Tokyo
      { start: { longitude: -74.006, latitude: 40.7128 }, end: { longitude: 151.2093, latitude: -33.8688 } }, // NYC to Sydney
    ], {
      color: '#00ffff',
      speed: 0.5,
      width: 3,
    });
    activeEffects = [...activeEffects, 'flow-lines'];
  }
</script>

{#if showPanel}
  <div class="visual-effects-panel" transition:fade={{ duration: 200 }}>
    <div class="panel-header">
      <h3>Visual Effects & Navigation</h3>
      <button class="close-btn" on:click={() => showPanel = false}>×</button>
    </div>
    
    <div class="panel-content">
      <!-- Scene Mode -->
      <section class="section">
        <h4>Scene Mode</h4>
        <div class="mode-buttons">
          <button 
            class:active={currentSceneMode === '3D'}
            on:click={() => switchMode('3D')}
          >
            3D Globe
          </button>
          <button 
            class:active={currentSceneMode === '2D'}
            on:click={() => switchMode('2D')}
          >
            2D Map
          </button>
          <button 
            class:active={currentSceneMode === 'Columbus'}
            on:click={() => switchMode('Columbus')}
          >
            Columbus
          </button>
        </div>
        <button class="secondary-btn" on:click={toggle3D2D}>
          Toggle 3D/2D
        </button>
      </section>
      
      <!-- Camera Tours -->
      <section class="section">
        <h4>Camera Tours</h4>
        <div class="tour-buttons">
          {#each tours as tour}
            <button 
              on:click={() => startTour(tour.id)}
              disabled={isTourPlaying}
            >
              {tour.name}
            </button>
          {/each}
        </div>
        {#if isTourPlaying}
          <button class="cancel-btn" on:click={cancelTour}>
            Cancel Tour
          </button>
        {/if}
      </section>
      
      <!-- Post Processing -->
      <section class="section">
        <h4>Post Processing</h4>
        <div class="preset-buttons">
          {#each presets as preset}
            <button on:click={() => applyPreset(preset.id)}>
              <span class="preset-name">{preset.name}</span>
              <span class="preset-desc">{preset.description}</span>
            </button>
          {/each}
        </div>
      </section>
      
      <!-- Demo Effects -->
      <section class="section">
        <h4>Demo Effects</h4>
        <div class="demo-buttons">
          <button on:click={demoPulseRing}>Pulse Rings</button>
          <button on:click={demoRadarScan}>Radar Scan</button>
          <button on:click={demoParticles}>Particles</button>
          <button on:click={demoFlowLines}>Flow Lines</button>
        </div>
      </section>
      
      <!-- Active Effects -->
      {#if activeEffects.length > 0}
        <section class="section">
          <h4>Active Effects ({activeEffects.length})</h4>
          <button class="clear-btn" on:click={clearEffects}>
            Clear All Effects
          </button>
        </section>
      {/if}
    </div>
  </div>
{:else}
  <button 
    class="show-btn" 
    on:click={() => showPanel = true}
    transition:fade={{ duration: 200 }}
  >
    FX
  </button>
{/if}

<style>
  .visual-effects-panel {
    position: fixed;
    top: 80px;
    right: 20px;
    width: 280px;
    max-height: calc(100vh - 100px);
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    z-index: 1000;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: white;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .panel-content {
    padding: 16px;
    overflow-y: auto;
    max-height: calc(100vh - 160px);
  }
  
  .section {
    margin-bottom: 20px;
  }
  
  .section:last-child {
    margin-bottom: 0;
  }
  
  .section h4 {
    margin: 0 0 10px 0;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .mode-buttons,
  .tour-buttons,
  .demo-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .preset-buttons {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  button {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }
  
  button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  button:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  button.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
    color: white;
  }
  
  .secondary-btn {
    margin-top: 8px;
    width: 100%;
    text-align: center;
    font-size: 11px;
  }
  
  .cancel-btn {
    margin-top: 8px;
    width: 100%;
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.3);
    color: rgb(248, 113, 113);
    text-align: center;
  }
  
  .cancel-btn:hover {
    background: rgba(239, 68, 68, 0.3);
  }
  
  .clear-btn {
    width: 100%;
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
    color: rgb(248, 113, 113);
    text-align: center;
  }
  
  .clear-btn:hover {
    background: rgba(239, 68, 68, 0.2);
  }
  
  .preset-name {
    display: block;
    font-weight: 500;
  }
  
  .preset-desc {
    display: block;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 2px;
  }
  
  .show-btn {
    position: fixed;
    top: 80px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    z-index: 1000;
  }
  
  .show-btn:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
  }
</style>
