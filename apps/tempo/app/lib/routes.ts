export const routes = [
	{
		path: "/",
		label: "Overview",
		description: "Project timeline and task overview.",
	},
	{
		path: "/tasks",
		label: "Tasks",
		description: "Browse and manage active work.",
	},
	{
		path: "/projects",
		label: "Projects",
		description: "Review project streams and dependencies.",
	},
] as const;
