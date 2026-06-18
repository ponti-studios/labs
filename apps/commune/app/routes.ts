import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/all-cases.tsx"),
  route("/case/create", "routes/case/create.tsx"),
  route("/case/:id", "routes/case/[id]/page.tsx"),
  route("/api/health", "routes/api/health.ts"),
] satisfies RouteConfig;
