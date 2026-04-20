import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/api/symptom", "routes/api.symptom.ts"),
] satisfies RouteConfig;
