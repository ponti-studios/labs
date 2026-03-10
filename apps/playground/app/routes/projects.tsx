import { Button } from "@pontistudios/ui";
import { defer, type LoaderFunctionArgs } from "@react-router/node";
import { Await, isRouteErrorResponse, Link, useLoaderData, useRouteError } from "react-router";
import { Suspense } from "react";
import { ProjectFormModal } from "~/components/ProjectFormModal";
import { ProjectList } from "~/components/ProjectList";
import { getProjects } from "~/lib/server/queries";

// Server loader with streaming support
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  // Stream projects data (don't await)
  const projectsPromise = getProjects({ status });

  return defer({
    projects: projectsPromise,
  });
}

// Loading skeleton
function ProjectListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse bg-gray-100">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

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
  const { projects } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex gap-4">
          <Link to="/to-do">
            <Button variant="outline">View Tasks</Button>
          </Link>
          <ProjectFormModal />
        </div>
      </div>

      <Suspense fallback={<ProjectListSkeleton />}>
        <Await resolve={projects} errorElement={<ProjectError />}>
          {(projectsData) => <ProjectList projects={projectsData} />}
        </Await>
      </Suspense>
    </div>
  );
}

function ProjectError() {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-800">Failed to load projects</h3>
      <p className="text-red-600 mt-2">Please try refreshing the page.</p>
    </div>
  );
}
