import { index, route, type RouteConfig } from "@react-router/dev/routes";

const homeRoutes = [index("routes/home.tsx")] satisfies RouteConfig;

const apiRoutes = [
  route("/api/countries/list", "routes/api.countries.list.ts"),
  route("/api/covid", "routes/api.covid.ts"),
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
  route("/api/games/realitea/daily", "routes/api.games.realitea.daily.ts"),
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
  route("/games/cards", "routes/games/cards.tsx"),
  route("/games/tetris", "routes/games/tetris.tsx"),
  route("/games/realitea", "routes/games/realitea.tsx"),
  route("/business-tools", "routes/business-tools/index.tsx"),
  route("/business-tools/marketing", "routes/business-tools/marketing.tsx"),
] satisfies RouteConfig;

const experimentRoutes = [
  route("/experiments/glass", "routes/experiments.glass.tsx"),
  route("/experiments/infinite-scroll", "routes/infinite-scroll/index.tsx"),
  route("/experiments/threegl-web-request", "routes/experiments.threegl-web-request.tsx"),
  route("/experiments/threegl-image-gallery", "routes/experiments.threegl-image-gallery.tsx"),
] satisfies RouteConfig;

const challengeRoutes = [
  route("/challenges/anagrams", "routes/challenges.anagrams.tsx"),
  route("/challenges/click-therapeutics", "routes/challenges.click-therapeutics.tsx"),
  route("/challenges/cloudmargin", "routes/challenges.cloudmargin.tsx"),
  route("/challenges/daily-mail", "routes/challenges.daily-mail.tsx"),
  route("/challenges/fee-or-upfront", "routes/challenges.fee-or-upfront.tsx"),
  route("/challenges/prime-countdown", "routes/challenges.prime-countdown.tsx"),
  route("/challenges/growth-street", "routes/challenges.growth-street.tsx"),
  route("/challenges/interview-cake", "routes/challenges.interview-cake.tsx"),
  route("/challenges/kensho", "routes/challenges.kensho.tsx"),
  route("/challenges/peterson-academy", "routes/challenges.peterson-academy.tsx"),
  route("/challenges/qubit", "routes/challenges.qubit.tsx"),
  route("/challenges/quilt", "routes/challenges.quilt.tsx"),
  route("/challenges/medicare", "routes/challenges.medicare.tsx"),
  route("/challenges/red-badger", "routes/challenges.red-badger.tsx"),
  route("/challenges/vendigo", "routes/challenges.vendigo.tsx"),
] satisfies RouteConfig;

export default [
  ...homeRoutes,
  ...apiRoutes,
  ...featureRoutes,
  ...experimentRoutes,
  ...challengeRoutes,
] satisfies RouteConfig;
