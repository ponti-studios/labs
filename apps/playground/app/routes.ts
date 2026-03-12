import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/border-linear-gradient", "routes/border-linear-gradient.tsx"),
  route("/svg-glass-test", "routes/svg-glass-test.tsx"),
  route("/google-maps", "routes/google-maps.tsx"),
  route("/tasks", "routes/tasks.tsx"),
  route("/tasks/search", "routes/tasks.search.tsx"),
  route("/tasks/:projectId", "routes/tasks.$projectId.tsx"),
  route("/projects", "routes/projects.tsx"),

  // TFL cameras
  route("/api/tfl", "routes/api.tfl.ts"),
  route("/tfl", "routes/tfl.tsx"),
  route("/infinite-header", "routes/infinite-header/infinite-header.tsx"),

  // Tarot Spread Reader
  route("/tarot", "routes/tarot.tsx"),

  // API routes
  route("/api/search", "routes/api.search.ts"),
  route("/api/todos", "routes/api.todos.ts"),
  route("/api/projects", "routes/api.projects.ts"),
] satisfies RouteConfig;
