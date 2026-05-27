import { Navigate, useParams } from "react-router";
import { slugifyProjectName } from "~/lib/taskFilters";
import { useProjects } from "~/lib/projects";

export default function TasksByProjectRedirect() {
  const { projectId } = useParams();
  const { data: projects = [], isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const project = projects.find((item) => item.id.toString() === projectId);

  if (!project) {
    return <Navigate to="/tasks" replace />;
  }

  return (
    <Navigate
      to={`/tasks?project=${encodeURIComponent(slugifyProjectName(project.name))}`}
      replace
    />
  );
}
