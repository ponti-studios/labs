import { Link } from "react-router";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import type { ProjectItem } from "~/lib/projects";
import { ProjectFormModal } from "./ProjectFormModal";

interface ProjectListProps {
	projects: ProjectItem[];
}

export function ProjectList({ projects }: ProjectListProps) {
	if (projects.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				No projects found. Create your first project to get started.
			</div>
		);
	}

	return (
		<Card
			data-testid="projects-list"
			className="hover:shadow-md transition-shadow py-4"
		>
			<CardHeader className="flex justify-between items-end px-2">
				<h2 className="text-sm text-gray-500 font-semibold">Projects</h2>
				<div className="flex gap-4">
					<ProjectFormModal />
				</div>
			</CardHeader>
			<CardContent className="px-2">
				<ul className="space-y-3">
					{projects.map((project) => (
						<li
							key={project.id}
							className="flex items-center justify-between border-b border-gray-200 py-2"
						>
							<Link
								to={`/tasks/${project.id}`}
								className="flex items-center justify-between flex-1 hover:bg-gray-50 rounded-md p-2 transition-colors"
							>
								<div className="flex-1 text-sm">
									<h3 className="font-semibold">{project.name}</h3>
								</div>
								<div className="flex items-center gap-4">
									<div className="text-right font-semibold">
										{project.taskCount}
									</div>
								</div>
							</Link>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
