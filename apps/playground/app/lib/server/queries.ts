import { db } from "~/lib/db";

// Server-side data fetching patterns
// These run on the server only - never shipped to client

interface ProjectWithTaskCount {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  taskCount: number;
}

export async function getProjects(_filters?: { status?: string }): Promise<ProjectWithTaskCount[]> {
  const projects = await db
    .selectFrom("projects")
    .orderBy("createdAt", "desc")
    .select(["id", "userId", "name", "description", "createdAt", "updatedAt"])
    .execute();

  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      const countResult = await db
        .selectFrom("todos")
        .where("projectId", "=", project.id)
        .select((eb) => eb.fn.count<number>("id").as("taskCount"))
        .executeTakeFirstOrThrow();

      return {
        ...project,
        taskCount: Number(countResult.taskCount) || 0,
      };
    }),
  );

  return projectsWithCounts;
}

export async function getProject(id: string) {
  return db
    .selectFrom("projects")
    .where("id", "=", Number.parseInt(id, 10))
    .selectAll()
    .executeTakeFirst();
}

export async function getProjectWithTasks(id: string) {
  return db
    .selectFrom("projects")
    .where("id", "=", Number.parseInt(id, 10))
    .selectAll()
    .executeTakeFirst();
}

export async function getTodos() {
  return await db.selectFrom("todos").orderBy("createdAt", "desc").selectAll().execute();
}

export async function getTodosWithProjects() {
  const todosData = await db
    .selectFrom("todos")
    .orderBy("createdAt", "desc")
    .selectAll()
    .execute();

  const todosWithProjects = await Promise.all(
    todosData.map(async (todo) => {
      if (todo.projectId) {
        const project = await db
          .selectFrom("projects")
          .where("id", "=", todo.projectId)
          .select("name")
          .executeTakeFirst();
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
