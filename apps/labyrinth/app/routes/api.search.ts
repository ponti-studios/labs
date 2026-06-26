import { generateEmbedding } from "@pontistudios/ai";
import {
  db,
  getTableColumns,
  searchDocuments as searchDocumentsTable,
  sql,
} from "@pontistudios/db";
import type { LoaderFunctionArgs } from "react-router";

import { searchDocuments } from "~/lib/search.server";

const MAX_PAGE_SIZE = 48;

function parsePage(value: string | null): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(page) || page < 1 ? 1 : page;
}

function parsePageSize(value: string | null): number {
  const pageSize = Number.parseInt(value ?? "18", 10);
  if (Number.isNaN(pageSize) || pageSize < 1) return 18;
  return Math.min(pageSize, MAX_PAGE_SIZE);
}

function parseSort(value: string | null) {
  if (value === "newest" || value === "title") return value;
  return "relevance" as const;
}

const queryEmbeddingCache = new Map<string, Promise<number[] | null>>();

async function resolveQueryEmbedding(query: string): Promise<number[] | null> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const cached = queryEmbeddingCache.get(normalized);
  if (cached) return cached;

  const pending = generateEmbedding(query)
    .then((embedding) => (Array.isArray(embedding) && embedding.length > 0 ? embedding : null))
    .catch((error) => {
      console.warn("Semantic embedding generation failed for query:", error);
      return null;
    });

  queryEmbeddingCache.set(normalized, pending);
  return pending;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") ?? "";
    const page = parsePage(url.searchParams.get("page"));
    const pageSize = parsePageSize(url.searchParams.get("limit"));
    const sort = parseSort(url.searchParams.get("sort"));

    const lexicalRank = query.trim()
      ? sql<number>`ts_rank_cd(${searchDocumentsTable.searchVector}, websearch_to_tsquery('english', ${query}))`
      : sql<number>`0`;
    const [documents, queryEmbedding] = await Promise.all([
      db
        .select({
          ...getTableColumns(searchDocumentsTable),
          lexicalRank,
        })
        .from(searchDocumentsTable),
      resolveQueryEmbedding(query),
    ]);
    const result = searchDocuments(documents, { query, page, pageSize, sort, queryEmbedding });

    return Response.json(result);
  } catch (error) {
    console.error("Error handling search request:", error);
    return Response.json({ error: "Failed to handle search request" }, { status: 500 });
  }
}
