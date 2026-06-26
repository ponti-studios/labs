import { describe, expect, it } from "vitest";

import type { SearchDocument } from "@pontistudios/db";

import { searchDocuments } from "./search.server";

type TestDocument = SearchDocument & { lexicalRank: number };

const DOCS: TestDocument[] = [
  {
    id: 1,
    kind: "movie",
    title: "Signal Atlas",
    subtitle: "Variety News · Avery Stone",
    summary: "A design and systems movie about search, structure, and product intuition.",
    body: "Readers looking for search or systems will find strong phrase and prefix matches.",
    category: "News",
    location: "Variety · Film",
    year: 2024,
    sourceUrl: "https://variety.com/2026/film/news/signal-atlas-1234567890/",
    publishedAt: new Date("2025-01-01T00:00:00.000Z"),
    tags: ["news", "systems", "movie", "featured"],
    featured: true,
    popularity: 90,
    searchText: "signal atlas avery stone design systems search",
    searchVector: "" as string,
    embedding: [1, 0, 0],
    lexicalRank: 0.18,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
  },
  {
    id: 2,
    kind: "tv",
    title: "Nina Park",
    subtitle: "TV News · Northstar Labs",
    summary: "A design lead in New York who talks about search, workflow, and growth.",
    body: "This tv record highlights prefix matches for names, companies, cities, and atlas references.",
    category: "News",
    location: "Variety · TV",
    year: 2022,
    sourceUrl: "https://variety.com/2026/tv/news/nina-park-1234567891/",
    publishedAt: new Date("2025-01-02T00:00:00.000Z"),
    tags: ["news", "search", "tv", "directory"],
    featured: false,
    popularity: 65,
    searchText: "nina park design lead northstar labs new york search",
    searchVector: "" as string,
    embedding: [0.9, 0.05, 0.05],
    lexicalRank: 0.06,
    createdAt: new Date("2025-01-02T00:00:00.000Z"),
    updatedAt: new Date("2025-01-02T00:00:00.000Z"),
  },
  {
    id: 3,
    kind: "movie",
    title: "Quiet Harbor",
    subtitle: "Film Review · Leah Bennett",
    summary: "A memoir about a coastal archive and the people who keep it alive.",
    body: "It should only match loosely, if at all, when the search is specific and the fallback is weak.",
    category: "Review",
    location: "Variety · Film",
    year: 2019,
    sourceUrl: "https://variety.com/2026/film/reviews/quiet-harbor-1234567892/",
    publishedAt: new Date("2025-01-03T00:00:00.000Z"),
    tags: ["memoir", "archive", "movie"],
    featured: false,
    popularity: 30,
    searchText: "quiet harbor leah bennett memoir archive",
    searchVector: "" as string,
    embedding: [0, 1, 0],
    lexicalRank: 0,
    createdAt: new Date("2025-01-03T00:00:00.000Z"),
    updatedAt: new Date("2025-01-03T00:00:00.000Z"),
  },
];

const PAGINATION_DOCS: TestDocument[] = Array.from({ length: 7 }, (_, index) => ({
  ...DOCS[0],
  id: 100 + index,
  title: `Signal Atlas ${index + 1}`,
  year: 2018 + index,
  popularity: 20 + index,
  sourceUrl: `https://variety.com/2026/film/news/signal-atlas-${index + 1}/`,
  publishedAt: new Date(`2025-02-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
  searchText: `signal atlas ${index + 1}`,
  searchVector: "" as string,
  embedding: [1, 0, 0],
  lexicalRank: 0.1 + index * 0.01,
  createdAt: new Date(`2025-02-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
  updatedAt: new Date(`2025-02-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
}));

describe("searchDocuments", () => {
  it("ranks stronger lexical hits ahead of weaker ones", () => {
    const result = searchDocuments(DOCS, {
      query: "search",
      page: 1,
      pageSize: 10,
      sort: "relevance",
    });

    expect(result.total).toBe(2);
    expect(result.results[0]?.title).toBe("Signal Atlas");
    expect(result.results[0]?.matchedFields).toEqual(
      expect.arrayContaining(["Summary", "Body", "Search text"]),
    );
    expect(result.results[0]?.matchReasons.join(" ")).toContain("Lexical rank");
    expect(result.facets.kinds).toEqual(
      expect.arrayContaining([
        { value: "movie", count: 1 },
        { value: "tv", count: 1 },
      ]),
    );
    expect(result.signals.length).toBeGreaterThan(0);
  });

  it("paginates and sorts by newest when requested", () => {
    const result = searchDocuments(PAGINATION_DOCS, {
      query: "",
      page: 1,
      pageSize: 6,
      sort: "newest",
    });

    expect(result.total).toBe(7);
    expect(result.totalPages).toBe(2);
    expect(result.results[0]?.year).toBe(2024);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(false);
  });

  it("builds an explanatory snippet for the top match", () => {
    const result = searchDocuments(DOCS, {
      query: "search",
      page: 1,
      pageSize: 10,
      sort: "relevance",
    });

    expect(result.results[0]?.snippet.toLowerCase()).toContain("search");
    expect(
      result.results[0]?.matchReasons.some(
        (reason) => reason.startsWith("Matched fields") || reason.startsWith("Lexical rank"),
      ),
    ).toBe(true);
  });

  it("uses semantic similarity when lexical rank is weak", () => {
    const result = searchDocuments(DOCS, {
      query: "coastal archive",
      page: 1,
      pageSize: 10,
      sort: "relevance",
      queryEmbedding: [0, 1, 0],
    });

    expect(result.results[0]?.title).toBe("Quiet Harbor");
    expect(result.results[0]?.semanticScore).toBeGreaterThan(result.results[0]?.lexicalScore);
    expect(result.results[0]?.matchReasons.join(" ")).toContain("Semantic similarity");
  });
});
