import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/border-linear-gradient", "routes/border-linear-gradient.tsx"),
  route("/svg-glass-test", "routes/svg-glass-test.tsx"),

  // TFL cameras
  route("/api/tfl", "routes/api.tfl.ts"),
  route("/api/director/generate", "routes/api.director.generate.ts"),
  route("/tfl", "routes/tfl.tsx"),
  route("/infinite-header", "routes/infinite-header/infinite-header.tsx"),

  // Other
  route("/tarot", "routes/tarot.tsx"),
  route("/api/tarot", "routes/api.tarot.ts"),
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
