import { describe, expect, it } from "vitest";

import type { SearchDocument } from "@pontistudios/db";

import { searchDocuments } from "./search.server";

const DOCS: SearchDocument[] = [
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
    createdAt: new Date("2025-01-03T00:00:00.000Z"),
    updatedAt: new Date("2025-01-03T00:00:00.000Z"),
  },
];

const PAGINATION_DOCS: SearchDocument[] = Array.from({ length: 7 }, (_, index) => ({
  ...DOCS[0],
  id: 100 + index,
  title: `Signal Atlas ${index + 1}`,
  year: 2018 + index,
  popularity: 20 + index,
  sourceUrl: `https://variety.com/2026/film/news/signal-atlas-${index + 1}/`,
  publishedAt: new Date(`2025-02-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
  searchText: `signal atlas ${index + 1}`,
  createdAt: new Date(`2025-02-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
  updatedAt: new Date(`2025-02-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
}));

describe("searchDocuments", () => {
  it("ranks title matches ahead of weaker body matches", () => {
    const result = searchDocuments(DOCS, {
      query: "movie",
      page: 1,
      pageSize: 10,
      sort: "relevance",
    });

    expect(result.total).toBe(2);
    expect(result.results[0]?.title).toBe("Signal Atlas");
    expect(result.results[0]?.matchedFields).toContain("Tags");
    expect(result.results[0]?.matchReasons.join(" ")).toContain("Phrase match");
    expect(result.facets.kinds).toEqual([{ value: "movie", count: 2 }]);
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
      query: "workflow",
      page: 1,
      pageSize: 10,
      sort: "relevance",
    });

    expect(result.results[0]?.snippet.toLowerCase()).toContain("workflow");
    expect(
      result.results[0]?.matchReasons.some(
        (reason) => reason.startsWith("Summary") || reason.startsWith("Body"),
      ),
    ).toBe(true);
  });
});
