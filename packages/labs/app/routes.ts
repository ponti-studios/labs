import { index, layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

const homeRoutes = [index("routes/home.tsx")] satisfies RouteConfig;

const studioRoutes = [
  route("/services", "routes/services.tsx"),
  route("/work", "routes/work.tsx"),
  route("/projects", "routes/projects.tsx"),
  route("/projects/:slug", "routes/projects.$slug.tsx"),
  route("/manifesto", "routes/manifesto.tsx"),
  route("/faq", "routes/faq.tsx"),
  route("/work/:slug", "routes/work.$slug.tsx"),
] satisfies RouteConfig;

const apiRoutes = [
  route("/api/countries/list", "routes/api.countries.list.ts"),
  route("/api/covid", "routes/api.covid.ts"),
  route("/api/covid/dashboard", "routes/api.covid.dashboard.ts"),
  route("/api/covid/analytics/dashboard", "routes/api.covid.analytics.dashboard.ts"),
  route(
    "/api/covid/analytics/outlier-detection",
    "routes/api.covid.analytics.outlier-detection.ts",
  ),
  route("/api/covid/analytics/pandemic-waves", "routes/api.covid.analytics.pandemic-waves.ts"),
  route(
    "/api/covid/analytics/seasonal-patterns",
    "routes/api.covid.analytics.seasonal-patterns.ts",
  ),
  route(
    "/api/covid/analytics/vaccination-effectiveness",
    "routes/api.covid.analytics.vaccination-effectiveness.ts",
  ),
  route("/api/gen/image", "routes/api.gen.image.ts"),
  route("/api/gen/predict", "routes/api.gen.predict.ts"),
  route("/api/games/what/attempt", "routes/api.games.what.attempt.ts"),
  route("/api/games/what/guess", "routes/api.games.what.guess.ts"),
  route("/api/games/what/games", "routes/api.games.what.games.ts"),
  route("/api/games/what/health", "routes/api.games.what.health.ts"),
  route("/api/games/what/puzzle", "routes/api.games.what.puzzle.ts"),
  route("/api/games/what/puzzle/:date", "routes/api.games.what.puzzle.$date.ts"),
  route("/api/games/what/history", "routes/api.games.what.history.ts"),
  // Keep old API URLs working for installed clients and shared links. These
  // point at the same handlers so POST semantics are preserved.
  route("/api/games/realitea/attempt", "routes/api.games.realitea.attempt.ts"),
  route("/api/games/realitea/guess", "routes/api.games.realitea.guess.ts"),
  route("/api/games/realitea/games", "routes/api.games.realitea.games.ts"),
  route("/api/games/realitea/health", "routes/api.games.realitea.health.ts"),
  route("/api/search", "routes/api.search.ts"),
  route("/api/tarot", "routes/api.tarot.ts"),
  route("/api/words/validate", "routes/api.words.validate.ts"),
] satisfies RouteConfig;

const featureRoutes = [
  route("/gen/image", "routes/gen.image.tsx"),
  route("/tarot", "routes/tarot.tsx"),
  route("/covid", "routes/covid.tsx"),
  route("/covid/:countryCode", "routes/covid.$countryCode.layout.tsx", [
    index("routes/covid.$countryCode.tsx"),
    route("pandemic-waves", "routes/covid.$countryCode.pandemic-waves.tsx"),
    route("vaccination-effectiveness", "routes/covid.$countryCode.vaccination-effectiveness.tsx"),
    route("seasonal-patterns", "routes/covid.$countryCode.seasonal-patterns.tsx"),
    route("outlier-detection", "routes/covid.$countryCode.outlier-detection.tsx"),
  ]),

  // Games
  // `/games/what` player-facing UI now lives in the standalone `what` app
  // (own repo, own deploy) — Labs keeps only the admin panel, generation
  // pipeline, and the API surface `what` calls remotely. See WHAT_APP_ORIGIN.
  route("/games/realitea", "routes/redirects/what.ts"),
  route("/games/realitea/*", "routes/redirects/what-splat.ts"),
  ...prefix("/games/what", [
    // Keep bookmarks and shared links working while the player UI is served
    // by the standalone app. The admin branch below remains on Labs.
    index("routes/redirects/what-player.ts"),
    route("*", "routes/redirects/what-player-splat.ts"),
    layout("routes/games/what/brand.tsx", [
      route("admin", "routes/games/what/admin/layout.tsx", [
        index("routes/games/what/admin/route.tsx"),
        route("inventory", "routes/games/what/admin/inventory.tsx"),
        route("generate", "routes/games/what/admin/generate.tsx"),
        route("generate/events", "routes/games/what/admin/generate.events.ts"),
        route("generate/stream", "routes/games/what/admin/generate.stream.ts"),
        route("preview", "routes/games/what/admin/preview-redirect.ts"),
        route("preview/events", "routes/games/what/admin/preview.events.ts"),
        route("topics", "routes/games/what/admin/topics.tsx"),
        route("topics/:slug", "routes/games/what/admin/topics.$slug.tsx"),
        route("generations/:id", "routes/games/what/admin/generations.$id.tsx"),
        route("dates/:date", "routes/games/what/admin/dates.$date.tsx"),
        route("costs", "routes/games/what/admin/costs.tsx"),
      ]),
    ]),
  ]),
  route("/games/cards", "routes/games/cards.tsx"),
  route("/games/tetris", "routes/games/tetris.tsx"),
] satisfies RouteConfig;

const experimentRoutes = [
  route("/experiments/calendar", "routes/experiments.calendar.tsx"),
  route("/experiments/theatre-management", "routes/theatre-management/route.tsx"),

  // TODO Experiments
  route("/experiments/glass", "routes/experiments.glass.tsx"),
  route("/experiments/infinite-scroll", "routes/infinite-scroll/route.tsx"),
  route("/experiments/threegl-ai-explainer", "routes/experiments.threegl-ai-explainer.tsx"),
  route("/experiments/llm-interface", "routes/experiments.llm-interface.tsx"),

  // TODO Challenges
  route("/challenges/anagrams", "routes/challenges.anagrams.tsx"),
  route("/challenges/click-therapeutics", "routes/challenges.click-therapeutics.tsx"),
  route("/challenges/cloudmargin", "routes/challenges.cloudmargin.tsx"),
  route("/challenges/fee-or-upfront", "routes/challenges.fee-or-upfront.tsx"),
  route("/challenges/cloud-pricing", "routes/challenges.cloud-pricing.tsx"),
  route("/challenges/prime-countdown", "routes/challenges.prime-countdown.tsx"),
  route("/challenges/search-studio", "routes/challenges.search-studio.tsx"),
  route("/challenges/peterson-academy", "routes/challenges.peterson-academy.tsx"),
  route("/challenges/red-badger", "routes/challenges.red-badger.tsx"),
  route("/health/medication", "routes/health/medication.tsx"),
  route("/health/api/medication-schedule", "routes/health/api.medication-schedule.ts"),
] satisfies RouteConfig;

export default [
  ...homeRoutes,
  ...studioRoutes,
  ...apiRoutes,
  ...featureRoutes,
  ...experimentRoutes,
] satisfies RouteConfig;
