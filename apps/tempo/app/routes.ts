import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/tasks", "routes/tasks.tsx"),
  route("/tasks/:projectId", "routes/tasks.$projectId.tsx"),
  route("/projects", "routes/projects.tsx"),
  route("/api/todos", "routes/api.todos.ts"),
  route("/api/projects", "routes/api.projects.ts"),
  route("/api/ai", "routes/api.ai.ts"),
  route("/api/voice", "routes/api.voice.ts"),
] satisfies RouteConfig;
