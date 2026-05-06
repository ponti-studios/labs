import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { db } from "~/lib/db";
import type { NewPlaygroundTodo, PlaygroundTodo } from "@pontistudios/db";
import { generateTaskEmbedding } from "~/lib/embeddings";
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

interface TodoWithProjectName {
  id: number;
  userId: string;
  projectId: number | null;
  title: string;
  start: string;
  end: string;
  completed: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  projectName: string | null;
}

async function fetchUserTodos(userId: string): Promise<TodoWithProjectName[]> {
  const todos = await db
    .selectFrom("todos")
    .leftJoin("projects", "todos.projectId", "projects.id")
    .where("todos.userId", "=", userId)
    .orderBy("todos.createdAt")
    .select([
      "todos.id",
      "todos.userId",
      "todos.projectId",
      "todos.title",
      "todos.start",
      "todos.end",
      "todos.completed",
      "todos.createdAt",
      "todos.updatedAt",
      "projects.name as projectName",
    ])
    .execute();

  return todos.map((t) => ({
    ...t,
    projectName: t.projectName ?? null,
  }));
}

async function createTodo(
  todoData: Omit<NewPlaygroundTodo, "id" | "createdAt" | "updatedAt">,
  userId: string,
): Promise<PlaygroundTodo> {
  const insertResult = await db
    .insertInto("todos")
    .values({
      userId,
      projectId: todoData.projectId ?? null,
      title: todoData.title,
      start: todoData.start,
      end: todoData.end,
      completed: todoData.completed ?? false,
    })
    .executeTakeFirst();

  const newTodoId = Number(insertResult.insertId);
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  // Generate and save embedding asynchronously (don't block the response)
  const projectName = todoData.projectId
    ? await db
        .selectFrom("projects")
        .where("id", "=", todoData.projectId)
        .select("name")
        .executeTakeFirst()
        .then((r) => r?.name ?? undefined)
    : undefined;

  const embeddingValues = await generateTaskEmbedding(todoData.title, projectName);

  await db
    .insertInto("embeddings")
    .values({
      todoId: newTodoId,
      content: projectName
        ? `Task: ${todoData.title} | Project: ${projectName}`
        : `Task: ${todoData.title}`,
      embedding: JSON.stringify(embeddingValues),
      model: "gemini-embedding-001",
    })
    .execute();

  return {
    id: newTodoId,
    userId,
    projectId: todoData.projectId ?? null,
    title: todoData.title,
    start: todoData.start,
    end: todoData.end,
    completed: todoData.completed ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

async function updateTodo(
  todoData: Omit<NewPlaygroundTodo, "id" | "createdAt" | "updatedAt"> & { id: number },
  _userId: string,
): Promise<PlaygroundTodo | null> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  await db
    .updateTable("todos")
    .set({
      projectId: todoData.projectId ?? null,
      title: todoData.title,
      start: todoData.start,
      end: todoData.end,
      completed: todoData.completed ?? false,
      updatedAt: now,
    })
    .where("id", "=", todoData.id)
    .executeTakeFirst();

  const updated = await db
    .selectFrom("todos")
    .where("id", "=", todoData.id)
    .selectAll()
    .executeTakeFirst();

  if (!updated) return null;

  return {
    id: updated.id,
    userId: updated.userId,
    projectId: updated.projectId,
    title: updated.title,
    start: updated.start,
    end: updated.end,
    completed: updated.completed,
    createdAt: updated.createdAt ?? now,
    updatedAt: updated.updatedAt ?? now,
  };
}

async function deleteTodo(todoId: number): Promise<boolean> {
  const result = await db.deleteFrom("todos").where("id", "=", todoId).executeTakeFirst();

  return result.numDeletedRows > 0;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { userId, session } = await getOrCreateUserId(request);
    const userTodos = await fetchUserTodos(userId);
    return createResponseWithSession(userTodos, session);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return Response.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, session } = await getOrCreateUserId(request);

    switch (request.method) {
      case "POST": {
        const body = (await request.json()) as Omit<
          NewPlaygroundTodo,
          "id" | "createdAt" | "updatedAt"
        >;
        const newTodo = await createTodo(body, userId);
        return createResponseWithSession(newTodo, session);
      }

      case "PUT": {
        const body = (await request.json()) as Omit<
          NewPlaygroundTodo,
          "id" | "createdAt" | "updatedAt"
        > & { id: number };
        const updatedTodo = await updateTodo(body, userId);

        if (!updatedTodo) {
          return Response.json({ error: "Todo not found" }, { status: 404 });
        }

        return createResponseWithSession(updatedTodo, session);
      }

      case "DELETE": {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
          return Response.json({ error: "Todo ID is required" }, { status: 400 });
        }

        const deleted = await deleteTodo(Number.parseInt(id, 10));

        if (!deleted) {
          return Response.json({ error: "Todo not found" }, { status: 404 });
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
