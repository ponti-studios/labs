import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Project, ProjectInsert } from "../db/schema";

// Type for client-side project data (without server-managed fields)
export type ProjectItem = Project & { taskCount: number };
export type ProjectCreateData = Omit<
	ProjectInsert,
	"userId" | "id" | "createdAt" | "updatedAt"
>;

// Custom hooks for project operations
export const useProjects = () => {
	return useQuery({
		queryKey: ["projects"],
		queryFn: async (): Promise<ProjectItem[]> => {
			const response = await fetch("/api/projects");
			if (!response.ok) {
				throw new Error("Failed to fetch projects");
			}
			return (await response.json()) as ProjectItem[];
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useCreateProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (newProject: ProjectCreateData): Promise<ProjectItem> => {
			const response = await fetch("/api/projects", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newProject),
			});

			if (!response.ok) {
				throw new Error("Failed to create project");
			}

			return (await response.json()) as ProjectItem;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
};

export const useUpdateProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (updatedProject: ProjectItem): Promise<ProjectItem> => {
			const response = await fetch("/api/projects", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updatedProject),
			});

			if (!response.ok) {
				throw new Error("Failed to update project");
			}

			return (await response.json()) as ProjectItem;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
};

export const useDeleteProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number): Promise<number> => {
			const response = await fetch(`/api/projects?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete project");
			}

			return id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
	});
};
