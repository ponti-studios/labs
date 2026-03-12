import { signal } from "@preact/signals-react";

export type DockTab = "covid" | "satellites" | "tfl" | "geospatial";

export type Route =
  | { type: "tab"; tab: DockTab }
  | { type: "covid-country"; tab: "covid"; iso3: string }
  | { type: "tfl-camera"; tab: "tfl"; cameraId: string }
  | { type: "satellite"; tab: "satellites"; satelliteId: string };

// Types
export interface CovidCountry {
  updated: number;
  country: string;
  countryInfo: {
    _id: number | null;
    iso2: string | null;
    iso3: string;
    lat: number;
    long: number;
    flag: string;
  };
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  todayRecovered: number;
  active: number;
  critical: number;
}

export interface TflCamera {
  id: string;
  available: string;
  commonName: string;
  videoUrl: string;
  view: string;
  imageUrl: string;
  lat: number;
  lng: number;
}

export interface Satellite {
  id: string;
  name: string;
  type: "iss" | "space-station" | "satellite";
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: Date;
}

// Cesium Viewer - persists across route changes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cesiumViewer = signal<any>(null);

// Active Tab
export const activeTab = signal<DockTab>("covid");

// Selection States
export const selectedCountryIso3 = signal<string | null>(null);
export const selectedCameraId = signal<string | null>(null);
export const selectedSatelliteId = signal<string | null>(null);

// Tracking States
export const satelliteTracking = signal(false);
export const covidPointsAdded = signal(false);

// Data States
export const covidCountries = signal<CovidCountry[]>([]);
export const tflCameras = signal<TflCamera[]>([]);
export const satellites = signal<Satellite[]>([]);

// Loading States
export const loadingCovid = signal(true);
export const loadingTfl = signal(true);
export const loadingSatellites = signal(true);

// Current Route
export const currentRoute = signal<Route>({ type: "tab", tab: "covid" });

// Helper to navigate (updates signals)
export function navigateTo(route: Route) {
  currentRoute.value = route;
  activeTab.value = route.tab;

  if (route.type === "covid-country") {
    selectedCountryIso3.value = route.iso3;
  } else {
    selectedCountryIso3.value = null;
  }

  if (route.type === "tfl-camera") {
    selectedCameraId.value = route.cameraId;
  } else {
    selectedCameraId.value = null;
  }

  if (route.type === "satellite") {
    selectedSatelliteId.value = route.satelliteId;
  } else {
    selectedSatelliteId.value = null;
  }
}

// Initialize from URL on app load
export function initializeFromUrl(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) {
    navigateTo({ type: "tab", tab: "covid" });
    return;
  }

  const tab = parts[0] as DockTab;

  if (!["covid", "satellites", "tfl", "geospatial"].includes(tab)) {
    navigateTo({ type: "tab", tab: "covid" });
    return;
  }

  if (parts.length >= 2) {
    const id = parts[1];

    if (tab === "covid") {
      navigateTo({ type: "covid-country", tab: "covid", iso3: id });
    } else if (tab === "tfl") {
      navigateTo({ type: "tfl-camera", tab: "tfl", cameraId: id });
    } else if (tab === "satellites") {
      navigateTo({ type: "satellite", tab: "satellites", satelliteId: id });
    }
  } else {
    navigateTo({ type: "tab", tab });
  }
}
