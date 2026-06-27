import type { SearchDocument, SearchDocumentKind } from "@pontistudios/db";

import type {
  SearchFacetCount,
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchSortMode,
} from "./search-types";

type HybridSearchDocument = SearchDocument & {
  lexicalRank?: number;
};

type RankedDocument = SearchResult;

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length === 0 || right.length === 0) return 0;

  const length = Math.min(left.length, right.length);
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) return 0;
  return dot / Math.sqrt(leftMagnitude * rightMagnitude);
}

function normalizeLexicalRank(rank: number): number {
  if (!Number.isFinite(rank) || rank <= 0) return 0;
  return clamp(rank * 100, 0, 100);
}

function normalizeSemanticScore(similarity: number): number {
  if (!Number.isFinite(similarity) || similarity <= 0) return 0;
  return clamp(similarity * 100, 0, 100);
}

function collectMatchedFields(document: SearchDocument, query: string, tokens: string[]): string[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const fields: Array<[string, string]> = [
    ["Title", document.title],
    ["Subtitle", document.subtitle],
    ["Summary", document.summary],
    ["Body", document.body],
    ["Category", document.category],
    ["Location", document.location],
    ["Tags", document.tags.join(" ")],
    ["Search text", document.searchText],
  ];

  const matches: string[] = [];
  for (const [name, value] of fields) {
    const normalizedValue = normalize(value);
    if (normalizedValue.includes(normalizedQuery)) {
      matches.push(name);
      continue;
    }

    const words = normalizedValue.split(" ");
    if (
      tokens.some((token) =>
        words.some(
          (word) =>
            word === token ||
            word.startsWith(token) ||
            token.startsWith(word) ||
            (token.length >= 4 && word.includes(token.slice(0, 3))),
        ),
      )
    ) {
      matches.push(name);
    }
  }

  if (tokens.some((token) => String(document.year).includes(token))) {
    matches.push("Year");
  }

  return [...new Set(matches)];
}

function buildSnippet(document: SearchDocument, query: string, tokens: string[]): string {
  const source = `${document.summary} ${document.body}`;
  const normalizedSource = normalize(source);
  const normalizedQuery = normalize(query);
  const needle = normalizedQuery || tokens[0] || "";

  if (!needle) {
    return document.summary;
  }

  const index = normalizedSource.indexOf(needle);
  if (index === -1) {
    const summary = document.summary;
    return summary.length > 160 ? `${summary.slice(0, 157)}...` : summary;
  }

  const start = clamp(index - 60, 0, Math.max(0, source.length - 1));
  const end = clamp(index + needle.length + 90, 0, source.length);
  const snippet = source.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "..." : ""}${snippet}${end < source.length ? "..." : ""}`;
}

function countBy<T extends string>(items: T[]) {
  const counts = new Map<T, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function sortResults(results: RankedDocument[], sort: SearchSortMode): RankedDocument[] {
  const copy = [...results];

  if (sort === "newest") {
    return copy.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime() ||
        Number(b.featured) - Number(a.featured) ||
        b.finalScore - a.finalScore ||
        b.popularity - a.popularity ||
        a.title.localeCompare(b.title),
    );
  }

  if (sort === "title") {
    return copy.sort(
      (a, b) =>
        a.title.localeCompare(b.title) ||
        b.finalScore - a.finalScore ||
        Number(b.featured) - Number(a.featured) ||
        b.popularity - a.popularity,
    );
  }

  return copy.sort(
    (a, b) =>
      b.finalScore - a.finalScore ||
      Number(b.featured) - Number(a.featured) ||
      b.popularity - a.popularity ||
      b.year - a.year ||
      a.title.localeCompare(b.title),
  );
}

function scoreDocument(
  document: HybridSearchDocument,
  query: string,
  queryEmbedding: number[] | null | undefined,
): RankedDocument {
  const normalizedQuery = normalize(query);
  const tokens = tokenize(query);
  const lexicalScore = normalizedQuery ? normalizeLexicalRank(document.lexicalRank ?? 0) : 0;
  const semanticSimilarity =
    normalizedQuery && queryEmbedding && queryEmbedding.length > 0 && document.embedding.length > 0
      ? cosineSimilarity(queryEmbedding, document.embedding)
      : 0;
  const semanticScore = normalizedQuery ? normalizeSemanticScore(semanticSimilarity) : 0;

  const publishedAt = new Date(document.publishedAt);
  const ageDays = Number.isNaN(publishedAt.getTime())
    ? 365
    : Math.max(0, (Date.now() - publishedAt.getTime()) / 86_400_000);
  const recencyBoost = Math.max(0, 4 - ageDays / 180);
  const popularityBoost = clamp(document.popularity / 30, 0, 4);
  const featuredBoost = document.featured ? 3 : 0;
  const boostScore = recencyBoost + popularityBoost + featuredBoost;

  const finalScore =
    Math.round((lexicalScore * 0.62 + semanticScore * 0.34 + boostScore) * 10) / 10;
  const matchedFields = collectMatchedFields(document, query, tokens);

  const matchReasons = [
    normalizedQuery && lexicalScore > 0 ? `Lexical rank ${lexicalScore.toFixed(1)}` : null,
    normalizedQuery && semanticScore > 0 ? `Semantic similarity ${semanticScore.toFixed(1)}` : null,
    matchedFields.length > 0 ? `Matched fields: ${matchedFields.slice(0, 4).join(", ")}` : null,
    featuredBoost > 0 ? "Featured boost" : null,
    popularityBoost > 0 ? `Popularity boost ${document.popularity}` : null,
    recencyBoost > 0 ? `Recency boost ${recencyBoost.toFixed(1)}` : null,
  ].filter((value): value is string => value !== null);

  return {
    ...document,
    lexicalScore: Math.round(lexicalScore * 10) / 10,
    semanticScore: Math.round(semanticScore * 10) / 10,
    score: finalScore,
    finalScore,
    matchedFields,
    matchReasons,
    snippet: buildSnippet(document, query, tokens),
  };
}

function sortSignals(results: RankedDocument[]) {
  const signalCounts = new Map<string, number>();
  for (const item of results) {
    for (const reason of item.matchReasons) {
      const key = reason.split(" ")[0] ?? reason;
      signalCounts.set(key, (signalCounts.get(key) ?? 0) + 1);
    }
  }

  return [...signalCounts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, 6);
}

export function searchDocuments(
  documents: HybridSearchDocument[],
  query: SearchQuery,
): SearchResponse {
  const normalizedQuery = normalize(query.query);

  const scored = documents
    .map((document) => scoreDocument(document, query.query, query.queryEmbedding))
    .filter((document) => {
      if (!normalizedQuery) return true;
      return document.lexicalScore > 0 || document.semanticScore > 0;
    });

  const sorted = sortResults(scored, query.sort);
  const total = sorted.length;
  const pageSize = clamp(query.pageSize, 6, 48);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = clamp(query.page, 1, totalPages);
  const offset = (page - 1) * pageSize;
  const paged = sorted.slice(offset, offset + pageSize);

  const kinds = countBy(sorted.map((item) => item.kind));
  const categories = countBy(sorted.map((item) => item.category)).slice(0, 8);
  const tags = countBy(sorted.flatMap((item) => item.tags.map((tag) => tag.toLowerCase()))).slice(
    0,
    10,
  );
  const years =
    sorted.length > 0
      ? {
          min: Math.min(...sorted.map((item) => item.year)),
          max: Math.max(...sorted.map((item) => item.year)),
        }
      : null;

  return {
    query: query.query,
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    results: paged,
    facets: {
      kinds: kinds as Array<SearchFacetCount & { value: SearchDocumentKind }>,
      categories,
      tags,
      years,
    },
    signals: sortSignals(sorted),
  };
}
