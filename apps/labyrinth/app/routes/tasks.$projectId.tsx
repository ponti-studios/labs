import { useParams } from "react-router";
import TaskForm from "~/components/to-do/TaskForm";
import { TaskList } from "~/components/to-do/TaskList";
import { useProjects } from "~/lib/projects";
import { useTodos } from "~/lib/todos";

export default function TasksByProject() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: todos = [], isLoading: todosLoading, error: todosError } = useTodos();
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects();

  if (todosLoading || projectsLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (todosError || projectsError) {
    const message = todosError?.message ?? projectsError?.message ?? "Unknown error";
    return <div className="p-6">Error loading data: {message}</div>;
  }

  if (!Number.isFinite(projectId)) {
    return <div className="p-6">Project not found</div>;
  }

  const project = projects.find((item) => item.id === projectId);
  const projectTodos = todos.filter((todo) => todo.projectId === projectId);

  if (!project) {
    return <div className="p-6">Project not found</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-sm text-white/70">{projectTodos.length} tasks</p>
      </header>

      <TaskForm projectId={projectId} />
      <TaskList todos={projectTodos} />
    </div>
  );
}
