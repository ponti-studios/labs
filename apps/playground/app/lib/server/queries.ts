import { eq, desc } from "drizzle-orm";
import { db } from "~/db";
import { projects, todos } from "~/db/schema";

// Server-side data fetching patterns
// These run on the server only - never shipped to client

export async function getProjects(filters?: { status?: string }) {
  return db.query.projects.findMany({
    orderBy: desc(projects.createdAt),
  });
}

export async function getProject(id: string) {
  return db.query.projects.findFirst({
    where: eq(projects.id, parseInt(id)),
  });
}

export async function getProjectWithTasks(id: string) {
  return db.query.projects.findFirst({
    where: eq(projects.id, parseInt(id)),
  });
}

export async function getTodos() {
  return db.query.todos.findMany({
    orderBy: desc(todos.createdAt),
  });
}

export async function getTodosWithProjects() {
  const todosData = await db.query.todos.findMany({
    orderBy: desc(todos.createdAt),
  });

  // Fetch project names for each todo
  const todosWithProjects = await Promise.all(
    todosData.map(async (todo) => {
      if (todo.projectId) {
        const project = await db.query.projects.findFirst({
          where: eq(projects.id, todo.projectId),
        });
        return {
          ...todo,
          projectName: project?.name,
        };
      }
      return {
        ...todo,
        projectName: undefined,
      };
    }),
  );

  return todosWithProjects;
}
