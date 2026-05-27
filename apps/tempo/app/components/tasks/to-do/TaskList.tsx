import { ListChecks } from "lucide-react";
import type { TodoItem } from "~/lib/todos";
import { TaskListItem } from "./TaskListItem";

interface TaskListProps {
  todos: TodoItem[];
  onDelete: (id: number) => void;
  isDeletePending: boolean;
  onEdit: (todo: TodoItem) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

function EmptyTaskList({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="text-gray-400 mb-4 flex justify-center">
          <ListChecks className="size-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
      </div>
    </div>
  );
}

export function TaskList({
  todos,
  onDelete,
  isDeletePending,
  onEdit,
  emptyStateTitle = "No tasks yet",
  emptyStateDescription = "Press Ctrl/Cmd+O or use the pencil button to create your first task.",
}: TaskListProps) {
  if (todos.length === 0) {
    return (
      <EmptyTaskList
        title={emptyStateTitle}
        description={emptyStateDescription}
      />
    );
  }

  const sortedTodos = [...todos].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  return (
    <div className="flex flex-col gap-4">
      {sortedTodos.map((todo: TodoItem) => (
        <TaskListItem
          key={todo.id}
          todo={todo}
          onDelete={onDelete}
          isDeletePending={isDeletePending}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
