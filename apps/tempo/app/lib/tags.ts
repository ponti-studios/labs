import { useQuery } from "@tanstack/react-query";

export const DEFAULT_TAG_COLOR = "#64748b";

export interface TagItem {
  id: number;
  userId: string;
  name: string;
  normalizedName: string;
  color: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export function normalizeTagName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveTagColor(color: string | null | undefined): string {
  return color || DEFAULT_TAG_COLOR;
}

export const useTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async (): Promise<TagItem[]> => {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }

      return (await response.json()) as TagItem[];
    },
    staleTime: 0,
  });
};
