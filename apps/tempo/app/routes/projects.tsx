import { Button } from "@pontistudios/ui";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { ProjectFormModal } from "~/components/ProjectFormModal";
import { ProjectList } from "~/components/ProjectList";
import { useProjects } from "~/lib/projects";

// Error boundary for this route
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Error</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800">
            {error.status} {error.statusText}
          </h2>
          <p className="text-red-600 mt-2">
            {error.data?.message || "An error occurred while loading projects."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Error</h1>
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800">Unexpected Error</h2>
        <p className="text-red-600 mt-2">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex gap-4">
          <Link to="/tasks">
            <Button variant="outline">View Tasks</Button>
          </Link>
          <ProjectFormModal />
        </div>
      </div>
      <ProjectList projects={projects} />
    </div>
  );
}
