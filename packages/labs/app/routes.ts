import { index, route, type RouteConfig } from "@react-router/dev/routes";

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
  route("/api/search", "routes/api.search.ts"),
  route("/api/tarot", "routes/api.tarot.ts"),
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
  // The player UI and game administration now live in the standalone `what`
  // app. Keep only the original root bookmark redirect.
  route("/games/realitea", "routes/redirects/game.ts"),
  route("/games/what", "routes/redirects/game.ts"),
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
