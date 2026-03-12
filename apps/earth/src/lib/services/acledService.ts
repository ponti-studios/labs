/**
 * ACLED (Armed Conflict Location & Event Data Project) Service
 *
 * Fetches real-time conflict data including:
 * - Battles and armed clashes
 * - Protests and demonstrations
 * - Violence against civilians
 * - Strategic developments
 *
 * Note: ACLED requires free API key for commercial use
 * Register at: https://acleddata.com/acled-access/
 */

// Cache storage
const cache = {
  events: null as ACLEDEvent[] | null,
  lastFetch: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ACLED Event Types
export type ACLEDEventType =
  | "Battles"
  | "Violence against civilians"
  | "Protests"
  | "Riots"
  | "Strategic developments";

export interface ACLEDEvent {
  event_id_cnty: string;
  event_date: string;
  year: number;
  event_type: ACLEDEventType;
  sub_event_type: string;
  actor1: string;
  actor2: string;
  location: string;
  latitude: number;
  longitude: number;
  geo_precision: number;
  source: string;
  notes: string;
  fatalities: number;
  country: string;
  admin1: string; // State/Province
  admin2: string; // District
  admin3: string; // City/County
  timestamp: number;
}

export interface ACLEDFilters {
  eventTypes?: ACLEDEventType[];
  countries?: string[];
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  minFatalities?: number;
  maxFatalities?: number;
}

// Event type colors for visualization
export const ACLED_COLORS: Record<ACLEDEventType, string> = {
  Battles: "#c0392b",
  "Violence against civilians": "#c67c2a",
  Riots: "#b8991a",
  Protests: "#3a7a4a",
  "Strategic developments": "#3a6a8a",
};

// Event type icons (can use emojis or custom markers)
export const ACLED_ICONS: Record<ACLEDEventType, string> = {
  Battles: "💥",
  "Violence against civilians": "⚠️",
  Riots: "🔥",
  Protests: "📢",
  "Strategic developments": "🎯",
};

// Event severity ranking (for filtering/sorting)
export const ACLED_SEVERITY: Record<ACLEDEventType, number> = {
  Battles: 5,
  "Violence against civilians": 4,
  Riots: 3,
  Protests: 2,
  "Strategic developments": 1,
};

/**
 * Fetch ACLED events from the API
 * Note: In production, this requires an API key
 * For demo purposes, we'll use a mock dataset
 */
export async function fetchACLEDEvents(filters?: ACLEDFilters): Promise<ACLEDEvent[]> {
  const now = Date.now();

  // Return cached data if fresh
  if (cache.events && now - cache.lastFetch < CACHE_DURATION) {
    return applyFilters(cache.events, filters);
  }

  try {
    // In production, use real ACLED API:
    // const response = await fetch(
    //   `https://api.acleddata.com/acled/read?key=${ACLED_API_KEY}&...`
    // );

    // For demo, generate realistic mock data
    const events = generateMockACLEDEvents();

    cache.events = events;
    cache.lastFetch = now;

    return applyFilters(events, filters);
  } catch (error) {
    console.error("Error fetching ACLED data:", error);
    return cache.events || [];
  }
}

/**
 * Get summary statistics for conflict events
 */
export function getACLEDStats(events: ACLEDEvent[]) {
  const stats = {
    totalEvents: events.length,
    totalFatalities: events.reduce((sum, e) => sum + (e.fatalities || 0), 0),
    byType: {} as Record<ACLEDEventType, number>,
    byCountry: {} as Record<string, number>,
    recentEvents: [] as ACLEDEvent[],
    highSeverityEvents: [] as ACLEDEvent[],
  };

  // Count by type
  events.forEach((event) => {
    stats.byType[event.event_type] = (stats.byType[event.event_type] || 0) + 1;
    stats.byCountry[event.country] = (stats.byCountry[event.country] || 0) + 1;
  });

  // Get events from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  stats.recentEvents = events
    .filter((e) => new Date(e.event_date) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
    .slice(0, 10);

  // Get high severity events (battles with fatalities)
  stats.highSeverityEvents = events
    .filter((e) => e.event_type === "Battles" && e.fatalities > 5)
    .sort((a, b) => (b.fatalities || 0) - (a.fatalities || 0))
    .slice(0, 10);

  return stats;
}

/**
 * Get active conflict zones (areas with high event density)
 */
export function getConflictZones(events: ACLEDEvent[]): Array<{
  lat: number;
  lng: number;
  intensity: number;
  country: string;
  admin1: string;
  eventCount: number;
  fatalities: number;
}> {
  // Group events by approximate location (within 50km)
  const zones = new Map<
    string,
    {
      lat: number;
      lng: number;
      events: ACLEDEvent[];
    }
  >();

  events.forEach((event) => {
    // Round coordinates to group nearby events
    const key = `${event.country}-${event.admin1}`;

    if (!zones.has(key)) {
      zones.set(key, {
        lat: event.latitude,
        lng: event.longitude,
        events: [],
      });
    }

    zones.get(key)!.events.push(event);
  });

  // Calculate intensity for each zone
  return Array.from(zones.entries())
    .map(([, zone]) => ({
      lat: zone.lat,
      lng: zone.lng,
      intensity: calculateIntensity(zone.events),
      country: zone.events[0]?.country || "",
      admin1: zone.events[0]?.admin1 || "",
      eventCount: zone.events.length,
      fatalities: zone.events.reduce((sum, e) => sum + (e.fatalities || 0), 0),
    }))
    .sort((a, b) => b.intensity - a.intensity);
}

/**
 * Filter events based on criteria
 */
function applyFilters(events: ACLEDEvent[], filters?: ACLEDFilters): ACLEDEvent[] {
  if (!filters) return events;

  return events.filter((event) => {
    // Filter by event type
    if (filters.eventTypes?.length && !filters.eventTypes.includes(event.event_type)) {
      return false;
    }

    // Filter by country
    if (filters.countries?.length && !filters.countries.includes(event.country)) {
      return false;
    }

    // Filter by date range
    if (filters.dateFrom && new Date(event.event_date) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(event.event_date) > new Date(filters.dateTo)) {
      return false;
    }

    // Filter by fatalities
    if (filters.minFatalities !== undefined && (event.fatalities || 0) < filters.minFatalities) {
      return false;
    }
    if (filters.maxFatalities !== undefined && (event.fatalities || 0) > filters.maxFatalities) {
      return false;
    }

    return true;
  });
}

/**
 * Calculate conflict intensity score (0-100)
 */
function calculateIntensity(events: ACLEDEvent[]): number {
  let score = 0;

  events.forEach((event) => {
    // Base score by event type severity
    score += ACLED_SEVERITY[event.event_type] * 10;

    // Add points for fatalities
    score += (event.fatalities || 0) * 5;

    // Bonus for recent events (within last 7 days)
    const eventDate = new Date(event.event_date);
    const daysAgo = (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo <= 7) {
      score += 20;
    }
  });

  // Normalize to 0-100
  return Math.min(100, score);
}

/**
 * Generate realistic mock ACLED events for demo
 * Based on real-world conflict patterns
 */
function generateMockACLEDEvents(): ACLEDEvent[] {
  const events: ACLEDEvent[] = [];
  const today = new Date();

  // Ukraine-Russia conflict zone
  const ukraineEvents: ACLEDEvent[] = [
    {
      event_id_cnty: "UKR001",
      event_date: formatDate(today),
      year: today.getFullYear(),
      event_type: "Battles",
      sub_event_type: "Armed clash",
      actor1: "Ukraine Military",
      actor2: "Russian Military",
      location: "Bakhmut",
      latitude: 48.5893,
      longitude: 37.9999,
      geo_precision: 1,
      source: "Local Source",
      notes: "Heavy fighting reported in eastern districts",
      fatalities: 12,
      country: "Ukraine",
      admin1: "Donetsk",
      admin2: "Bakhmut Raion",
      admin3: "Bakhmut City",
      timestamp: Date.now(),
    },
    {
      event_id_cnty: "UKR002",
      event_date: formatDate(new Date(today.getTime() - 86400000)),
      year: today.getFullYear(),
      event_type: "Violence against civilians",
      sub_event_type: "Attack",
      actor1: "Russian Forces",
      actor2: "Civilians",
      location: "Kharkiv",
      latitude: 49.9935,
      longitude: 36.2304,
      geo_precision: 1,
      source: "News Report",
      notes: "Civilian infrastructure targeted",
      fatalities: 3,
      country: "Ukraine",
      admin1: "Kharkiv",
      admin2: "Kharkiv Raion",
      admin3: "Kharkiv City",
      timestamp: Date.now() - 86400000,
    },
  ];

  // Gaza-Israel conflict zone
  const gazaEvents: ACLEDEvent[] = [
    {
      event_id_cnty: "PSE001",
      event_date: formatDate(today),
      year: today.getFullYear(),
      event_type: "Battles",
      sub_event_type: "Aerial bombardment",
      actor1: "Israeli Military",
      actor2: "Palestinian Militants",
      location: "Gaza City",
      latitude: 31.5017,
      longitude: 34.4668,
      geo_precision: 1,
      source: "Military Source",
      notes: "Airstrikes reported in multiple locations",
      fatalities: 25,
      country: "Palestine",
      admin1: "Gaza",
      admin2: "Gaza Governorate",
      admin3: "Gaza City",
      timestamp: Date.now(),
    },
    {
      event_id_cnty: "PSE002",
      event_date: formatDate(new Date(today.getTime() - 172800000)),
      year: today.getFullYear(),
      event_type: "Protests",
      sub_event_type: "Peaceful protest",
      actor1: "Palestinian Protesters",
      actor2: "",
      location: "Ramallah",
      latitude: 31.9074,
      longitude: 35.2044,
      geo_precision: 1,
      source: "Media Report",
      notes: "Large demonstration in city center",
      fatalities: 0,
      country: "Palestine",
      admin1: "West Bank",
      admin2: "Ramallah",
      admin3: "Ramallah City",
      timestamp: Date.now() - 172800000,
    },
  ];

  // Sudan conflict
  const sudanEvents: ACLEDEvent[] = [
    {
      event_id_cnty: "SDN001",
      event_date: formatDate(today),
      year: today.getFullYear(),
      event_type: "Battles",
      sub_event_type: "Armed clash",
      actor1: "Sudanese Armed Forces",
      actor2: "Rapid Support Forces",
      location: "Khartoum",
      latitude: 15.5007,
      longitude: 32.5599,
      geo_precision: 1,
      source: "International Source",
      notes: "Clashes in capital city",
      fatalities: 18,
      country: "Sudan",
      admin1: "Khartoum",
      admin2: "Khartoum",
      admin3: "Khartoum City",
      timestamp: Date.now(),
    },
    {
      event_id_cnty: "SDN002",
      event_date: formatDate(new Date(today.getTime() - 259200000)),
      year: today.getFullYear(),
      event_type: "Violence against civilians",
      sub_event_type: "Looting",
      actor1: "Militia Groups",
      actor2: "Civilians",
      location: "Darfur",
      latitude: 13.0,
      longitude: 25.0,
      geo_precision: 2,
      source: "Humanitarian Source",
      notes: "Reports of civilian displacement",
      fatalities: 7,
      country: "Sudan",
      admin1: "Darfur",
      admin2: "Darfur Region",
      admin3: "Various",
      timestamp: Date.now() - 259200000,
    },
  ];

  // Myanmar conflict
  const myanmarEvents: ACLEDEvent[] = [
    {
      event_id_cnty: "MMR001",
      event_date: formatDate(today),
      year: today.getFullYear(),
      event_type: "Battles",
      sub_event_type: "Armed clash",
      actor1: "Myanmar Military",
      actor2: "Ethnic Armed Groups",
      location: "Karen State",
      latitude: 17.3,
      longitude: 97.0,
      geo_precision: 2,
      source: "Regional Source",
      notes: "Fighting near border area",
      fatalities: 8,
      country: "Myanmar",
      admin1: "Kayin",
      admin2: "Karen State",
      admin3: "Various",
      timestamp: Date.now(),
    },
    {
      event_id_cnty: "MMR002",
      event_date: formatDate(new Date(today.getTime() - 345600000)),
      year: today.getFullYear(),
      event_type: "Protests",
      sub_event_type: "Demonstration",
      actor1: "Pro-Democracy Protesters",
      actor2: "",
      location: "Yangon",
      latitude: 16.8661,
      longitude: 96.1951,
      geo_precision: 1,
      source: "Media Report",
      notes: "Anti-coup protests continue",
      fatalities: 0,
      country: "Myanmar",
      admin1: "Yangon",
      admin2: "Yangon Region",
      admin3: "Yangon City",
      timestamp: Date.now() - 345600000,
    },
  ];

  // DRC (Congo) conflict
  const drcEvents: ACLEDEvent[] = [
    {
      event_id_cnty: "COD001",
      event_date: formatDate(today),
      year: today.getFullYear(),
      event_type: "Violence against civilians",
      sub_event_type: "Attack",
      actor1: "M23 Rebels",
      actor2: "Civilians",
      location: "Goma",
      latitude: -1.6585,
      longitude: 29.2205,
      geo_precision: 1,
      source: "International Source",
      notes: "Civilian casualties reported",
      fatalities: 15,
      country: "DR Congo",
      admin1: "North Kivu",
      admin2: "Goma Territory",
      admin3: "Goma City",
      timestamp: Date.now(),
    },
    {
      event_id_cnty: "COD002",
      event_date: formatDate(new Date(today.getTime() - 432000000)),
      year: today.getFullYear(),
      event_type: "Riots",
      sub_event_type: "Violent demonstration",
      actor1: "Protesters",
      actor2: "Police",
      location: "Kinshasa",
      latitude: -4.4419,
      longitude: 15.2663,
      geo_precision: 1,
      source: "Local Source",
      notes: "Unrest in capital city",
      fatalities: 2,
      country: "DR Congo",
      admin1: "Kinshasa",
      admin2: "Kinshasa Province",
      admin3: "Kinshasa City",
      timestamp: Date.now() - 432000000,
    },
  ];

  // Ethiopia (Tigray conflict aftermath)
  const ethiopiaEvents: ACLEDEvent[] = [
    {
      event_id_cnty: "ETH001",
      event_date: formatDate(new Date(today.getTime() - 518400000)),
      year: today.getFullYear(),
      event_type: "Strategic developments",
      sub_event_type: "Military deployment",
      actor1: "Ethiopian Military",
      actor2: "",
      location: "Tigray",
      latitude: 14.0325,
      longitude: 38.3166,
      geo_precision: 2,
      source: "Military Source",
      notes: "Troop movements observed",
      fatalities: 0,
      country: "Ethiopia",
      admin1: "Tigray",
      admin2: "Tigray Region",
      admin3: "Various",
      timestamp: Date.now() - 518400000,
    },
  ];

  // Yemen conflict
  const yemenEvents: ACLEDEvent[] = [
    {
      event_id_cnty: "YEM001",
      event_date: formatDate(new Date(today.getTime() - 604800000)),
      year: today.getFullYear(),
      event_type: "Battles",
      sub_event_type: "Armed clash",
      actor1: "Houthi Forces",
      actor2: "Coalition Forces",
      location: "Hudaydah",
      latitude: 14.8023,
      longitude: 42.9511,
      geo_precision: 1,
      source: "Military Source",
      notes: "Fighting near port city",
      fatalities: 11,
      country: "Yemen",
      admin1: "Hudaydah",
      admin2: "Hudaydah Governorate",
      admin3: "Hudaydah City",
      timestamp: Date.now() - 604800000,
    },
  ];

  // Syria conflict (ongoing)
  const syriaEvents: ACLEDEvent[] = [
    {
      event_id_cnty: "SYR001",
      event_date: formatDate(today),
      year: today.getFullYear(),
      event_type: "Battles",
      sub_event_type: "Airstrike",
      actor1: "Syrian Military",
      actor2: "Opposition Forces",
      location: "Idlib",
      latitude: 35.9308,
      longitude: 36.6339,
      geo_precision: 1,
      source: "Regional Source",
      notes: "Airstrikes reported",
      fatalities: 9,
      country: "Syria",
      admin1: "Idlib",
      admin2: "Idlib Governorate",
      admin3: "Idlib City",
      timestamp: Date.now(),
    },
    {
      event_id_cnty: "SYR002",
      event_date: formatDate(new Date(today.getTime() - 691200000)),
      year: today.getFullYear(),
      event_type: "Violence against civilians",
      sub_event_type: "Arrest",
      actor1: "Government Forces",
      actor2: "Civilians",
      location: "Damascus",
      latitude: 33.5138,
      longitude: 36.2765,
      geo_precision: 1,
      source: "Human Rights Watch",
      notes: "Civilian detentions reported",
      fatalities: 0,
      country: "Syria",
      admin1: "Damascus",
      admin2: "Damascus Governorate",
      admin3: "Damascus City",
      timestamp: Date.now() - 691200000,
    },
  ];

  // Afghanistan
  const afghanistanEvents: ACLEDEvent[] = [
    {
      event_id_cnty: "AFG001",
      event_date: formatDate(new Date(today.getTime() - 777600000)),
      year: today.getFullYear(),
      event_type: "Strategic developments",
      sub_event_type: "Territorial control",
      actor1: "Taliban",
      actor2: "",
      location: "Kabul",
      latitude: 34.5553,
      longitude: 69.2075,
      geo_precision: 1,
      source: "Local Source",
      notes: "Security operations ongoing",
      fatalities: 0,
      country: "Afghanistan",
      admin1: "Kabul",
      admin2: "Kabul Province",
      admin3: "Kabul City",
      timestamp: Date.now() - 777600000,
    },
  ];

  events.push(
    ...ukraineEvents,
    ...gazaEvents,
    ...sudanEvents,
    ...myanmarEvents,
    ...drcEvents,
    ...ethiopiaEvents,
    ...yemenEvents,
    ...syriaEvents,
    ...afghanistanEvents,
  );

  return events;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
