import { ListChecks } from "lucide-react";
import type { TodoItem } from "~/lib/todos";
import { TaskListItem } from "./TaskListItem";

interface TaskListProps {
	todos: TodoItem[];
	onDelete: (id: number) => void;
	isDeletePending: boolean;
}

function EmptyTaskList() {
	return (
		<div className="text-center py-12">
			<div className="max-w-md mx-auto">
				<div className="text-gray-400 mb-4 flex justify-center">
					<ListChecks className="size-12" />
				</div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
				<p className="text-gray-500 mb-6">
					Get started by creating your first project and adding some tasks to
					keep track of your work.
				</p>
			</div>
		</div>
	);
}

export function TaskList({ todos, onDelete, isDeletePending }: TaskListProps) {
	// If no todos, show empty state
	if (todos.length === 0) {
		return <EmptyTaskList />;
	}

	// Sort todos by start date and group by project
	const sortedTodos = [...todos].sort(
		(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
	);
	const groupedTodos = sortedTodos.reduce(
		(groups: Record<string, TodoItem[]>, todo: TodoItem) => {
			const project = todo.projectName || `Project ${todo.projectId}`;
			if (!groups[project]) {
				groups[project] = [];
			}
			groups[project].push(todo);
			return groups;
		},
		{} as Record<string, TodoItem[]>,
	);

	return (
		<>
			{Object.entries(groupedTodos).map(([project, projectTodos]) => (
				<div key={project} className="mb-6">
					<div className="flex flex-col gap-4">
						{(projectTodos as TodoItem[]).map((todo: TodoItem) => (
							<TaskListItem
								key={todo.id}
								todo={todo}
								onDelete={onDelete}
								isDeletePending={isDeletePending}
							/>
						))}
					</div>
				</div>
			))}
		</>
	);
}
