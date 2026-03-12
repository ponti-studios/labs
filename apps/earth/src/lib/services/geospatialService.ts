/**
 * Geospatial Service
 * 
 * Handles geocoding and directions using free APIs:
 * - Nominatim for geocoding (OpenStreetMap)
 * - OSRM for directions
 * 
 * No API key required
 */

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface DirectionsResult {
  summary: {
    from: string;
    to: string;
    distance: string;
    duration: string;
  };
  steps: Array<{
    instruction: string;
    distance: string;
  }>;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface OSRMRoute {
  distance: number;
  duration: number;
  legs: Array<{
    distance: number;
    duration: number;
    steps: Array<{
      name: string;
      distance: number;
    }>;
  }>;
}

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

const formatDistance = (meters: number): string => {
  const km = meters / 1000;
  if (km > 1) {
    return `${km.toFixed(1)} km`;
  }
  return `${meters.toFixed(0)} m`;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Geocode a location address using Nominatim
 */
export const geocodeLocation = async (address: string): Promise<Location[]> => {
  try {
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '10',
    });

    const response = await fetch(`${NOMINATIM_API}/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const results = (await response.json()) as NominatimResult[];
    
    if (!results.length) {
      throw new Error(`No results found for "${address}"`);
    }

    return results.map((result) => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    }));
  } catch (error) {
    throw new Error(`Geocoding error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get directions between two locations using OSRM
 */
export const getDirections = async (
  origin: string,
  destination: string,
): Promise<DirectionsResult> => {
  try {
    // First geocode both locations
    const [originResults, destResults] = await Promise.all([
      geocodeLocation(origin),
      geocodeLocation(destination),
    ]);

    if (!originResults.length || !destResults.length) {
      throw new Error('Could not geocode origin or destination');
    }

    const originCoord = originResults[0];
    const destCoord = destResults[0];

    // Request directions from OSRM
    const coordString = `${originCoord.lng},${originCoord.lat};${destCoord.lng},${destCoord.lat}`;
    const params = new URLSearchParams({
      steps: 'true',
      geometries: 'geojson',
      overview: 'full',
      alternatives: 'false',
    });

    const response = await fetch(`${OSRM_API}/${coordString}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Directions failed: ${response.statusText}`);
    }

    const data = (await response.json()) as { routes?: OSRMRoute[] };
    
    if (!data.routes || !data.routes.length) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    const totalDistance = route.distance;
    const totalDuration = route.duration;

    // Flatten all steps from all legs
    const allSteps = route.legs.flatMap((leg) =>
      leg.steps.map((step) => ({
        instruction: step.name || 'Continue',
        distance: formatDistance(step.distance),
      }))
    );

    return {
      summary: {
        from: originCoord.address,
        to: destCoord.address,
        distance: formatDistance(totalDistance),
        duration: formatDuration(totalDuration),
      },
      steps: allSteps,
    };
  } catch (error) {
    throw new Error(
      `Directions error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
