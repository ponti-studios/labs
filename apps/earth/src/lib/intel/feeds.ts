export type IntelFeedAvailability = "live" | "planned" | "catalog";
export type IntelOverlayId = "acled" | "gdacs";

export interface IntelFeedDefinition {
  id: string;
  label: string;
  shortLabel: string;
  category: string;
  availability: IntelFeedAvailability;
  cadence: string;
  visualization: string;
  description: string;
  sourceUrl: string;
  overlayId?: IntelOverlayId;
  supportsGlobe: boolean;
  accent: string;
}

export const intelFeeds: IntelFeedDefinition[] = [
  {
    id: "acled",
    label: "Armed Conflict & Warzones",
    shortLabel: "ACLED",
    category: "Conflict",
    availability: "live",
    cadence: "Daily",
    visualization: "Heat zones, battle markers, fatality labels",
    description:
      "Tracks conflict events, battles, protests, and violence intensity across active hotspots.",
    sourceUrl: "https://acleddata.com/api",
    overlayId: "acled",
    supportsGlobe: true,
    accent: "#c0392b",
  },
  {
    id: "gdelt",
    label: "Global Events Monitor",
    shortLabel: "GDELT",
    category: "Signals",
    availability: "catalog",
    cadence: "15 min",
    visualization: "Event clusters, tone fields, protest density",
    description:
      "Monitors news event volumes and sentiment to surface geopolitical shifts as they emerge.",
    sourceUrl: "https://www.gdeltproject.org/",
    supportsGlobe: false,
    accent: "#3a6a8a",
  },
  {
    id: "maritime",
    label: "Maritime Intelligence",
    shortLabel: "AIS",
    category: "Movement",
    availability: "catalog",
    cadence: "Real-time",
    visualization: "Vessel icons, route lines, port activity",
    description:
      "Follows ship traffic, vessel classes, chokepoints, and route behavior across sea lanes.",
    sourceUrl: "https://www.aishub.net/",
    supportsGlobe: false,
    accent: "#3f5f70",
  },
  {
    id: "adsb",
    label: "Aircraft Tracking",
    shortLabel: "ADS-B",
    category: "Movement",
    availability: "catalog",
    cadence: "Real-time",
    visualization: "Aircraft icons, flight paths, airport density",
    description:
      "Maps civil and military air traffic with a focus on routing, density, and unusual activity.",
    sourceUrl: "https://www.adsbexchange.com/",
    supportsGlobe: false,
    accent: "#6f7380",
  },
  {
    id: "gdacs",
    label: "Natural Disasters",
    shortLabel: "GDACS",
    category: "Disaster",
    availability: "planned",
    cadence: "Real-time",
    visualization: "Severity markers, alert zones, affected areas",
    description:
      "Surfaces earthquakes, floods, wildfires, tsunamis, and alert severity for rapid response.",
    sourceUrl: "https://www.gdacs.org/",
    overlayId: "gdacs",
    supportsGlobe: true,
    accent: "#c67c2a",
  },
  {
    id: "cyber",
    label: "Cyber Attack Map",
    shortLabel: "Cyber",
    category: "Threat",
    availability: "catalog",
    cadence: "Variable",
    visualization: "Origin-target arcs, vector activity, hotspot arcs",
    description:
      "Represents cyber activity as directional threat flows between origin and target regions.",
    sourceUrl: "https://cybermap.kaspersky.com/",
    supportsGlobe: false,
    accent: "#4b4f56",
  },
  {
    id: "economic",
    label: "Economic Intelligence",
    shortLabel: "Economic",
    category: "Macro",
    availability: "catalog",
    cadence: "Periodic",
    visualization: "Trade corridors, choropleths, sanctions signals",
    description:
      "Brings trade, sanctions, and macro indicators into a geographic intelligence picture.",
    sourceUrl: "https://data.worldbank.org/",
    supportsGlobe: false,
    accent: "#3a7a4a",
  },
];

export function getIntelFeed(feedId: string): IntelFeedDefinition | undefined {
  return intelFeeds.find((feed) => feed.id === feedId);
}

export function getIntelOverview(activeOverlayIds: string[]) {
  const liveFeeds = intelFeeds.filter((feed) => feed.availability === "live");
  const plannedFeeds = intelFeeds.filter((feed) => feed.availability === "planned");

  return {
    totalSources: intelFeeds.length,
    liveSources: liveFeeds.length,
    plannedSources: plannedFeeds.length,
    activeOverlays: liveFeeds.filter((feed) => activeOverlayIds.includes(feed.id)).length,
  };
}

function assertIntelFeeds() {
  if (intelFeeds.length !== 7) {
    throw new Error(`Expected 7 intel feeds, received ${intelFeeds.length}`);
  }

  const ids = new Set(intelFeeds.map((feed) => feed.id));
  if (ids.size !== intelFeeds.length) {
    throw new Error("Intel feed ids must be unique");
  }

  const acled = getIntelFeed("acled");
  const gdacs = getIntelFeed("gdacs");

  if (!acled || acled.availability !== "live") {
    throw new Error("ACLED must remain the live source");
  }

  if (!gdacs || gdacs.availability !== "planned") {
    throw new Error("GDACS must remain the planned source");
  }
}

assertIntelFeeds();
