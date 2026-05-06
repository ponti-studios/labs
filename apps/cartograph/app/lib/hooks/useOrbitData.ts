import { useQuery } from "@tanstack/react-query";
import type { Satellite, TflCamera } from "../signals/earth";
import { fetchMockSatellites, fetchMockTflCameras } from "../data/earth";

export function useSatellites() {
  return useQuery({
    queryKey: ["satellites"],
    queryFn: fetchMockSatellites,
  });
}

export function useTflCameras() {
  return useQuery({
    queryKey: ["tfl", "cameras"],
    queryFn: fetchMockTflCameras,
  });
}

export type { Satellite, TflCamera };
