import type { SearchDocument, SearchDocumentKind } from "@pontistudios/db";

export type SearchSortMode = "relevance" | "newest" | "title";

export type SearchQuery = {
  query: string;
  page: number;
  pageSize: number;
  sort: SearchSortMode;
};

export type SearchFacetCount = {
  value: string;
  count: number;
};

export type SearchResult = SearchDocument & {
  score: number;
  matchedFields: string[];
  matchReasons: string[];
  snippet: string;
};

export type SearchResponse = {
  query: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  results: SearchResult[];
  facets: {
    kinds: Array<SearchFacetCount & { value: SearchDocumentKind }>;
    categories: SearchFacetCount[];
    tags: SearchFacetCount[];
    years: {
      min: number;
      max: number;
    } | null;
  };
  signals: Array<SearchFacetCount & { value: string }>;
};
