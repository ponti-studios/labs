import { ProjectList } from "~/components/ProjectList";
import TaskForm from "~/components/tasks/to-do/TaskForm";
import { TaskList } from "~/components/tasks/to-do/TaskList";
import { useProjects } from "~/lib/projects";
import { useDeleteTodo } from "~/lib/todos";
import { useTodos } from "~/lib/todos";

export default function TasksPage() {
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: todos = [], isLoading: todosLoading, error: todosError } = useTodos();
  const deleteTodoMutation = useDeleteTodo();

  const deleteTodo = (id: number) => {
    deleteTodoMutation.mutate(id);
  };

  if (projectsLoading || todosLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (projectsError || todosError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center text-red-500">
          Error loading data: {projectsError?.message || todosError?.message}
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
