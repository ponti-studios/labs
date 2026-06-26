import type { SearchDocument, SearchDocumentKind } from "@pontistudios/db";

import type {
  SearchFacetCount,
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchSortMode,
} from "./search-types";

type ScoredDocument = SearchResult;

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeQuery(query: string): string[] {
  return normalize(query)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function textMatches(fieldValue: string, query: string, tokens: string[]) {
  const normalizedField = normalize(fieldValue);
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return { score: 0, reason: null as string | null, matched: false };

  if (normalizedField === normalizedQuery) {
    return { score: 140, reason: "Exact phrase", matched: true };
  }

  if (normalizedField.startsWith(normalizedQuery)) {
    return { score: 110, reason: "Prefix match", matched: true };
  }

  if (normalizedField.includes(normalizedQuery)) {
    return { score: 90, reason: "Phrase match", matched: true };
  }

  const tokenHits = tokens.filter((token) => {
    if (token.length < 2) return false;
    const parts = normalizedField.split(" ");
    return parts.some(
      (part) =>
        part.startsWith(token) ||
        token.startsWith(part) ||
        (token.length >= 4 && part.includes(token.slice(0, 3))),
    );
  });

  if (tokenHits.length > 0) {
    return {
      score: tokenHits.length * 18,
      reason: `Token overlap: ${tokenHits.join(", ")}`,
      matched: true,
    };
  }

  return { score: 0, reason: null, matched: false };
}

function numberMatches(value: number, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return { score: 0, reason: null as string | null, matched: false };

  if (String(value) === normalizedQuery) {
    return { score: 115, reason: "Exact year", matched: true };
  }

  if (String(value).includes(normalizedQuery)) {
    return { score: 65, reason: "Year contains query", matched: true };
  }

  return { score: 0, reason: null, matched: false };
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

function sortResults(results: ScoredDocument[], sort: SearchSortMode): ScoredDocument[] {
  const copy = [...results];

  if (sort === "newest") {
    return copy.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime() ||
        Number(b.featured) - Number(a.featured) ||
        b.score - a.score ||
        b.popularity - a.popularity ||
        a.title.localeCompare(b.title),
    );
  }

  if (sort === "title") {
    return copy.sort(
      (a, b) =>
        a.title.localeCompare(b.title) ||
        b.score - a.score ||
        Number(b.featured) - Number(a.featured) ||
        b.popularity - a.popularity,
    );
  }

  return copy.sort(
    (a, b) =>
      b.score - a.score ||
      Number(b.featured) - Number(a.featured) ||
      b.popularity - a.popularity ||
      b.year - a.year ||
      a.title.localeCompare(b.title),
  );
}

function scoreDocument(document: SearchDocument, query: string, tokens: string[]): ScoredDocument {
  const normalizedQuery = normalize(query);

  const titleMatch = textMatches(document.title, query, tokens);
  const subtitleMatch = textMatches(document.subtitle, query, tokens);
  const summaryMatch = textMatches(document.summary, query, tokens);
  const bodyMatch = textMatches(document.body, query, tokens);
  const categoryMatch = textMatches(document.category, query, tokens);
  const locationMatch = textMatches(document.location, query, tokens);
  const tagValues = document.tags.map((tag) => tag.toLowerCase());
  const tagMatch = textMatches(tagValues.join(" "), query, tokens);
  const yearMatch = numberMatches(document.year, query);

  const tagTokenHits = tokens.filter((token) => tagValues.some((tag) => tag.includes(token)));

  const matchScore =
    titleMatch.score * 5 +
    subtitleMatch.score * 4 +
    summaryMatch.score * 3 +
    bodyMatch.score +
    categoryMatch.score * 2 +
    locationMatch.score * 2 +
    tagMatch.score * 3 +
    yearMatch.score * 3 +
    tagTokenHits.length * 12;

  const publishedAt = new Date(document.publishedAt);
  const recencyDays = Number.isNaN(publishedAt.getTime())
    ? 365
    : Math.max(0, (Date.now() - publishedAt.getTime()) / 86_400_000);
  const recencyBoost = Math.max(0, 30 - Math.round(recencyDays / 4));
  const boost = (document.featured ? 20 : 0) + Math.min(document.popularity, 100) / 10 + recencyBoost;
  const score = matchScore > 0 || normalizedQuery === "" ? matchScore + boost : 0;

  const matchedFields = [
    titleMatch.matched ? "Title" : null,
    subtitleMatch.matched ? "Subtitle" : null,
    summaryMatch.matched ? "Summary" : null,
    bodyMatch.matched ? "Body" : null,
    categoryMatch.matched ? "Category" : null,
    locationMatch.matched ? "Location" : null,
    tagMatch.matched ? "Tags" : null,
    yearMatch.matched ? "Year" : null,
  ].filter((value): value is string => value !== null);

  const matchReasons = [
    titleMatch.reason ? `Title: ${titleMatch.reason}` : null,
    subtitleMatch.reason ? `Subtitle: ${subtitleMatch.reason}` : null,
    summaryMatch.reason ? `Summary: ${summaryMatch.reason}` : null,
    bodyMatch.reason ? `Body: ${bodyMatch.reason}` : null,
    categoryMatch.reason ? `Category: ${categoryMatch.reason}` : null,
    locationMatch.reason ? `Location: ${locationMatch.reason}` : null,
    tagMatch.reason ? `Tags: ${tagMatch.reason}` : null,
    yearMatch.reason ? `Year: ${yearMatch.reason}` : null,
    document.featured ? "Featured boost" : null,
    normalizedQuery ? `Popularity boost: ${document.popularity}` : null,
  ].filter((value): value is string => value !== null);

  return {
    ...document,
    score,
    matchedFields,
    matchReasons,
    snippet: buildSnippet(document, query, tokens),
  };
}

export function searchDocuments(
  documents: SearchDocument[],
  query: SearchQuery,
): SearchResponse {
  const tokens = tokenizeQuery(query.query);
  const normalizedQuery = normalize(query.query);

  const scored = documents
    .map((document) => scoreDocument(document, query.query, tokens))
    .filter((document) => {
      if (!normalizedQuery) return true;
      return document.score > 0;
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

  const signalCounts = new Map<string, number>();
  for (const item of sorted) {
    for (const reason of item.matchReasons) {
      const key = reason.split(":")[0] ?? reason;
      signalCounts.set(key, (signalCounts.get(key) ?? 0) + 1);
    }
  }

  const signals = [...signalCounts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, 6);

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
    signals,
  };
}
