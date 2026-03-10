import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { projects, tasks, todos } from "~/lib/db/schema";
import type { NewProject, NewTask, TodoInsert } from "~/lib/db/schema";

// Server Actions for mutations
// These run on the server and can be called from Client Components

export async function createProject(data: NewProject) {
  const [project] = await db.insert(projects).values(data).returning();

  return project;
}

export async function updateProject(id: string, data: Partial<NewProject>) {
  const [project] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, parseInt(id)))
    .returning();

  return project;
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, parseInt(id)));
}

export async function createTask(data: NewTask) {
  const [task] = await db.insert(tasks).values(data).returning();

  return task;
}

export async function updateTask(id: string, data: Partial<NewTask>) {
  const [task] = await db
    .update(tasks)
    .set(data)
    .where(eq(tasks.id, parseInt(id)))
    .returning();

  return task;
}

export async function deleteTask(id: string) {
  await db.delete(tasks).where(eq(tasks.id, parseInt(id)));
}

// Todo mutations
export async function createTodo(data: TodoInsert) {
  const [todo] = await db.insert(todos).values(data).returning();

  return todo;
}

export async function updateTodo(id: number, data: Partial<TodoInsert>) {
  const [todo] = await db
    .update(todos)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(todos.id, id))
    .returning();

  return todo;
}

export async function deleteTodo(id: number) {
  await db.delete(todos).where(eq(todos.id, id));
}
