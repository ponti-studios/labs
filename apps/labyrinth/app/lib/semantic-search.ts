import { db } from "~/lib/db";

export async function searchTodosBySemanticSimilarity(
  query: string,
  userId: string,
  limit: number = 10,
) {
  try {
    // Fetch todos with their project names for the given user
    // In Postgres, we store embeddings as JSON - for a real semantic search,
    // you would use a vector similarity function or an external service.
    // Here we do a basic text match on content for demonstration.
    const results = await db
      .selectFrom("todos")
      .leftJoin("projects", "todos.projectId", "projects.id")
      .leftJoin("embeddings", "todos.id", "embeddings.todoId")
      .where("todos.userId", "=", userId)
      .where((eb) =>
        eb.or([
          eb("todos.title", "like", `%${query}%`),
          eb("embeddings.content", "like", `%${query}%`),
          eb("projects.name", "like", `%${query}%`),
        ]),
      )
      .orderBy("todos.createdAt", "desc")
      .limit(limit)
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

    return results.map((r) => ({
      id: r.id,
      userId: r.userId,
      projectId: r.projectId,
      title: r.title,
      start: r.start,
      end: r.end,
      completed: r.completed,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      projectName: r.projectName ?? null,
      similarity: 1.0, // Placeholder - real implementation would compute actual similarity
    }));
  } catch (error) {
    console.error("Error in semantic search:", error);
    throw new Error(
      `Semantic search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
