import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/all-cases.tsx"),
  route("/case/create", "routes/case/create.tsx"),
  route("/case/:id", "routes/case/[id]/page.tsx"),
  route("/api/cases", "routes/api/cases.server.ts"),
  route("/api/upload", "routes/api/upload.server.ts"),
] satisfies RouteConfig;
