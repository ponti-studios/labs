import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("covid", "routes/covid.tsx"),
  route("covid/:iso3", "routes/covid.$iso3.tsx"),
  route("satellites", "routes/satellites.tsx"),
  route("satellites/:satelliteId", "routes/satellites.$id.tsx"),
  route("tfl", "routes/tfl.tsx"),
  route("tfl/:cameraId", "routes/tfl.$cameraId.tsx"),
  route("geospatial", "routes/geospatial.tsx"),
] satisfies RouteConfig;
