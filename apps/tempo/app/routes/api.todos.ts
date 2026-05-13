import {
  and,
  db,
  eq,
  projects,
  todos,
} from "@pontistudios/db";

const DEMO_USER_ID = "demo-user";

interface TodoItem {
  id: number;
  userId: string;
  projectId: number | null;
  title: string;
  start: string;
  end: string;
  completed: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  projectName?: string | null;
}

interface TodoCreateData {
  projectId: number | null;
  title: string;
  start: string;
  end: string;
  completed: boolean;
}

function toIsoString(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function toTodoItem(row: {
  id: number;
  userId: string;
  projectId: number | null;
  title: string;
  start: string;
  end: string;
  completed: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  projectName?: string | null;
}): TodoItem {
  return {
    id: row.id,
    userId: row.userId,
    projectId: row.projectId,
    title: row.title,
    start: row.start,
    end: row.end,
    completed: Boolean(row.completed),
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
    projectName: row.projectName ?? null,
  };
}

export async function loader() {
  try {
    const rows = await db
      .select({
        id: todos.id,
        userId: todos.userId,
        projectId: todos.projectId,
        title: todos.title,
        start: todos.start,
        end: todos.end,
        completed: todos.completed,
        createdAt: todos.createdAt,
        updatedAt: todos.updatedAt,
        projectName: projects.name,
      })
      .from(todos)
      .leftJoin(projects, eq(todos.projectId, projects.id))
      .where(eq(todos.userId, DEMO_USER_ID));

    return Response.json(rows.map(toTodoItem));
  } catch (error) {
    console.error("Error fetching todos:", error);
    return Response.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    switch (request.method) {
      case "POST": {
        const body = (await request.json()) as TodoCreateData;
        const [todo] = await db
          .insert(todos)
          .values({
            userId: DEMO_USER_ID,
            projectId: body.projectId,
            title: body.title,
            start: body.start,
            end: body.end,
            completed: body.completed ? 1 : 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return Response.json(toTodoItem(todo));
      }

      case "PUT": {
        const body = (await request.json()) as TodoItem;
        const [todo] = await db
          .update(todos)
          .set({
            projectId: body.projectId,
            title: body.title,
            start: body.start,
            end: body.end,
            completed: body.completed ? 1 : 0,
            updatedAt: new Date(),
          })
          .where(and(eq(todos.id, body.id), eq(todos.userId, DEMO_USER_ID)))
          .returning();

        if (!todo) {
          return Response.json({ error: "Todo not found" }, { status: 404 });
        }

        return Response.json(toTodoItem(todo));
      }

      case "DELETE": {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
          return Response.json({ error: "Todo ID is required" }, { status: 400 });
        }

        const [deleted] = await db
          .delete(todos)
          .where(and(eq(todos.id, Number(id)), eq(todos.userId, DEMO_USER_ID)))
          .returning({ id: todos.id });

        if (!deleted) {
          return Response.json({ error: "Todo not found" }, { status: 404 });
        }

        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error) {
    console.error("Error in todo action:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
