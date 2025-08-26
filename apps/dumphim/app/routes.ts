import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/all-trackers.tsx"),
	route("/profile", "routes/profile.tsx"),
	route("/tracker/create", "routes/tracker/create.tsx"),
	route("/tracker/:id", "routes/tracker/[id]/page.tsx"),
	route("/tracker/:id/vote", "routes/tracker/[id]/vote.tsx"),
] satisfies RouteConfig;
