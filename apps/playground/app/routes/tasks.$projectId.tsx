import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import TaskForm from "~/components/to-do/TaskForm";
import { TaskList } from "~/components/to-do/TaskList";
import { useProjects } from "~/lib/projects";
import { useDeleteTodo, useTodos } from "~/lib/todos";

export default function TasksByProject() {
	const { projectId } = useParams();
	const { data: todos = [], isLoading, error } = useTodos();
	const {
		data: projects = [],
		isLoading: projectsLoading,
		error: projectsError,
	} = useProjects();
	const deleteTodoMutation = useDeleteTodo();

	// Find the current project
	const currentProject = projects.find(
		(project) => project.id.toString() === projectId,
	);

	// Filter todos by project
	const filteredTodos = todos.filter(
		(todo) => todo.projectId?.toString() === projectId,
	);

	const deleteTodo = (id: number) => {
		deleteTodoMutation.mutate(id);
	};

	if (isLoading || projectsLoading) {
		return (
			<div className="p-6 max-w-7xl mx-auto">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	if (error || projectsError) {
		return (
			<div className="p-6 max-w-7xl mx-auto">
				<div className="text-center text-red-500">
					Error loading data: {error?.message || projectsError?.message}
				</div>
			</div>
		);
	}

	if (!currentProject) {
		return (
			<div className="p-6 max-w-7xl mx-auto">
				<div className="text-center text-red-500">Project not found</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<div className="space-y-4">
				<div className="flex items-center gap-4">
					<Link
						to="/to-do"
						className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft className="size-4" />
						Back to all tasks
					</Link>
				</div>

				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">{currentProject.name}</h1>
						<p className="text-gray-600 mt-1">
							{filteredTodos.length} task{filteredTodos.length !== 1 ? "s" : ""}
						</p>
					</div>
				</div>

				<TaskForm defaultProjectId={currentProject.id} />

				<TaskList
					todos={filteredTodos}
					onDelete={deleteTodo}
					isDeletePending={deleteTodoMutation.isPending}
				/>
			</div>
		</div>
	);
}
