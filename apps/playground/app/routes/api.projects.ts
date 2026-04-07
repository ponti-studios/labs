import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { db } from "~/lib/db";
import type { NewPlaygroundProject, PlaygroundProject } from "@pontistudios/db";
import { commitSession, getSession } from "~/lib/session";

async function getOrCreateUserId(request: Request): Promise<{ userId: string; session: unknown }> {
  const session = await getSession(request.headers.get("Cookie"));
  let userId = session.get("userId");

  if (!userId) {
    userId = `session_${Date.now()}_${crypto.randomUUID()}`;
    session.set("userId", userId);
  }

  return { userId, session };
}

async function createResponseWithSession(data: unknown, session: unknown) {
  return Response.json(data, {
    headers: {
      "Set-Cookie": await commitSession(session as any),
    },
  });
}

interface ProjectWithTaskCount {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  taskCount: number;
}

async function fetchUserProjects(userId: string): Promise<ProjectWithTaskCount[]> {
  const projects = await db
    .selectFrom("playground_projects")
    .where("userId", "=", userId)
    .orderBy("createdAt", "desc")
    .select(["id", "userId", "name", "description", "createdAt", "updatedAt"])
    .execute();

  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      const countResult = await db
        .selectFrom("playground_todos")
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

async function createProject(
  projectData: Omit<NewPlaygroundProject, "id" | "createdAt" | "updatedAt">,
  userId: string,
): Promise<PlaygroundProject> {
  const result = await db
    .insertInto("playground_projects")
    .values({
      userId,
      name: projectData.name,
      description: projectData.description ?? null,
    })
    .executeTakeFirst();

  const insertId = Number(result.insertId);
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  return {
    id: insertId,
    userId,
    name: projectData.name,
    description: projectData.description ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

async function updateProject(
  projectData: { id: number; name?: string; description?: string | null },
  userId: string,
): Promise<PlaygroundProject | null> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  await db
    .updateTable("playground_projects")
    .set({
      name: projectData.name,
      description: projectData.description,
      updatedAt: now,
    })
    .where("id", "=", projectData.id)
    .executeTakeFirst();

  const updated = await db
    .selectFrom("playground_projects")
    .where("id", "=", projectData.id)
    .selectAll()
    .executeTakeFirst();

  if (!updated) return null;

  return {
    id: updated.id,
    userId: updated.userId,
    name: updated.name,
    description: updated.description,
    createdAt: updated.createdAt ?? now,
    updatedAt: updated.updatedAt ?? now,
  };
}

async function deleteProject(projectId: number): Promise<boolean> {
  const result = await db
    .deleteFrom("playground_projects")
    .where("id", "=", projectId)
    .executeTakeFirst();

  return result.numDeletedRows > 0;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { userId, session } = await getOrCreateUserId(request);
    const userProjects = await fetchUserProjects(userId);
    return createResponseWithSession(userProjects, session);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return Response.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, session } = await getOrCreateUserId(request);

    switch (request.method) {
      case "POST": {
        const body = (await request.json()) as Omit<
          NewPlaygroundProject,
          "id" | "createdAt" | "updatedAt"
        >;
        const newProject = await createProject(body, userId);
        return createResponseWithSession(newProject, session);
      }

      case "PUT": {
        const body = (await request.json()) as {
          id: number;
          name?: string;
          description?: string | null;
        };
        const updatedProject = await updateProject(body, userId);

        if (!updatedProject) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }

        return createResponseWithSession(updatedProject, session);
      }

      case "DELETE": {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
          return Response.json({ error: "Project ID is required" }, { status: 400 });
        }

        const deleted = await deleteProject(Number.parseInt(id, 10));

        if (!deleted) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }

        return createResponseWithSession({ success: true }, session);
      }

      default:
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error) {
    console.error("Error in action:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
