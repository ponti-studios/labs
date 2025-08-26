import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { TodoCreateData, TodoItem } from "~/lib/todos";
import { useUpdateTodo } from "~/lib/todos";
import { TaskFormModal } from "./TaskFormModal";

interface TaskListItemProps {
	todo: TodoItem;
	onDelete: (id: number) => void;
	isDeletePending: boolean;
}

export function TaskListItem({
	todo,
	onDelete,
	isDeletePending,
}: TaskListItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const updateTodoMutation = useUpdateTodo();

	const toggleComplete = () => {
		updateTodoMutation.mutate({
			...todo,
			completed: !todo.completed,
		});
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleUpdateTodo = (updatedTodo: TodoCreateData | TodoItem) => {
		if ("id" in updatedTodo) {
			updateTodoMutation.mutate(updatedTodo as TodoItem);
		}
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
	};

	return (
		<>
			<motion.div whileHover={{ scale: 1.01 }} className="transition-transform">
				<div
					className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${todo.completed ? "opacity-60" : ""}`}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-start gap-3">
							<input
								type="checkbox"
								checked={todo.completed}
								onChange={toggleComplete}
								className="size-4 mt-1"
								disabled={updateTodoMutation.isPending}
							/>
							<div className="flex flex-col">
								<h3
									className={`text-lg font-medium ${todo.completed ? "line-through text-gray-500" : "text-gray-900"}`}
								>
									{todo.title}
								</h3>
								<p
									className={`text-xs text-gray-600 ${todo.completed ? "line-through" : ""}`}
								>
									{todo.start} - {todo.end}
								</p>
							</div>
						</div>
						<div className="flex gap-2 items-center">
							{todo.projectName && (
								<Badge
									variant="secondary"
									className={`${todo.completed ? "line-through opacity-60" : ""}`}
								>
									{todo.projectName}
								</Badge>
							)}
							<Button
								variant="ghost"
								size="sm"
								onClick={handleEdit}
								disabled={updateTodoMutation.isPending}
								className="p-2 hover:bg-gray-100"
							>
								<Edit className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onDelete(todo.id)}
								disabled={isDeletePending}
								className="p-2 hover:bg-red-50 hover:text-red-600"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Edit Todo Modal */}
			{isEditing && (
				<TaskFormModal
					todo={todo}
					onSubmit={handleUpdateTodo}
					isLoading={updateTodoMutation.isPending}
					open={true}
					onOpenChange={(open) => !open && handleCancelEdit()}
				/>
			)}
		</>
	);
}
