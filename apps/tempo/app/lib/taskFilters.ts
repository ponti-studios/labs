import type { TodoItem } from "./todos";

export function slugifyProjectName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface TaskFilterState {
  project: string;
  search: string;
}

export function parseTaskFilterInput(input: string): TaskFilterState {
  const projectTokens = Array.from(input.matchAll(/#([a-z0-9-]+)/gi));
  const project = projectTokens.at(-1)?.[1]?.toLowerCase() ?? "";
  const search = input.replace(/#[a-z0-9-]+/gi, " ").replace(/\s+/g, " ").trim();

  return { project, search };
}

export function buildTaskFilterInput(filters: TaskFilterState): string {
  const parts = [];

  if (filters.search) {
    parts.push(filters.search);
  }

  if (filters.project) {
    parts.push(`#${filters.project}`);
  }

  return parts.join(" ").trim();
}

export function filterTodos(
  todos: TodoItem[],
  filters: TaskFilterState,
): TodoItem[] {
  const normalizedSearch = filters.search.trim().toLowerCase();
  const normalizedProject = filters.project.trim().toLowerCase();

  return todos.filter((todo) => {
    const matchesSearch = !normalizedSearch
      || todo.title.toLowerCase().includes(normalizedSearch);
    const projectSlug = todo.projectName ? slugifyProjectName(todo.projectName) : "";
    const matchesProject = !normalizedProject || projectSlug === normalizedProject;

    return matchesSearch && matchesProject;
  });
}
