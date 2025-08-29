import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("/border-linear-gradient", "routes/border-linear-gradient.tsx"),
	route("/svg-glass-test", "routes/svg-glass-test.tsx"),
	route("/google-maps", "routes/google-maps.tsx"),
	route("/tasks", "routes/tasks.tsx"),
	route("/tasks/search", "routes/tasks.search.tsx"),
	route("/tasks/:projectId", "routes/tasks.$projectId.tsx"),
	route("/projects", "routes/projects.tsx"),

	// TFL cameras
	route("/api/tfl", "routes/api.tfl.ts"),
	route("/tfl", "routes/tfl.tsx"),
	route("/infinite-header", "routes/infinite-header/infinite-header.tsx"),

	// COVID-19 routes
	route("/corona", "routes/corona.tsx"),
	route("/corona/:countryCode", "routes/corona.$countryCode.tsx"),
	route(
		"/corona/:countryCode/pandemic-waves",
		"routes/corona.$countryCode.pandemic-waves.tsx",
	),
	route(
		"/corona/:countryCode/vaccination-effectiveness",
		"routes/corona.$countryCode.vaccination-effectiveness.tsx",
	),
	route(
		"/corona/:countryCode/seasonal-patterns",
		"routes/corona.$countryCode.seasonal-patterns.tsx",
	),
	route(
		"/corona/:countryCode/outlier-detection",
		"routes/corona.$countryCode.outlier-detection.tsx",
	),

	// COVID API routes
	route("/api/covid", "routes/api.covid.ts"),
	route(
		"/api/covid/analytics/dashboard",
		"routes/api.covid.analytics.dashboard.ts",
	),
	route(
		"/api/covid/analytics/pandemic-waves",
		"routes/api.covid.analytics.pandemic-waves.ts",
	),
	route(
		"/api/covid/analytics/outlier-detection",
		"routes/api.covid.analytics.outlier-detection.ts",
	),
	route(
		"/api/covid/analytics/seasonal-patterns",
		"routes/api.covid.analytics.seasonal-patterns.ts",
	),
	route(
		"/api/covid/analytics/vaccination-effectiveness",
		"routes/api.covid.analytics.vaccination-effectiveness.ts",
	),
	route(
		"/api/covid/analytics/socioeconomic-analysis",
		"routes/api.covid.analytics.socioeconomic-analysis.ts",
	),

	// API routes
	route("/api/countries/list", "routes/api.countries.list.ts"),
	route("/api/search", "routes/api.search.ts"),
	route("/api/todos", "routes/api.todos.ts"),
	route("/api/projects", "routes/api.projects.ts"),
] satisfies RouteConfig;
