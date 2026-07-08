import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/symptoms", "routes/symptoms.tsx"),
  route("/symptoms/:id", "routes/symptoms.$id.tsx"),
  route("/appointments", "routes/appointments.tsx"),
  route("/appointments/new", "routes/appointments.new.tsx"),
  route("/hospitals", "routes/hospitals.tsx"),
  route("/medication", "routes/medication.tsx"),
  route("/medicare", "routes/medicare.tsx"),
  route("/api/symptom", "routes/api.symptom.ts"),
  route("/api/medication-schedule", "routes/api.medication-schedule.ts"),
] satisfies RouteConfig;
