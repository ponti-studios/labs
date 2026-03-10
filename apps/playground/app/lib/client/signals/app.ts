import { signal, computed } from "@preact/signals-react";
import type { Project } from "~/types";

// Global app state
export const searchQuery = signal("");
export const selectedFilters = signal<string[]>([]);
export const viewMode = signal<"grid" | "list">("grid");
export const isSidebarOpen = signal(true);

// Projects state
export const projects = signal<Project[]>([]);
export const selectedProjectId = signal<string | null>(null);

// Computed values
export const filteredProjects = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const filters = selectedFilters.value;

  return projects.value.filter((project) => {
    const matchesQuery =
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query);
    const matchesFilters = filters.every((f) => project.tags?.includes(f));

    return matchesQuery && matchesFilters;
  });
});

export const selectedProject = computed(() => {
  const id = selectedProjectId.value;
  return id ? projects.value.find((p) => p.id === id) : null;
});
