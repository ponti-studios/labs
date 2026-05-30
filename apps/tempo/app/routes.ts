import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/tasks", "routes/tasks.tsx"),
  route("/api/todos", "routes/api.todos.ts"),
  route("/api/tags", "routes/api.tags.ts"),
  route("/api/ai", "routes/api.ai.ts"),
  route("/api/voice", "routes/api.voice.ts"),
] satisfies RouteConfig;
