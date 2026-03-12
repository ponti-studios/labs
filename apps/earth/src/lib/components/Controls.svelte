<script lang="ts">
  import { Flip, gsap } from "gsap/all";
  import { onMount, tick } from "svelte";
  import type { CesiumViewer } from "../cesium/CesiumViewer";
  import type { CovidCountry } from "../services/covidService";
  import IntelSidebar from "./IntelSidebar.svelte";
  import SatelliteTracker from "./SatelliteTracker.svelte";
  import GeospatialSearch from "./GeospatialSearch.svelte";
  import NavIcon from "./panel/NavIcon.svelte";
  import PanelMetric from "./panel/PanelMetric.svelte";
  import PanelSection from "./panel/PanelSection.svelte";

  gsap.registerPlugin(Flip);

  interface Props {
    viewer: CesiumViewer | null;
    activeTab: DockTab;
    covidCountries: CovidCountry[];
    selectedCountry: CovidCountry | null;
    selectedIntelFeedId: string;
    intelTracking: boolean;
    selectedSatelliteId: string | null;
    satelliteTracking: boolean;
    tflCameraCount: number;
    canRestore: boolean;
    restoreLabel: string;
    onActiveTabChange: (tab: DockTab) => void;
    onRestoreFocus: () => void;
    onSelectIntelFeed: (feedId: string) => void;
    onIntelTrackingChange: (isTracking: boolean) => void;
    onSelectSatellite: (satelliteId: string) => void;
    onSatelliteTrackingChange: (isTracking: boolean) => void;
    onSelectCountry: (country: CovidCountry) => void;
    onClearCountry: () => void;
  }

  let {
    viewer,
    activeTab,
    covidCountries,
    selectedCountry,
    selectedIntelFeedId,
    intelTracking,
    selectedSatelliteId,
    satelliteTracking,
    tflCameraCount,
    canRestore,
    restoreLabel,
    onActiveTabChange,
    onRestoreFocus,
    onSelectIntelFeed,
    onIntelTrackingChange,
    onSelectSatellite,
    onSatelliteTrackingChange,
    onSelectCountry,
    onClearCountry,
  }: Props = $props();

  type DockTab = "covid" | "satellites" | "intel" | "tfl" | "geospatial";
  type GlobeStyle = Parameters<CesiumViewer["setGlobeStyle"]>[0];

  let selectedLocation = $state("");
  let isFlying = $state(false);
  let isCollapsed = $state(false);
  let searchQuery = $state("");
  let showStylePicker = $state(false);
  let showCovidData = $state(false);
  let showTflTraffic = $state(true);
  let currentStyle = $state<GlobeStyle>("satellite");
  let isMobile = $state(false);
  let isAnimating = $state(false);

  let topNavEl = $state<HTMLElement | null>(null);
  let modeTabsEl = $state<HTMLElement | null>(null);
  let dockFrameEl = $state<HTMLElement | null>(null);
  let accordionSummaryEl = $state<HTMLElement | null>(null);
  let previousTab = $state<DockTab>("intel");

  const globeStyles = $derived(
    (viewer?.getAvailableStyles() ?? []) as Array<{
      id: GlobeStyle;
      name: string;
    }>,
  );

  const locations = [
    { name: "New York", lon: -74.006, lat: 40.7128, height: 500000 },
    { name: "London", lon: -0.1276, lat: 51.5074, height: 500000 },
    { name: "Tokyo", lon: 139.6917, lat: 35.6895, height: 500000 },
    { name: "Sydney", lon: 151.2093, lat: -33.8688, height: 500000 },
    { name: "Cape Town", lon: 18.4241, lat: -33.9249, height: 500000 },
  ];

  const tabs: Array<{
    id: DockTab;
    label: string;
    short: string;
    icon: "intel" | "covid" | "satellites" | "tfl" | "geospatial";
  }> = [
    { id: "intel", label: "Intel", short: "INT", icon: "intel" },
    { id: "covid", label: "COVID", short: "C19", icon: "covid" },
    { id: "satellites", label: "Satellites", short: "SAT", icon: "satellites" },
    { id: "geospatial", label: "Geo", short: "GEO", icon: "geospatial" },
    { id: "tfl", label: "TfL Cameras", short: "TFL", icon: "tfl" },
  ];

  let filteredCountries = $derived(
    covidCountries
      .filter(
        (country) =>
          country.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.countryInfo.iso3?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 10),
  );

  const activeTabMeta = $derived(tabs.find((tab) => tab.id === activeTab) ?? tabs[0]);
  const mobileAccordionTitle = $derived(
    activeTab === "covid" && selectedCountry
      ? selectedCountry.country
      : activeTab === "tfl" && selectedLocation
        ? selectedLocation
        : activeTabMeta.label,
  );
  const mobileAccordionDetail = $derived(getAccordionDetail());
  const drawerEyebrow = $derived(getDrawerEyebrow());
  const drawerDescription = $derived(getDrawerDescription());

  onMount(() => {
    const mobileQuery = window.matchMedia("(max-width: 760px)");

    const syncViewport = (matches: boolean) => {
      isMobile = matches;
      isCollapsed = matches;
      showStylePicker = false;
    };

    syncViewport(mobileQuery.matches);

    const handleViewportChange = (event: MediaQueryListEvent) => {
      syncViewport(event.matches);
    };

    mobileQuery.addEventListener("change", handleViewportChange);

    const savedStyle = localStorage.getItem("earth-globe-style");
    if (savedStyle && viewer) {
      currentStyle = savedStyle as GlobeStyle;
      viewer.setGlobeStyle(currentStyle);
    }

    void tick().then(() => {
      const introNodes = [topNavEl, modeTabsEl, dockFrameEl].filter(Boolean);
      if (!introNodes.length) return;

      gsap.set(introNodes, {
        opacity: 0,
        y: 18,
      });

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .to(topNavEl, { opacity: 1, y: 0, duration: 0.62 })
        .to(modeTabsEl, { opacity: 1, y: 0, duration: 0.58 }, "-=0.34")
        .to(dockFrameEl, { opacity: 1, y: 0, duration: 0.64 }, "-=0.4");
    });

    return () => {
      mobileQuery.removeEventListener("change", handleViewportChange);
    };
  });

  $effect(() => {
    if (!viewer) return;
    if (activeTab === "tfl" && showTflTraffic) {
      viewer.showTflCameras();
      return;
    }
    viewer.hideTflCameras();
  });

  $effect(() => {
    if (!viewer) {
      previousTab = activeTab;
      return;
    }

    if (activeTab === "tfl" && previousTab !== "tfl") {
      selectedLocation = "London";
      viewer.flyTo(-0.1276, 51.5074, 12000, 1.8);
    }

    previousTab = activeTab;
  });

  function getAccordionDetail(): string {
    if (activeTab === "covid") {
      if (selectedCountry) {
        return `${selectedCountry.countryInfo.iso3} · ${formatNumber(selectedCountry.cases)} cases`;
      }
      return showCovidData ? "COVID layer visible" : "Country lookup and pins";
    }

    if (activeTab === "tfl") {
      if (selectedLocation) return `Preset locked · ${selectedLocation}`;
      return `${tflCameraCount.toLocaleString()} London cameras`;
    }

    if (activeTab === "satellites") {
      return "Live orbital objects and orbit controls";
    }

    return "Seven-source response library";
  }

  function getDrawerEyebrow(): string {
    if (activeTab === "covid") return "Disease surface";
    if (activeTab === "satellites") return "Orbital feed";
    if (activeTab === "geospatial") return "Navigation";
    if (activeTab === "tfl") return "London network";
    return "Intel registry";
  }

  function getDrawerDescription(): string {
    if (activeTab === "covid") {
      return selectedCountry
        ? "Selected country profile pinned to the globe."
        : "Search countries, inspect case totals, and toggle the globe layer.";
    }

    if (activeTab === "satellites") {
      return "Track orbital objects, inspect live positions, and jump directly into view.";
    }

    if (activeTab === "geospatial") {
      return "Search locations, calculate directions, and visualize routes on the globe.";
    }

    if (activeTab === "tfl") {
      return "Reveal the London camera network, jump into the city, and inspect individual feeds.";
    }

    return "Monitor source status, live overlays, and response-ready feed detail.";
  }

  async function animateMobileDock(nextCollapsed: boolean) {
    if (!isMobile || !dockFrameEl || isAnimating) {
      isCollapsed = nextCollapsed;
      return;
    }

    isAnimating = true;
    const targets = [dockFrameEl, accordionSummaryEl].filter(Boolean) as Element[];
    const state = Flip.getState(targets, { props: "borderRadius,boxShadow,opacity" });

    isCollapsed = nextCollapsed;
    await tick();

    Flip.from(state, {
      duration: nextCollapsed ? 0.32 : 0.42,
      ease: "power3.inOut",
      nested: true,
      absolute: false,
      simple: true,
      prune: true,
      onComplete: () => {
        isAnimating = false;
      },
    });

    if (dockFrameEl) {
      gsap.fromTo(
        dockFrameEl,
        { y: nextCollapsed ? 0 : 18, opacity: nextCollapsed ? 1 : 0.92 },
        {
          y: 0,
          opacity: 1,
          duration: nextCollapsed ? 0.26 : 0.34,
          ease: "power2.out",
          clearProps: "transform,opacity",
        },
      );
    }
  }

  function toggleDock() {
    void animateMobileDock(!isCollapsed);
  }

  function flyToLocation(name: string) {
    if (!viewer) return;
    const location = locations.find((item) => item.name === name);
    if (!location) return;
    isFlying = true;
    selectedLocation = name;
    viewer.flyTo(location.lon, location.lat, location.height, 2);
    setTimeout(() => {
      isFlying = false;
    }, 2000);
  }

  function flyToCountry(country: CovidCountry) {
    if (!viewer) return;
    viewer.flyToCountry(country.countryInfo.lat, country.countryInfo.long, country.countryInfo.iso3);
    onSelectCountry(country);
    searchQuery = "";
  }

  function handleClearCountry() {
    onClearCountry();
    viewer?.flyTo(0, 20, 20000000, 2);
  }

  function getCurrentPosition() {
    if (!viewer) return;
    const pos = viewer.getCameraPosition();
    if (pos) {
      alert(
        `Camera Position:\nLon: ${pos.longitude.toFixed(4)}\nLat: ${pos.latitude.toFixed(4)}\nHeight: ${pos.height.toFixed(0)}m`,
      );
    }
  }

  function focusLondonTraffic() {
    if (!viewer) return;
    selectedLocation = "London";
    showTflTraffic = true;
    viewer.flyTo(-0.1276, 51.5074, 12000, 1.8);
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  function changeGlobeStyle(styleId: GlobeStyle) {
    if (!viewer) return;
    currentStyle = styleId;
    viewer.setGlobeStyle(styleId);
    localStorage.setItem("earth-globe-style", styleId);
    showStylePicker = false;
  }

  function toggleCovidData() {
    showCovidData = !showCovidData;
    if (!viewer) return;
    if (showCovidData) {
      viewer.showCovidPoints();
    } else {
      viewer.hideCovidPoints();
    }
  }

  function toggleTflTraffic() {
    showTflTraffic = !showTflTraffic;
    if (!viewer) return;
    if (showTflTraffic) {
      viewer.showTflCameras();
    } else {
      viewer.hideTflCameras();
    }
  }
</script>

<nav bind:this={topNavEl} class="top-nav">
  <div class="top-nav-brand">
    <span class="top-nav-wordmark">ponti.earth</span>
    <span class="top-nav-meta">field atlas</span>
  </div>

  <div class="top-nav-actions">
    <div class="style-picker-container">
      <button
        class="theme-trigger"
        type="button"
        aria-label="Change globe theme"
        onclick={() => (showStylePicker = !showStylePicker)}
      >
        <NavIcon name="theme" />
        <span>{globeStyles.find((style) => style.id === currentStyle)?.name ?? "Theme"}</span>
      </button>

      {#if showStylePicker}
        <div class="style-dropdown panel-card">
          {#each globeStyles as style}
            <button
              class="style-option"
              class:active={style.id === currentStyle}
              type="button"
              onclick={() => changeGlobeStyle(style.id)}
            >
              <span>{style.name}</span>
              {#if style.id === currentStyle}
                <span class="style-check"></span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    {#if canRestore}
      <button class="theme-trigger" type="button" onclick={onRestoreFocus}>
        <span>{restoreLabel}</span>
      </button>
    {/if}
  </div>
</nav>

{#if !isMobile}
  <div bind:this={modeTabsEl} class="mode-tabs panel-card panel-scroll">
    {#each tabs as tab}
      <button
        class="mode-tab"
        class:active={tab.id === activeTab}
        type="button"
        onclick={() => onActiveTabChange(tab.id)}
      >
        <NavIcon name={tab.icon} />
        <span class="panel-label">{tab.short}</span>
        <strong>{tab.label}</strong>
      </button>
    {/each}
  </div>
{/if}

<section class="dock-shell" class:mobile={isMobile}>
  <div bind:this={dockFrameEl} class="dock-frame panel-card" class:mobile={isMobile} class:collapsed={isCollapsed && !isMobile}>
    {#if isMobile}
      <button bind:this={accordionSummaryEl} class="mobile-accordion-head" type="button" onclick={toggleDock}>
        <div class="mobile-accordion-copy">
          <p class="panel-kicker">{activeTabMeta.short}</p>
          <strong>{mobileAccordionTitle}</strong>
          <span>{mobileAccordionDetail}</span>
        </div>
        <span class="mobile-accordion-toggle">
          <NavIcon name={isCollapsed ? "chevron-up" : "chevron-down"} />
        </span>
      </button>
    {/if}

    {#if !isMobile}
      <header class="drawer-header">
        <div class="drawer-header-copy">
          <p class="panel-kicker">{drawerEyebrow}</p>
          <h2>{activeTabMeta.label}</h2>
          <p class="panel-copy">{drawerDescription}</p>
        </div>

        <button class="panel-button panel-icon-button" type="button" onclick={() => (isCollapsed = !isCollapsed)}>
          <NavIcon name={isCollapsed ? "chevron-up" : "chevron-down"} />
        </button>
      </header>
    {/if}

    <div class="drawer-body" class:hidden={isMobile && isCollapsed} class:desktop-hidden={isCollapsed && !isMobile}>
      {#if isMobile}
        <div class="mobile-tabs panel-scroll">
          {#each tabs as tab}
            <button
              class="mobile-tab"
              class:active={tab.id === activeTab}
              type="button"
              onclick={() => onActiveTabChange(tab.id)}
            >
              <NavIcon name={tab.icon} />
              <span>{tab.label}</span>
            </button>
          {/each}
        </div>
      {/if}

      <div class="drawer-scroll panel-scroll">
        {#if activeTab === "intel"}
          <IntelSidebar
            {viewer}
            selectedFeedId={selectedIntelFeedId}
            isAcledTracking={intelTracking}
            onSelectFeed={onSelectIntelFeed}
            onTrackingChange={onIntelTrackingChange}
          />
        {:else if activeTab === "covid"}
          <div class="panel-stack">
            <PanelSection eyebrow="Dataset" title="COVID signal">
              <button
                class="panel-button"
                class:panel-button-primary={showCovidData}
                type="button"
                onclick={toggleCovidData}
              >
                {showCovidData ? "Hide globe layer" : "Show globe layer"}
              </button>
            </PanelSection>

            {#if selectedCountry}
              <PanelSection eyebrow="Selected country" title={selectedCountry.country}>
                <div class="country-card panel-card">
                  <div class="country-head">
                    <img src={selectedCountry.countryInfo.flag} alt="{selectedCountry.country} flag" class="country-flag" />
                    <div>
                      <p class="panel-kicker">{selectedCountry.countryInfo.iso3}</p>
                      <p class="panel-copy">Country profile locked to the current globe selection.</p>
                    </div>
                  </div>

                  <div class="metric-grid">
                    <PanelMetric label="Cases" value={formatNumber(selectedCountry.cases)} />
                    <PanelMetric label="Deaths" value={formatNumber(selectedCountry.deaths)} tone="critical" />
                    <PanelMetric label="Recovered" value={formatNumber(selectedCountry.recovered)} tone="live" />
                  </div>

                  <button class="panel-button panel-button-primary" type="button" onclick={handleClearCountry}>
                    Back to world view
                  </button>
                </div>
              </PanelSection>
            {:else}
              <PanelSection
                eyebrow="Search"
                title="Country lookup"
                description="Search a country or select a point directly on the globe."
              >
                <input
                  class="panel-input"
                  type="text"
                  bind:value={searchQuery}
                  placeholder="Search countries or ISO3"
                />

                {#if searchQuery && filteredCountries.length > 0}
                  <div class="country-results panel-card-subtle">
                    {#each filteredCountries as country}
                      <button class="country-result" type="button" onclick={() => flyToCountry(country)}>
                        <div class="country-result-main">
                          <img src={country.countryInfo.flag} alt="{country.country} flag" class="result-flag" />
                          <div>
                            <span class="result-name">{country.country}</span>
                            <span class="panel-kicker">{country.countryInfo.iso3}</span>
                          </div>
                        </div>
                        <span class="result-value">{formatNumber(country.cases)}</span>
                      </button>
                    {/each}
                  </div>
                {:else if searchQuery}
                  <div class="empty-state panel-card-subtle">No countries found.</div>
                {/if}
              </PanelSection>

              <PanelSection eyebrow="Coverage" title="Dataset status">
                <div class="metric-grid">
                  <PanelMetric label="Countries" value={covidCountries.length} />
                  <PanelMetric
                    label="Layer"
                    value={showCovidData ? "Visible" : "Hidden"}
                    tone={showCovidData ? "live" : "default"}
                  />
                </div>
              </PanelSection>
            {/if}
          </div>
        {:else if activeTab === "satellites"}
          <SatelliteTracker
            {viewer}
            selectedSatelliteId={selectedSatelliteId}
            isTracking={satelliteTracking}
            onSelectSatellite={onSelectSatellite}
            onTrackingChange={onSatelliteTrackingChange}
          />
        {:else if activeTab === "geospatial"}
          <GeospatialSearch {viewer} />
        {:else}
          <div class="panel-stack">
            <PanelSection eyebrow="Route presets" title="Fly to positions">
              <div class="location-grid">
                {#each locations as location}
                  <button
                    class="location-card panel-card-subtle"
                    class:active={selectedLocation === location.name}
                    disabled={isFlying || !viewer}
                    type="button"
                    onclick={() => flyToLocation(location.name)}
                  >
                    <span class="panel-label">Preset</span>
                    <strong>{location.name}</strong>
                  </button>
                {/each}
              </div>
            </PanelSection>

            <PanelSection
              eyebrow="London traffic"
              title="TfL camera layer"
              description="Camera points stay anchored around London and open feed cards directly from the globe."
            >
              <div class="metric-grid">
                <PanelMetric label="Cameras" value={tflCameraCount.toLocaleString()} />
                <PanelMetric
                  label="Layer"
                  value={showTflTraffic ? "Visible" : "Hidden"}
                  tone={showTflTraffic ? "live" : "default"}
                />
              </div>

              <div class="panel-action-row">
                <button class="panel-button panel-button-primary" type="button" disabled={!viewer} onclick={focusLondonTraffic}>
                  Jump to London traffic
                </button>
                <button class="panel-button" type="button" disabled={!viewer} onclick={toggleTflTraffic}>
                  {showTflTraffic ? "Hide cameras" : "Show cameras"}
                </button>
              </div>
            </PanelSection>

            <PanelSection eyebrow="Diagnostics" title="Camera tools">
              <button class="panel-button panel-button-ghost" type="button" disabled={!viewer} onclick={getCurrentPosition}>
                Get camera position
              </button>
            </PanelSection>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .top-nav {
    position: fixed;
    top: 16px;
    left: 16px;
    right: 16px;
    z-index: 130;
    min-height: 62px;
    padding: 0 var(--space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    background: rgba(246, 240, 228, 0.94);
    border: 1px solid var(--border-default);
    box-shadow: var(--shadow-md);
    pointer-events: auto;
  }

  .top-nav-brand,
  .top-nav-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .top-nav-brand {
    min-width: 0;
  }

  .top-nav-wordmark {
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .top-nav-meta {
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .style-picker-container {
    position: relative;
  }

  .theme-trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--bg-panel-0);
    color: var(--text-secondary);
    font: inherit;
    cursor: pointer;
  }

  .theme-trigger:hover {
    background: var(--bg-panel-2);
    border-color: var(--border-strong);
  }

  .style-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 220px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 10;
  }

  .style-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    width: 100%;
    min-height: 38px;
    padding: 0 10px;
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    text-align: left;
    font: inherit;
  }

  .style-option:hover,
  .style-option.active {
    background: var(--bg-panel-2);
    color: var(--text-primary);
  }

  .style-check {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--accent-primary);
  }

  .panel-action-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .mode-tabs {
    position: fixed;
    top: 94px;
    left: 16px;
    right: 16px;
    z-index: 120;
    min-height: 62px;
    padding: 8px;
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    pointer-events: auto;
  }

  .mode-tabs::-webkit-scrollbar {
    display: none;
  }

  .mode-tab {
    flex: 0 0 auto;
    min-width: 116px;
    min-height: 44px;
    padding: 0 14px;
    border-radius: var(--radius-lg);
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    scroll-snap-align: start;
    font: inherit;
  }

  .mode-tab:hover {
    background: var(--bg-panel-1);
    border-color: var(--border-default);
  }

  .mode-tab.active {
    background: var(--bg-panel-2);
    border-color: var(--border-accent);
    color: var(--text-primary);
  }

  .mode-tab strong {
    font-size: var(--text-md);
    font-weight: 600;
  }

  .dock-shell {
    position: fixed;
    top: 168px;
    right: 16px;
    bottom: 16px;
    z-index: 120;
    display: flex;
    justify-content: flex-end;
    pointer-events: none;
  }

  .dock-frame {
    width: min(420px, calc(100vw - 32px));
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    pointer-events: auto;
  }

  .dock-frame.collapsed {
    width: 74px;
  }

  .drawer-header {
    flex: 0 0 auto;
    min-height: 116px;
    padding: 18px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .drawer-header-copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .drawer-header-copy h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--text-xl);
    font-weight: 600;
    letter-spacing: -0.03em;
  }

  .drawer-body {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
  }

  .drawer-body.hidden,
  .drawer-body.desktop-hidden {
    display: none;
  }

  .drawer-scroll {
    flex: 1;
    min-height: 0;
    padding: 18px;
    overflow-y: auto;
  }

  .mobile-tabs {
    display: none;
  }

  .country-card,
  .country-results,
  .location-card {
    padding: var(--space-4);
  }

  .country-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .country-head {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .country-flag,
  .result-flag {
    width: 36px;
    height: 24px;
    border-radius: var(--radius-sm);
    object-fit: cover;
    border: 1px solid var(--border-subtle);
  }

  .metric-grid,
  .location-grid {
    display: grid;
    gap: var(--space-3);
  }

  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .location-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .country-results {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .country-result {
    min-height: 56px;
    padding: 0 12px;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    color: var(--text-secondary);
    cursor: pointer;
    text-align: left;
    font: inherit;
  }

  .country-result:hover {
    background: rgba(22, 21, 20, 0.04);
  }

  .country-result-main {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .result-name,
  .location-card strong {
    color: var(--text-primary);
    font-size: var(--text-md);
    font-weight: 600;
  }

  .result-value {
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .empty-state {
    padding: var(--space-4);
    color: var(--text-muted);
  }

  .location-card {
    min-height: 92px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
    cursor: pointer;
    text-align: left;
    font: inherit;
  }

  .location-card.active {
    background: var(--bg-panel-2);
    border-color: var(--border-strong);
  }

  @media (max-width: 980px) {
    .dock-frame {
      width: min(380px, calc(100vw - 32px));
    }

    .location-grid,
    .metric-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .top-nav {
      min-height: 56px;
      padding-inline: 12px;
    }

    .top-nav-meta {
      display: none;
    }

    .theme-trigger span:last-child {
      display: none;
    }

    .dock-shell {
      top: auto;
      left: 12px;
      right: 12px;
      bottom: 12px;
    }

    .dock-frame {
      width: 100%;
      height: auto;
      max-height: min(78vh, 640px);
      border-radius: var(--radius-xl);
    }

    .mobile-accordion-head {
      width: 100%;
      min-height: 76px;
      padding: 14px 16px;
      border: none;
      background: transparent;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      text-align: left;
      font: inherit;
      cursor: pointer;
    }

    .mobile-accordion-copy {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .mobile-accordion-copy strong {
      font-size: var(--text-lg);
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .mobile-accordion-copy span {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      line-height: 1.4;
    }

    .mobile-accordion-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 999px;
      border: 1px solid var(--border-default);
      background: var(--bg-panel-1);
      color: var(--text-secondary);
      flex: 0 0 auto;
    }

    .drawer-body {
      border-top: 1px solid var(--border-subtle);
    }

    .mobile-tabs {
      display: flex;
      gap: var(--space-2);
      padding: 12px 16px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      border-bottom: 1px solid var(--border-subtle);
      scrollbar-width: none;
    }

    .mobile-tabs::-webkit-scrollbar {
      display: none;
    }

    .mobile-tab {
      flex: 0 0 auto;
      min-height: 38px;
      padding: 0 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-default);
      background: var(--bg-panel-1);
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
      scroll-snap-align: start;
      font: inherit;
    }

    .mobile-tab.active {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
      color: var(--text-on-dark);
    }

    .drawer-scroll {
      padding: 16px;
      max-height: min(58vh, 520px);
    }
  }
</style>
