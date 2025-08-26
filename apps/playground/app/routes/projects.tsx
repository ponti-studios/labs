import { Link } from "react-router";
import { ProjectFormModal } from "~/components/ProjectFormModal";
import { ProjectList } from "~/components/ProjectList";
import { Button } from "~/components/ui/button";
import { useDeleteProject, useProjects } from "~/lib/projects";

export default function ProjectsPage() {
	const { data: projects = [], isLoading, error } = useProjects();
	const deleteProjectMutation = useDeleteProject();

	const handleDeleteProject = (id: number) => {
		deleteProjectMutation.mutate(id);
	};

	if (isLoading) {
		return (
			<div className="p-6 max-w-4xl mx-auto">
				<div className="text-center">Loading projects...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 max-w-4xl mx-auto">
				<div className="text-center text-red-500">
					Error loading projects: {error.message}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Projects</h1>
				<div className="flex gap-4">
					<Link to="/to-do">
						<Button variant="outline">View Tasks</Button>
					</Link>
					<ProjectFormModal />
				</div>
			</div>

			<ProjectList projects={projects} />
		</div>
	);
}
