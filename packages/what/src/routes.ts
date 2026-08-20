import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/topic-redirect.tsx"),
  route("/api/games/game/guess", "routes/api.games.game.guess.ts"),
  route("/:topic/history", "routes/history.tsx"),
  route("/:topic", "routes/today.tsx"),
  route("/:topic/:dateKey", "routes/dated-puzzle.tsx"),
] satisfies RouteConfig;
