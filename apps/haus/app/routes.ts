import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/services", "routes/services.tsx"),
  route("/support", "routes/support.tsx"),
  route("/privacy", "routes/privacy.tsx"),
  route("/api/health", "routes/api.health.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
