import { Button, Input } from "@pontistudios/ui";
import { useState } from "react";
import { useProjects } from "~/lib/projects";
import type { TodoItem } from "~/lib/todos";
import { useCreateTodo } from "~/lib/todos";

interface TaskFormProps {
  onTodoCreated?: (todo: TodoItem) => void;
  defaultProjectId?: number;
}

export default function TaskForm({ onTodoCreated, defaultProjectId }: TaskFormProps) {
  const createTodoMutation = useCreateTodo();
  const { data: projects = [] } = useProjects();

  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(defaultProjectId);

  const handleCreateSimpleTodo = () => {
    if (!newTodoTitle.trim()) return;

    const today = new Date().toISOString().split("T")[0];

    createTodoMutation.mutate(
      {
        title: newTodoTitle.trim(),
        start: today,
        end: today,
        completed: false,
        projectId: selectedProjectId || null,
      },
      {
        onSuccess: (todo) => {
          setNewTodoTitle("");
          onTodoCreated?.(todo);
        },
      },
    );
  };

  return (
    <form
      className="flex gap-2 items-end"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreateSimpleTodo();
      }}
    >
      <div className="flex-1">
        <label
          htmlFor="todo-title"
          className="block text-sm font-medium text-gray-700 mb-1 sr-only"
        >
          New task
        </label>
        <Input
          id="todo-title"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="New task"
          className="w-full min-h-10"
          required
        />
      </div>
      <div className="w-48">
        <label
          htmlFor="project-select"
          className="block text-sm font-medium text-gray-700 mb-1 sr-only"
        >
          Project
        </label>
        <select
          id="project-select"
          value={selectedProjectId?.toString() || ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedProjectId(e.target.value ? Number(e.target.value) : undefined)
          }
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">No project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        disabled={!newTodoTitle.trim() || createTodoMutation.isPending}
        className="px-6 min-h-10"
      >
        {createTodoMutation.isPending ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
