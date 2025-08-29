import { eq, ilike, or } from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import { db, projects, todos } from "~/db";
import { searchTodosBySemanticSimilarity } from "~/lib/semantic-search";
import { getSession } from "~/lib/session";

// Types for search results
type TextSearchResult = {
	id: number;
	title: string;
	start: string;
	end: string;
	completed: boolean;
	createdAt: string | null;
	projectName: string | null;
	projectId: number | null;
};

type SemanticSearchResult = TextSearchResult & {
	userId: string;
	updatedAt: string | null;
	similarity: number;
};

type SearchResult = TextSearchResult | SemanticSearchResult;

export async function loader({ request }: LoaderFunctionArgs) {
	try {
		const url = new URL(request.url);
		const query = url.searchParams.get("query");
		const searchType = url.searchParams.get("type") || "text"; // "text" or "semantic"

		if (!query || query.trim().length === 0) {
			return Response.json({ results: [] });
		}

		// Get user ID from session
		const session = await getSession(request.headers.get("Cookie"));
		const userId = session.get("userId");

		if (!userId) {
			return Response.json({ results: [] });
		}

		let searchResults: SearchResult[] | undefined;
		let finalSearchType = searchType;

		// Use semantic search if requested and embeddings are available
		if (searchType === "semantic") {
			try {
				searchResults = await searchTodosBySemanticSimilarity(
					query,
					userId,
					20,
				);
			} catch (error) {
				console.error(
					"Semantic search failed, falling back to text search:",
					error,
				);
				// Fall back to text search if semantic search fails
				finalSearchType = "text";
			}
		}

		// Use traditional text search
		if (finalSearchType === "text" || !searchResults) {
			searchResults = await db
				.select({
					id: todos.id,
					title: todos.title,
					start: todos.start,
					end: todos.end,
					completed: todos.completed,
					createdAt: todos.createdAt,
					projectName: projects.name,
					projectId: projects.id,
				})
				.from(todos)
				.leftJoin(projects, eq(todos.projectId, projects.id))
				.where(
					or(
						ilike(todos.title, `%${query}%`),
						ilike(projects.name, `%${query}%`),
					),
				)
				.orderBy(todos.createdAt);
		}

		// Transform results to match the expected format
		const results = (searchResults || []).map((todo: SearchResult) => ({
			post: {
				id: todo.id.toString(),
				content: todo.title,
				platform: "tasks" as const,
				date: todo.createdAt || new Date().toISOString(),
				completed: todo.completed ? 1 : 0,
				project: todo.projectName || "No Project",
				url: `/tasks/${todo.projectId || "no-project"}`,
				tags: todo.completed ? ["completed"] : ["pending"],
				start: todo.start,
				end: todo.end,
				projectId: todo.projectId,
			},
			score:
				finalSearchType === "semantic" && "similarity" in todo
					? todo.similarity || 0.5
					: todo.completed
						? 0.8
						: 1.0,
		}));

		return Response.json({ results });
	} catch (error) {
		console.error("Error searching todos:", error);
		return Response.json({ error: "Failed to search todos" }, { status: 500 });
	}
}
