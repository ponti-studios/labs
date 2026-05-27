import { normalizeTagName } from "./tags";
import type { TodoItem } from "./todos";

export interface TaskFilterState {
  tag: string;
  search: string;
}

export function parseTaskFilterInput(input: string): TaskFilterState {
  const tagTokens = Array.from(input.matchAll(/#([a-z0-9-]+)/gi));
  const tag = tagTokens.at(-1)?.[1]?.toLowerCase() ?? "";
  const search = input.replace(/#[a-z0-9-]+/gi, " ").replace(/\s+/g, " ").trim();

  return { tag, search };
}

export function buildTaskFilterInput(filters: TaskFilterState): string {
  const parts = [];

  if (filters.search) {
    parts.push(filters.search);
  }

  if (filters.tag) {
    parts.push(`#${filters.tag}`);
  }

  return parts.join(" ").trim();
}

export function filterTodos(
  todos: TodoItem[],
  filters: TaskFilterState,
): TodoItem[] {
  const normalizedSearch = filters.search.trim().toLowerCase();
  const normalizedTag = filters.tag.trim().toLowerCase();

  return todos.filter((todo) => {
    const matchesSearch = !normalizedSearch
      || todo.title.toLowerCase().includes(normalizedSearch);
    const matchesTag = !normalizedTag
      || todo.tags.some((tag) => normalizeTagName(tag.name) === normalizedTag);

    return matchesSearch && matchesTag;
  });
}
