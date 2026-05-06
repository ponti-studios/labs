import { db, projects, todos } from "~/lib/db";
import type {
  NewPlaygroundProject,
  NewPlaygroundTodo,
  PlaygroundProject,
  PlaygroundTodo,
} from "@pontistudios/db";

// Server Actions for mutations
// These run on the server and can be called from Client Components

export async function createProject(data: NewPlaygroundProject): Promise<PlaygroundProject> {
  const result = await db
    .insertInto(projects)
    .values({
      userId: data.userId,
      name: data.name,
      description: data.description ?? null,
    })
    .executeTakeFirst();

  const insertId = Number(result.insertId);
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  return {
    id: insertId,
    userId: data.userId,
    name: data.name,
    description: data.description ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateProject(
  id: string,
  data: Partial<NewPlaygroundProject>,
): Promise<PlaygroundProject | null> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  await db
    .updateTable(projects)
    .set({
      name: data.name,
      description: data.description,
      updatedAt: now,
    })
    .where("id", "=", Number.parseInt(id, 10))
    .executeTakeFirst();

  const updated = await db
    .selectFrom("projects")
    .where("id", "=", Number.parseInt(id, 10))
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

export async function deleteProject(id: string): Promise<void> {
  await db.deleteFrom(projects).where("id", "=", Number.parseInt(id, 10)).executeTakeFirst();
}

// Todo mutations
export async function createTodo(data: NewPlaygroundTodo): Promise<PlaygroundTodo> {
  const result = await db
    .insertInto(todos)
    .values({
      userId: data.userId,
      projectId: data.projectId ?? null,
      title: data.title,
      start: data.start,
      end: data.end,
      completed: data.completed ?? false,
    })
    .executeTakeFirst();

  const insertId = Number(result.insertId);
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  return {
    id: insertId,
    userId: data.userId,
    projectId: data.projectId ?? null,
    title: data.title,
    start: data.start,
    end: data.end,
    completed: data.completed ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateTodo(
  id: number,
  data: Partial<NewPlaygroundTodo>,
): Promise<PlaygroundTodo | null> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  await db
    .updateTable(todos)
    .set({
      projectId: data.projectId ?? null,
      title: data.title,
      start: data.start,
      end: data.end,
      completed: data.completed,
      updatedAt: now,
    })
    .where("id", "=", id)
    .executeTakeFirst();

  const updated = await db.selectFrom("todos").where("id", "=", id).selectAll().executeTakeFirst();

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

export async function deleteTodo(id: number): Promise<void> {
  await db.deleteFrom(todos).where("id", "=", id).executeTakeFirst();
}
