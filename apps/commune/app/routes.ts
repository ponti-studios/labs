import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/all-cases.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/case/create", "routes/case/create.tsx"),
  route("/case/:id", "routes/case/[id]/page.tsx"),
  route("/case/:id/verdict", "routes/case/[id]/verdict.tsx"),
  route("/time-together", "routes/time-together.tsx"),
] satisfies RouteConfig;
