import { index, route, type RouteConfig } from "@react-router/dev/routes";

const homeRoutes = [index("routes/home.tsx")] satisfies RouteConfig;

const labRoutes = [
  route("/svg-glass-test", "routes/svg-glass-test.tsx"),
  route("/infinite-header", "routes/infinite-header/infinite-header.tsx"),
] satisfies RouteConfig;

const apiRoutes = [
  route("/api/director/generate", "routes/api.director.generate.ts"),
  route("/api/games/realitea/daily", "routes/api.games.realitea.daily.ts"),
  route("/api/games/realitea/generate", "routes/api.games.realitea.generate.ts"),
  route("/api/tarot", "routes/api.tarot.ts"),
  route("/api/words/validate", "routes/api.words.validate.ts"),
] satisfies RouteConfig;

const coronaRoutes = [
  index("routes/corona.$countryCode.tsx"),
  route("pandemic-waves", "routes/corona.$countryCode.pandemic-waves.tsx"),
  route("vaccination-effectiveness", "routes/corona.$countryCode.vaccination-effectiveness.tsx"),
  route("seasonal-patterns", "routes/corona.$countryCode.seasonal-patterns.tsx"),
  route("outlier-detection", "routes/corona.$countryCode.outlier-detection.tsx"),
] satisfies RouteConfig;

const featureRoutes = [
  route("/tarot", "routes/tarot.tsx"),
  route("/corona", "routes/corona.tsx"),
  route("/corona/:countryCode", "routes/corona.$countryCode.layout.tsx", coronaRoutes),
  route("/games/tetris", "routes/games/tetris.tsx"),
  route("/games/realitea", "routes/games/realitea.tsx"),
  route("/business-tools", "routes/business-tools/index.tsx"),
  route("/business-tools/marketing", "routes/business-tools/marketing.tsx"),
] satisfies RouteConfig;

const experimentRoutes = [
  route("/experiments", "routes/experiments.tsx"),
  route("/experiments/threegl-web-request", "routes/experiments.threegl-web-request.tsx"),
  route("/experiments/threegl-image-gallery", "routes/experiments.threegl-image-gallery.tsx"),
] satisfies RouteConfig;

const challengeRoutes = [
  route("/challenges/cards", "routes/challenges.cards.tsx"),
  route("/challenges/chart-hop", "routes/challenges.chart-hop.tsx"),
  route("/challenges/click-therapeutics", "routes/challenges.click-therapeutics.tsx"),
  route("/challenges/cloudmargin", "routes/challenges.cloudmargin.tsx"),
  route("/challenges/daily-mail", "routes/challenges.daily-mail.tsx"),
  route("/challenges/goldman-sachs", "routes/challenges.goldman-sachs.tsx"),
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
  ...labRoutes,
  ...apiRoutes,
  ...featureRoutes,
  ...experimentRoutes,
  ...challengeRoutes,
] satisfies RouteConfig;
