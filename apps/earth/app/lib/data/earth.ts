import type { Satellite, TflCamera } from "../signals/earth";

export const MOCK_SATELLITES: Satellite[] = [
  {
    id: "iss",
    name: "Intl. Space Station",
    type: "iss",
    latitude: 51.5074,
    longitude: -0.1276,
    altitude: 420,
    velocity: 27600,
    timestamp: new Date(),
  },
  {
    id: "tiangong",
    name: "Tiangong Space Station",
    type: "space-station",
    latitude: 40.7128,
    longitude: -74.006,
    altitude: 390,
    velocity: 27500,
    timestamp: new Date(),
  },
  {
    id: "hubble",
    name: "Hubble Space Telescope",
    type: "satellite",
    latitude: 34.0522,
    longitude: -118.2437,
    altitude: 540,
    velocity: 27400,
    timestamp: new Date(),
  },
];

export const MOCK_TFL_CAMERAS: TflCamera[] = [
  {
    id: "cam001",
    available: "true",
    commonName: "Tower Bridge",
    videoUrl: "",
    view: "north",
    imageUrl: "",
    lat: 51.5055,
    lng: -0.0754,
  },
  {
    id: "cam002",
    available: "true",
    commonName: "Oxford Circus",
    videoUrl: "",
    view: "south",
    imageUrl: "",
    lat: 51.5152,
    lng: -0.1419,
  },
  {
    id: "cam003",
    available: "false",
    commonName: "Piccadilly Circus",
    videoUrl: "",
    view: "east",
    imageUrl: "",
    lat: 51.51,
    lng: -0.1348,
  },
  {
    id: "cam004",
    available: "true",
    commonName: "Westminster",
    videoUrl: "",
    view: "west",
    imageUrl: "",
    lat: 51.501,
    lng: -0.1246,
  },
  {
    id: "cam005",
    available: "true",
    commonName: "London Bridge",
    videoUrl: "",
    view: "north",
    imageUrl: "",
    lat: 51.5079,
    lng: -0.0877,
  },
];

export async function fetchMockSatellites(): Promise<Satellite[]> {
  return MOCK_SATELLITES;
}

export async function fetchMockTflCameras(): Promise<TflCamera[]> {
  return MOCK_TFL_CAMERAS;
}
