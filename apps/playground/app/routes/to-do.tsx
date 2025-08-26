import { ProjectList } from "~/components/ProjectList";
import TaskForm from "~/components/to-do/TaskForm";
import { TaskList } from "~/components/to-do/TaskList";
import { useProjects } from "~/lib/projects";
import { useDeleteTodo, useTodos } from "~/lib/todos";

export default function App() {
	const { data: todos = [], isLoading, error } = useTodos();
	const {
		data: projects = [],
		isLoading: projectsLoading,
		error: projectsError,
	} = useProjects();
	const deleteTodoMutation = useDeleteTodo();

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

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<ProjectList projects={projects} />

				<div data-testid="tasks-list" className="lg:col-span-2 space-y-4">
					<div className="flex items-center">
						<h1 className="text-3xl font-bold">Tasks</h1>
					</div>
					<TaskForm />

					<TaskList
						todos={todos}
						onDelete={deleteTodo}
						isDeletePending={deleteTodoMutation.isPending}
					/>
				</div>
			</div>
		</div>
	);
}
