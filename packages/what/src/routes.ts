import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/topic-redirect.tsx"),
  route("/api/games/what/guess", "routes/api.games.what.guess.ts"),
  route("/:topic/history", "routes/history.tsx"),
  route("/:topic", "routes/today.tsx"),
  route("/:topic/:dateKey", "routes/dated-puzzle.tsx"),
] satisfies RouteConfig;
