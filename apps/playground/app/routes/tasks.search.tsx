import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { TaskListItem } from "~/components/to-do/TaskListItem";
import { Input } from "~/components/ui";
import type { TodoItem } from "~/lib/todos";
import { useDeleteTodo } from "~/lib/todos";
import type { SearchResult } from "~/types/vector-search";

interface SearchResponse {
	results: SearchResult[];
}

export default function VectorSearchPage() {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const deleteTodoMutation = useDeleteTodo();

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedQuery(query);
		}, 300);

		return () => {
			clearTimeout(handler);
		};
	}, [query]);

	const { data, isPending, error, refetch } = useQuery<SearchResponse, Error>({
		queryKey: ["vectorSearch", debouncedQuery],
		queryFn: async () => {
			if (!debouncedQuery.trim()) return { results: [] };
			const response = await fetch(
				`/api/search?query=${encodeURIComponent(debouncedQuery)}`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch search results");
			}
			return response.json();
		},
		enabled: !!debouncedQuery.trim(),
	});

	const results = data?.results || [];
	const isSearching = isPending && !!debouncedQuery.trim();
	const errorMessage = error?.message || null;

	// Transform search results to TodoItem format
	const transformToTodoItem = (result: SearchResult): TodoItem | null => {
		// Extract todo ID from the post ID
		const todoId = parseInt(result.post.id || "0", 10);
		if (isNaN(todoId)) return null;

		return {
			id: todoId,
			userId: "", // This will be set by the backend
			projectId: result.post.projectId || null,
			title: result.post.content,
			start: result.post.start || "",
			end: result.post.end || "",
			completed: result.post.completed === 1,
			createdAt: result.post.date,
			updatedAt: result.post.date,
			projectName: result.post.project,
		};
	};

	const handleDeleteTodo = (id: number) => {
		deleteTodoMutation.mutate(id);
	};

	return (
		<div className="min-h-screen bg-white">
			<div className="mx-auto max-w-2xl px-4 py-8">
				<h1 className="mb-8 text-center text-xl font-medium text-gray-900">
					Search Tasks
				</h1>

				<div className="space-y-4">
					{/* Search Input */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<label htmlFor="search" className="sr-only">
							Search
						</label>
						<Input
							id="search"
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search tasks..."
							className="pl-10"
						/>
					</div>

					{/* Loading */}
					{isSearching && (
						<div className="flex items-center gap-2 text-sm text-gray-500">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Searching...</span>
						</div>
					)}

					{/* Error */}
					{errorMessage && (
						<div className="rounded bg-red-50 p-3 text-sm text-red-600">
							{errorMessage}
						</div>
					)}

					{/* Results */}
					{results.length > 0 && (
						<div className="space-y-3">
							<div className="text-sm text-gray-600">
								{results.length} results
							</div>
							{results.map((result) => {
								const todoItem = transformToTodoItem(result);
								if (todoItem) {
									return (
										<TaskListItem
											key={result.post.id}
											todo={todoItem}
											onDelete={handleDeleteTodo}
											isDeletePending={deleteTodoMutation.isPending}
										/>
									);
								}
								return null;
							})}
						</div>
					)}

					{/* No Results */}
					{debouncedQuery &&
						results.length === 0 &&
						!isSearching &&
						!errorMessage && (
							<div className="py-8 text-center text-gray-500">
								<div className="text-sm">No tasks found</div>
							</div>
						)}
				</div>
			</div>
		</div>
	);
}
