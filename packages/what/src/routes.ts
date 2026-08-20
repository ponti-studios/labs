import { index, prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/topic-redirect.tsx"),
  route("/api/games/game/attempt", "routes/api.games.game.attempt.ts"),
  route("/api/games/game/games", "routes/api.games.game.games.ts"),
  route("/api/games/game/guess", "routes/api.games.game.guess.ts"),
  route("/api/games/game/health", "routes/api.games.game.health.ts"),
  route("/api/games/game/history", "routes/api.games.game.history.ts"),
  route("/api/games/game/puzzle", "routes/api.games.game.puzzle.ts"),
  route("/api/games/game/puzzle/:date", "routes/api.games.game.puzzle.$date.ts"),
  route("/api/words/validate", "routes/api.words.validate.ts"),
  ...prefix("/games/game", [
    index("routes/games-game-redirect.tsx"),
    route("admin", "routes/games/game/admin/layout.tsx", [
      index("routes/games/game/admin/route.tsx"),
      route("inventory", "routes/games/game/admin/inventory.tsx"),
      route("generate", "routes/games/game/admin/generate.tsx"),
      route("generate/events", "routes/games/game/admin/generate.events.ts"),
      route("generate/stream", "routes/games/game/admin/generate.stream.ts"),
      route("preview", "routes/games/game/admin/preview-redirect.ts"),
      route("preview/events", "routes/games/game/admin/preview.events.ts"),
      route("topics", "routes/games/game/admin/topics.tsx"),
      route("topics/:slug", "routes/games/game/admin/topics.$slug.tsx"),
      route("generations/:id", "routes/games/game/admin/generations.$id.tsx"),
      route("dates/:date", "routes/games/game/admin/dates.$date.tsx"),
      route("costs", "routes/games/game/admin/costs.tsx"),
    ]),
  ]),
  route("/:topic/history", "routes/history.tsx"),
  route("/:topic", "routes/today.tsx"),
  route("/:topic/:dateKey", "routes/dated-puzzle.tsx"),
] satisfies RouteConfig;
