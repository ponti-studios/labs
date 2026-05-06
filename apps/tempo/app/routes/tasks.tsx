import { Suspense } from "react";
import { Await, useLoaderData } from "react-router";
import { ProjectList } from "~/components/ProjectList";
import TaskForm from "~/components/to-do/TaskForm";
import { TaskList } from "~/components/to-do/TaskList";
import { getProjects, getTodosWithProjects } from "~/lib/server/queries";
import { useDeleteTodo } from "~/lib/todos";

// Server loader with streaming
export async function loader() {
  // Stream both datasets
  const projectsPromise = getProjects();
  const todosPromise = getTodosWithProjects();

  return {
    projects: projectsPromise,
    todos: todosPromise,
  };
}

// Loading skeleton
function TasksSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse bg-gray-100">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 border rounded-lg animate-pulse bg-gray-100">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { projects, todos } = useLoaderData<typeof loader>();
  const deleteTodoMutation = useDeleteTodo();

  const deleteTodo = (id: number) => {
    deleteTodoMutation.mutate(id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Sidebar - Streams independently */}
        <Suspense fallback={<ProjectsSkeleton />}>
          <Await resolve={projects}>
            {(projectsData) => <ProjectList projects={projectsData} />}
          </Await>
        </Suspense>

        {/* Tasks Main Content - Streams independently */}
        <div data-testid="tasks-list" className="lg:col-span-2 space-y-4">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">Tasks</h1>
          </div>
          <TaskForm />

          <Suspense fallback={<TasksSkeleton />}>
            <Await resolve={todos}>
              {(todosData) => (
                <TaskList
                  todos={todosData}
                  onDelete={deleteTodo}
                  isDeletePending={deleteTodoMutation.isPending}
                />
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
