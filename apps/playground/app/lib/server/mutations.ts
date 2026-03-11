import { eq } from "drizzle-orm";
import { db, projects, todos, type TodoInsert, type ProjectInsert } from "~/lib/db";

// Server Actions for mutations
// These run on the server and can be called from Client Components

export async function createProject(data: ProjectInsert) {
  const [project] = await db.insert(projects).values(data).returning();

  return project;
}

export async function updateProject(id: string, data: Partial<ProjectInsert>) {
  const [project] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(projects.id, parseInt(id)))
    .returning();

  return project;
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, parseInt(id)));
}

// Todo mutations
export async function createTodo(data: TodoInsert) {
  const [todo] = await db.insert(todos).values(data).returning();

  return todo;
}

export async function updateTodo(id: number, data: Partial<TodoInsert>) {
  const [todo] = await db
    .update(todos)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(todos.id, id))
    .returning();

  return todo;
}

export async function deleteTodo(id: number) {
  await db.delete(todos).where(eq(todos.id, id));
}
