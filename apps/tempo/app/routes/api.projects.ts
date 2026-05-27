import {
  and,
  count,
  db,
  desc,
  eq,
  projects,
  todos,
} from "@pontistudios/db";

const DEMO_USER_ID = "demo-user";

interface ProjectItem {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  taskCount: number;
}

interface ProjectCreateData {
  name: string;
  description: string | null;
}

function toIsoString(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

async function fetchProjects(userId: string): Promise<ProjectItem[]> {
  const projectRows = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));

  return Promise.all(
    projectRows.map(async (project) => {
      const [countRow] = await db
        .select({ value: count() })
        .from(todos)
        .where(and(eq(todos.projectId, project.id), eq(todos.userId, userId)));

      return {
        id: project.id,
        userId: project.userId,
        name: project.name,
        description: project.description,
        createdAt: toIsoString(project.createdAt),
        updatedAt: toIsoString(project.updatedAt),
        taskCount: Number(countRow?.value ?? 0),
      };
    }),
  );
}

export async function loader() {
  try {
    const userProjects = await fetchProjects(DEMO_USER_ID);
    return Response.json(userProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return Response.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    switch (request.method) {
      case "POST": {
        const body = (await request.json()) as ProjectCreateData;
        const [project] = await db
          .insert(projects)
          .values({
            userId: DEMO_USER_ID,
            name: body.name,
            description: body.description ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return Response.json({
          id: project.id,
          userId: project.userId,
          name: project.name,
          description: project.description,
          createdAt: toIsoString(project.createdAt),
          updatedAt: toIsoString(project.updatedAt),
          taskCount: 0,
        } satisfies ProjectItem);
      }

      case "PUT": {
        const body = (await request.json()) as ProjectItem;
        const [project] = await db
          .update(projects)
          .set({
            name: body.name,
            description: body.description ?? null,
            updatedAt: new Date(),
          })
          .where(and(eq(projects.id, body.id), eq(projects.userId, DEMO_USER_ID)))
          .returning();

        if (!project) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }

        const [countRow] = await db
          .select({ value: count() })
          .from(todos)
          .where(and(eq(todos.projectId, project.id), eq(todos.userId, DEMO_USER_ID)));

        return Response.json({
          id: project.id,
          userId: project.userId,
          name: project.name,
          description: project.description,
          createdAt: toIsoString(project.createdAt),
          updatedAt: toIsoString(project.updatedAt),
          taskCount: Number(countRow?.value ?? 0),
        } satisfies ProjectItem);
      }

      case "DELETE": {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
          return Response.json({ error: "Project ID is required" }, { status: 400 });
        }

        const [deleted] = await db
          .delete(projects)
          .where(and(eq(projects.id, Number(id)), eq(projects.userId, DEMO_USER_ID)))
          .returning({ id: projects.id });

        if (!deleted) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }

        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error) {
    console.error("Error in project action:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
