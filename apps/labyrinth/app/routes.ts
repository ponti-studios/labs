import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/svg-glass-test", "routes/svg-glass-test.tsx"),

  route("/api/director/generate", "routes/api.director.generate.ts"),
  route("/infinite-header", "routes/infinite-header/infinite-header.tsx"),

  // Other
  route("/tarot", "routes/tarot.tsx"),
  route("/api/tarot", "routes/api.tarot.ts"),
  route("/corona", "routes/corona.tsx"),
  route("/corona/:countryCode", "routes/corona.$countryCode.layout.tsx", [
    index("routes/corona.$countryCode.tsx"),
    route("pandemic-waves", "routes/corona.$countryCode.pandemic-waves.tsx"),
    route("vaccination-effectiveness", "routes/corona.$countryCode.vaccination-effectiveness.tsx"),
    route("seasonal-patterns", "routes/corona.$countryCode.seasonal-patterns.tsx"),
    route("outlier-detection", "routes/corona.$countryCode.outlier-detection.tsx"),
  ]),
  route("/games/wordle/rhobh", "routes/games/rhobh-wordle.tsx"),

  // Experiments
  route("/experiments", "routes/experiments.tsx"),
  route("/experiments/threegl-web-request", "routes/experiments.threegl-web-request.tsx"),
  route("/experiments/threegl-image-gallery", "routes/experiments.threegl-image-gallery.tsx"),

  // Coding Challenges
  route("/challenges/algorithms", "routes/Algorithms.jsx"),
  route("/challenges/cards", "routes/Cards.jsx"),
  route("/challenges/chart-hop", "routes/ChartHop.jsx"),
  route("/challenges/click-therapeutics", "routes/ClickTherapeutics.jsx"),
  route("/challenges/cloudmargin", "routes/CloudMargin.jsx"),
  route("/challenges/daily-mail", "routes/DailyMail.jsx"),
  route("/challenges/goldman-sachs", "routes/GoldmanSachs.jsx"),
  route("/challenges/growth-street", "routes/GrowthStreet.jsx"),
  route("/challenges/interview-cake", "routes/InterviewCake.jsx"),
  route("/challenges/kensho", "routes/Kensho.jsx"),
  route("/challenges/peterson-academy", "routes/PetersonAcademy.jsx"),
  route("/challenges/qubit", "routes/Qubit.jsx"),
  route("/challenges/quilt", "routes/Quilt.jsx"),
  route("/challenges/red-badger", "routes/RedBadger.tsx"),
  route("/challenges/vendigo", "routes/Vendigo.jsx"),
] satisfies RouteConfig;
