import * as Cesium from "cesium";

export interface Satellite {
  id: string;
  name: string;
  type: "iss" | "space-station" | "satellite";
  latitude: number;
  longitude: number;
  altitude: number; // in meters
  velocity: number; // km/h
  timestamp: Date;
  entity?: Cesium.Entity;
  orbitPath?: Cesium.Entity;
}

// ISS NORAD ID
const ISS_NORAD_ID = "25544";

// Other notable satellites/space stations
const TRACKED_SATELLITES = [
  { noradId: "25544", name: "ISS", type: "iss" as const },
  { noradId: "48274", name: "Tiangong", type: "space-station" as const },
  { noradId: "20580", name: "Hubble", type: "satellite" as const },
];

/**
 * Fetch current ISS position from "Where the ISS at" API
 */
export async function fetchISSPosition(): Promise<Satellite | null> {
  try {
    const response = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
    if (!response.ok) throw new Error("Failed to fetch ISS data");

    const data = await response.json();

    return {
      id: "iss",
      name: "ISS (International Space Station)",
      type: "iss",
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude * 1000, // Convert km to meters
      velocity: data.velocity,
      timestamp: new Date(data.timestamp * 1000),
    };
  } catch (error) {
    console.error("Error fetching ISS position:", error);
    return null;
  }
}

/**
 * Fetch TLE (Two-Line Element) data from CelesTrak
 * Note: In production, you might want to cache this
 */
export async function fetchTLEData(noradId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://celestrak.org/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=TLE`
    );
    if (!response.ok) throw new Error("Failed to fetch TLE data");

    return await response.text();
  } catch (error) {
    console.error(`Error fetching TLE for ${noradId}:`, error);
    return null;
  }
}

/**
 * Fetch positions for all tracked satellites
 */
export async function fetchAllSatellites(): Promise<Satellite[]> {
  const satellites: Satellite[] = [];

  // Always fetch ISS first
  const iss = await fetchISSPosition();
  if (iss) satellites.push(iss);

  // For demo purposes, we'll add some static positions for other satellites
  // In production, you'd parse TLE and calculate positions
  const staticSatellites: Satellite[] = [
    {
      id: "tiangong",
      name: "Tiangong Space Station",
      type: "space-station",
      latitude: 20 + Math.random() * 20,
      longitude: 100 + Math.random() * 40,
      altitude: 400000,
      velocity: 27600,
      timestamp: new Date(),
    },
    {
      id: "hubble",
      name: "Hubble Space Telescope",
      type: "satellite",
      latitude: -10 + Math.random() * 20,
      longitude: -60 + Math.random() * 40,
      altitude: 540000,
      velocity: 28000,
      timestamp: new Date(),
    },
  ];

  satellites.push(...staticSatellites);

  return satellites;
}

/**
 * Calculate orbit path from TLE data
 * This is a simplified version - for production use satellite.js library
 */
export function calculateOrbitPath(
  satellite: Satellite,
  samples: number = 90
): Cesium.Cartesian3[] {
  const positions: Cesium.Cartesian3[] = [];
  const orbitMinutes = 90; // Approximate orbit period in minutes

  for (let i = 0; i <= samples; i++) {
    const timeOffset = (i / samples) * orbitMinutes * 60; // seconds
    // Simplified orbital movement - in production use proper orbital mechanics
    const offsetDegrees = (timeOffset / (orbitMinutes * 60)) * 360;

    const lon = satellite.longitude + offsetDegrees;
    const lat = satellite.latitude + Math.sin((i / samples) * Math.PI * 2) * 5;

    positions.push(
      Cesium.Cartesian3.fromDegrees(lon, lat, satellite.altitude)
    );
  }

  return positions;
}

/**
 * Get color based on satellite type
 */
export function getSatelliteColor(type: Satellite["type"]): Cesium.Color {
  switch (type) {
    case "iss":
      return Cesium.Color.fromCssColorString("#00ff00"); // Green
    case "space-station":
      return Cesium.Color.fromCssColorString("#00ffff"); // Cyan
    case "satellite":
      return Cesium.Color.fromCssColorString("#ffff00"); // Yellow
    default:
      return Cesium.Color.WHITE;
  }
}

/**
 * Format satellite data for display
 */
export function formatSatelliteInfo(satellite: Satellite): string {
  return `
${satellite.name}
Position: ${satellite.latitude.toFixed(4)}°, ${satellite.longitude.toFixed(4)}°
Altitude: ${(satellite.altitude / 1000).toFixed(1)} km
Velocity: ${satellite.velocity.toFixed(0)} km/h
Updated: ${satellite.timestamp.toLocaleTimeString()}
  `.trim();
}
