import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/symptoms", "routes/symptoms.tsx"),
  route("/symptoms/:id", "routes/symptoms.$id.tsx"),
  route("/appointments", "routes/appointments.tsx"),
  route("/appointments/new", "routes/appointments.new.tsx"),
  route("/hospitals", "routes/hospitals.tsx"),
  route("/api/symptom", "routes/api.symptom.ts"),
] satisfies RouteConfig;
