// Shared Earth data types.
// This file intentionally contains no runtime signals.

export type DockTab = "covid" | "satellites" | "tfl" | "geospatial";

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
