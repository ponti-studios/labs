import { eq, sql } from "drizzle-orm";
import { db, embeddings, projects, todos } from "~/db";
import { generateEmbedding } from "./embeddings";

export async function searchTodosBySemanticSimilarity(
	query: string,
	userId: string,
	limit: number = 10,
) {
	try {
		// Generate embedding for the search query
		const queryEmbedding = await generateEmbedding(query);

		// Use PostgreSQL to calculate cosine similarity and get top results
		const results = await db
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
				similarity: sql<number>`
					1 - (${queryEmbedding} <=> ${embeddings.embedding})::float
				`.as("similarity"),
			})
			.from(todos)
			.innerJoin(embeddings, eq(embeddings.todoId, todos.id))
			.leftJoin(projects, eq(todos.projectId, projects.id))
			.where(eq(todos.userId, userId))
			.orderBy(sql`similarity DESC`) // Higher similarity = better match
			.limit(limit);

		return results;
	} catch (error) {
		console.error("Error in semantic search:", error);
		throw new Error(
			`Semantic search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
