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
  // Orbital parameters for smooth animation
  orbitalPeriod?: number; // minutes
  inclination?: number; // degrees
  rightAscension?: number; // degrees
}

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
      orbitalPeriod: 92.68, // ISS orbital period in minutes
      inclination: 51.64, // ISS inclination
    };
  } catch (error) {
    console.error("Error fetching ISS position:", error);
    return null;
  }
}

/**
 * Calculate a smooth orbit path based on current position and orbital parameters
 * This creates a proper orbital ellipse that the satellite will glide along
 */
export function calculateSmoothOrbitPath(
  satellite: Satellite,
  samples: number = 120, // 120 points = 2 minutes between points for 4-hour orbit
): Cesium.Cartesian3[] {
  const positions: Cesium.Cartesian3[] = [];
  
  // Use satellite's orbital period or default to 90 minutes (typical LEO)
  const periodMinutes = satellite.orbitalPeriod || 90;
  const periodSeconds = periodMinutes * 60;
  
  // Calculate orbital elements from current position
  const inclinationRad = Cesium.Math.toRadians(satellite.inclination || 51.6);
  // Generate positions for one complete orbit
  for (let i = 0; i <= samples; i++) {
    // Time offset from now (0 to period)
    const timeOffsetSeconds = (i / samples) * periodSeconds;
    const fraction = i / samples;
    
    // Calculate mean anomaly (position in orbit)
    const meanAnomaly = fraction * 2 * Math.PI;
    
    // Approximate orbital motion using spherical trigonometry
    // This creates a smoother, more realistic orbit than simple linear interpolation
    
    // Calculate change in longitude based on orbital period
    // Earth rotates ~15 degrees per hour, satellite orbits ~360 degrees per period
    const earthRotationOffset = (timeOffsetSeconds / 3600) * 15; // degrees
    const orbitalProgress = fraction * 360; // degrees
    
    // New longitude accounting for both satellite motion and Earth rotation
    let newLongitude = satellite.longitude + orbitalProgress - earthRotationOffset;
    newLongitude = ((newLongitude + 180) % 360) - 180; // Normalize to -180 to 180
    
    // Calculate latitude variation based on inclination
    // Satellite oscillates between +inclination and -inclination
    const latitudeVariation = Math.sin(meanAnomaly) * Cesium.Math.toDegrees(inclinationRad);
    let newLatitude = latitudeVariation;
    
    // Add some altitude variation (elliptical orbit approximation)
    // Most satellites have nearly circular orbits, small variation
    const altitudeVariation = Math.cos(meanAnomaly * 2) * 5000; // ±5km variation
    const newAltitude = satellite.altitude + altitudeVariation;
    
    positions.push(Cesium.Cartesian3.fromDegrees(newLongitude, newLatitude, newAltitude));
  }

  return positions;
}

/**
 * Calculate position at a specific time along the orbit
 * Used for smooth animation between updates
 */
export function calculatePositionAtTime(
  satellite: Satellite,
  timeOffsetSeconds: number
): { longitude: number; latitude: number; altitude: number } {
  const periodMinutes = satellite.orbitalPeriod || 90;
  const periodSeconds = periodMinutes * 60;
  const inclinationRad = Cesium.Math.toRadians(satellite.inclination || 51.6);
  
  // Normalize time to orbit period
  const normalizedTime = (timeOffsetSeconds % periodSeconds) / periodSeconds;
  const meanAnomaly = normalizedTime * 2 * Math.PI;
  
  // Earth rotation offset
  const earthRotationOffset = (timeOffsetSeconds / 3600) * 15;
  const orbitalProgress = normalizedTime * 360;
  
  // Calculate new position
  let longitude = satellite.longitude + orbitalProgress - earthRotationOffset;
  longitude = ((longitude + 180) % 360) - 180;
  
  const latitude = Math.sin(meanAnomaly) * Cesium.Math.toDegrees(inclinationRad);
  const altitudeVariation = Math.cos(meanAnomaly * 2) * 5000;
  const altitude = satellite.altitude + altitudeVariation;
  
  return { longitude, latitude, altitude };
}

/**
 * Fetch positions for all tracked satellites
 */
export async function fetchAllSatellites(): Promise<Satellite[]> {
  const satellites: Satellite[] = [];

  // Always fetch ISS first
  const iss = await fetchISSPosition();
  if (iss) satellites.push(iss);

  // Add other satellites with calculated positions based on orbital mechanics
  const now = new Date();
  
  // Tiangong - offset from ISS by ~30 minutes in orbit
  const tiangongOffset = 30 * 60; // 30 minutes in seconds
  const tiangongPos = calculatePositionAtTime(
    {
      id: "iss",
      name: "ISS",
      type: "iss",
      latitude: iss?.latitude || 0,
      longitude: iss?.longitude || 0,
      altitude: 400000,
      velocity: 27600,
      timestamp: now,
      orbitalPeriod: 91.5,
      inclination: 41.5,
    },
    tiangongOffset
  );
  
  satellites.push({
    id: "tiangong",
    name: "Tiangong Space Station",
    type: "space-station",
    latitude: tiangongPos.latitude,
    longitude: tiangongPos.longitude,
    altitude: tiangongPos.altitude,
    velocity: 27600,
    timestamp: now,
    orbitalPeriod: 91.5,
    inclination: 41.5,
  });

  // Hubble - different orbit
  const hubbleOffset = 45 * 60; // 45 minutes offset
  const hubblePos = calculatePositionAtTime(
    {
      id: "iss",
      name: "ISS",
      type: "iss",
      latitude: iss?.latitude || 0,
      longitude: iss?.longitude || 0,
      altitude: 540000,
      velocity: 28000,
      timestamp: now,
      orbitalPeriod: 96.5,
      inclination: 28.5,
    },
    hubbleOffset
  );
  
  satellites.push({
    id: "hubble",
    name: "Hubble Space Telescope",
    type: "satellite",
    latitude: hubblePos.latitude,
    longitude: hubblePos.longitude,
    altitude: hubblePos.altitude,
    velocity: 28000,
    timestamp: now,
    orbitalPeriod: 96.5,
    inclination: 28.5,
  });

  return satellites;
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
Period: ${satellite.orbitalPeriod?.toFixed(1)} min
Updated: ${satellite.timestamp.toLocaleTimeString()}
  `.trim();
}
