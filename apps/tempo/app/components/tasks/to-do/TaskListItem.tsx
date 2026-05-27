import { Badge, Button } from "@pontistudios/ui";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import type { TodoItem } from "~/lib/todos";
import { useUpdateTodo } from "~/lib/todos";

interface TaskListItemProps {
  todo: TodoItem;
  onDelete: (id: number) => void;
  isDeletePending: boolean;
  onEdit: (todo: TodoItem) => void;
}

export function TaskListItem({ todo, onDelete, isDeletePending, onEdit }: TaskListItemProps) {
  const updateTodoMutation = useUpdateTodo();

  const toggleComplete = () => {
    updateTodoMutation.mutate({
      ...todo,
      completed: !todo.completed,
    });
  };

  return (
    <motion.div whileHover={{ scale: 1.01 }} className="transition-transform">
      <div
        className={`rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent ${todo.completed ? "opacity-60" : ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={todo.completed ?? false}
              onChange={toggleComplete}
              className="mt-1 size-4"
              disabled={updateTodoMutation.isPending}
            />
            <div className="flex flex-col gap-1">
              <h3
                className={`text-lg font-medium ${todo.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
              >
                {todo.title}
              </h3>
              <p className={`text-xs text-muted-foreground ${todo.completed ? "line-through" : ""}`}>
                {todo.start} - {todo.end}
              </p>
              {todo.projectName && (
                <div>
                  <Badge
                    variant="secondary"
                    className={`${todo.completed ? "line-through opacity-60" : ""}`}
                  >
                    {todo.projectName}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(todo)}
              disabled={updateTodoMutation.isPending}
              className="p-2"
              aria-label="Edit task"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(todo.id)}
              disabled={isDeletePending}
              className="p-2 hover:text-destructive"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
