import type { LoaderFunctionArgs } from "react-router";
import { db } from "~/lib/db";
import { searchTodosBySemanticSimilarity } from "~/lib/semantic-search";
import { getSession } from "~/lib/session";

// Types for search results
type TextSearchResult = {
  id: number;
  title: string;
  start: string;
  end: string;
  completed: boolean | null;
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
        searchResults = await searchTodosBySemanticSimilarity(query, userId, 20);
      } catch (error) {
        console.error("Semantic search failed, falling back to text search:", error);
        // Fall back to text search if semantic search fails
        finalSearchType = "text";
      }
    }

    // Use traditional text search
    if (finalSearchType === "text" || !searchResults) {
      const rows = await db
        .selectFrom("playground_todos")
        .leftJoin("playground_projects", "playground_todos.projectId", "playground_projects.id")
        .where((eb) =>
          eb.or([
            eb("playground_todos.title", "like", `%${query}%`),
            eb("playground_projects.name", "like", `%${query}%`),
          ]),
        )
        .where("playground_todos.userId", "=", userId)
        .orderBy("playground_todos.createdAt", "desc")
        .select([
          "playground_todos.id",
          "playground_todos.title",
          "playground_todos.start",
          "playground_todos.end",
          "playground_todos.completed",
          "playground_todos.createdAt",
          "playground_todos.projectId",
          "playground_projects.name as projectName",
        ])
        .execute();

      searchResults = rows.map(
        (r): TextSearchResult => ({
          id: r.id as number,
          title: r.title,
          start: r.start,
          end: r.end,
          completed: r.completed as boolean | null,
          createdAt: r.createdAt as string | null,
          projectName: r.projectName ?? null,
          projectId: r.projectId as number | null,
        }),
      );
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
