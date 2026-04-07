import { db } from "~/lib/db";

export async function searchTodosBySemanticSimilarity(
  query: string,
  userId: string,
  limit: number = 10,
) {
  try {
    // Fetch todos with their project names for the given user
    // In MySQL, we store embeddings as JSON - for a real semantic search,
    // you would use a vector similarity function or an external service.
    // Here we do a basic text match on content for demonstration.
    const results = await db
      .selectFrom("playground_todos")
      .leftJoin("playground_projects", "playground_todos.projectId", "playground_projects.id")
      .leftJoin("playground_embeddings", "playground_todos.id", "playground_embeddings.todoId")
      .where("playground_todos.userId", "=", userId)
      .where((eb) =>
        eb.or([
          eb("playground_todos.title", "like", `%${query}%`),
          eb("playground_embeddings.content", "like", `%${query}%`),
          eb("playground_projects.name", "like", `%${query}%`),
        ]),
      )
      .orderBy("playground_todos.createdAt", "desc")
      .limit(limit)
      .select([
        "playground_todos.id",
        "playground_todos.userId",
        "playground_todos.projectId",
        "playground_todos.title",
        "playground_todos.start",
        "playground_todos.end",
        "playground_todos.completed",
        "playground_todos.createdAt",
        "playground_todos.updatedAt",
        "playground_projects.name as projectName",
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
