import { useQuery } from "@tanstack/react-query";
import type { Satellite, TflCamera } from "../signals/earth";
import { fetchMockSatellites } from "../data/earth";

async function fetchTflCameras(): Promise<TflCamera[]> {
  try {
    const response = await fetch("/api/tfl");
    if (!response.ok) {
      throw new Error("Failed to fetch TFL cameras");
    }
    const data = await response.json();
    return data.cameras || [];
  } catch (error) {
    console.error("Error fetching TFL cameras:", error);
    // Fall back to empty array on error
    return [];
  }
}

export function useSatellites() {
  return useQuery({
    queryKey: ["satellites"],
    queryFn: fetchMockSatellites,
  });
}

export function useTflCameras() {
  return useQuery({
    queryKey: ["tfl", "cameras"],
    queryFn: fetchTflCameras,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export type { Satellite, TflCamera };
