import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/border-linear-gradient", "routes/border-linear-gradient.tsx"),
  route("/svg-glass-test", "routes/svg-glass-test.tsx"),

  route("/tasks", "routes/tasks.tsx"),
  route("/tasks/search", "routes/tasks.search.tsx"),
  route("/tasks/:projectId", "routes/tasks.$projectId.tsx"),
  route("/projects", "routes/projects.tsx"),

  // TFL cameras
  route("/api/tfl", "routes/api.tfl.ts"),
  route("/tfl", "routes/tfl.tsx"),
  route("/infinite-header", "routes/infinite-header/infinite-header.tsx"),

  // Other
  route("/tarot", "routes/tarot.tsx"),
  route("/games/wordle/rhobh", "routes/games/rhobh-wordle.tsx"),

  // API routes
  route("/api/todos", "routes/api.todos.ts"),
  route("/api/projects", "routes/api.projects.ts"),

  // Experiments
  route("/experiments", "routes/experiments.tsx"),
  route("/experiments/threegl-image-gallery", "routes/experiments.threegl-image-gallery.tsx"),

  // Coding Challenges
  route("/challenges/algorithms", "routes/Algorithms.tsx"),
  route("/challenges/cards", "routes/Cards.tsx"),
  route("/challenges/chart-hop", "routes/ChartHop.tsx"),
  route("/challenges/click-therapeutics", "routes/ClickTherapeutics.tsx"),
  route("/challenges/cloudmargin", "routes/CloudMargin.tsx"),
  route("/challenges/daily-mail", "routes/DailyMail.tsx"),
  route("/challenges/goldman-sachs", "routes/GoldmanSachs.tsx"),
  route("/challenges/growth-street", "routes/GrowthStreet.tsx"),
  route("/challenges/interview-cake", "routes/InterviewCake.tsx"),
  route("/challenges/kensho", "routes/Kensho.tsx"),
  route("/challenges/peterson-academy", "routes/PetersonAcademy.tsx"),
  route("/challenges/qubit", "routes/Qubit.tsx"),
  route("/challenges/quilt", "routes/Quilt.tsx"),
  route("/challenges/red-badger", "routes/RedBadger.tsx"),
  route("/challenges/vendigo", "routes/Vendigo.tsx"),
] satisfies RouteConfig;
