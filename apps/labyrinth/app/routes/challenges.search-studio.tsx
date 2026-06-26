import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  Spinner,
} from "@pontistudios/ui";
import { LucideChevronLeft, LucideChevronRight, LucideSearch, LucideX } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type ReactNode, useDeferredValue, useMemo, useState } from "react";

import type { SearchDocumentKind } from "@pontistudios/db";

import type { SearchResponse, SearchSortMode } from "~/lib/search-types";

const PAGE_SIZE = 18;
const SORT_OPTIONS: Array<{ value: SearchSortMode; label: string }> = [
  { value: "relevance", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "title", label: "Title" },
];

type KindFilter = "all" | SearchDocumentKind;

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function highlightText(value: string, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return value;

  const escaped = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(escaped, "ig");
  const matches = [...value.matchAll(pattern)];
  if (matches.length === 0) return value;

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(value.slice(lastIndex, index));
    }

    parts.push(
      <mark
        key={`${index}-${match[0]}`}
        className="bg-accent/35 text-inherit px-0.5 rounded-sm"
      >
        {match[0]}
      </mark>,
    );
    lastIndex = index + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push(value.slice(lastIndex));
  }

  return <>{parts}</>;
}

function matchesKind(kindFilter: KindFilter, kind: SearchDocumentKind): boolean {
  return kindFilter === "all" || kindFilter === kind;
}

function ResultRow({
  result,
  query,
  index,
}: {
  result: SearchResponse["results"][number];
  query: string;
  index: number;
}) {
  const isMovie = result.kind === "movie";
  const kindLabel = isMovie ? "Movie" : "TV";
  const publishedDate = new Date(result.publishedAt);
  const publishedLabel = Number.isNaN(publishedDate.getTime())
    ? `Published ${result.year}`
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(publishedDate);

  return (
    <article
      className="grid gap-4 border-b border-border py-5 last:border-0 md:grid-cols-[minmax(0,1fr)_auto]"
      style={{ animation: "fade-slide-in 240ms ease-out both", animationDelay: `${index * 24}ms` }}
    >
      <div className="flex gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-border bg-muted text-foreground"
            >
              {kindLabel}
            </Badge>
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 text-lg font-semibold leading-snug tracking-tight text-foreground underline-offset-4 hover:underline"
            >
              {highlightText(result.title, query)}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>{highlightText(result.subtitle, query)}</span>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <span>{publishedLabel}</span>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <span>{result.location}</span>
          </div>

          <p className="max-w-4xl text-sm leading-6 text-foreground">
            {highlightText(result.snippet, query)}
          </p>

          <Badge variant="secondary" className="mt-1 bg-muted text-foreground">
            {result.category}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground md:justify-end md:text-right">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em]">Rank</span>
        <span className="text-lg font-semibold tabular-nums text-foreground">{index + 1}</span>
        <span>{result.featured ? "Featured" : "Catalog"}</span>
        <span>{result.finalScore.toFixed(1)} score</span>
        <span className="tabular-nums">
          L {result.lexicalScore.toFixed(1)} · S {result.semanticScore.toFixed(1)}
        </span>
      </div>
    </article>
  );
}

function ResultSkeletonRow({ index }: { index: number }) {
  return (
    <article
      aria-hidden="true"
      className="grid gap-4 border-b border-border py-5 last:border-0 md:grid-cols-[minmax(0,1fr)_auto]"
      style={{ animationDelay: `${index * 24}ms` }}
    >
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted">
          <div className="h-4 w-4 rounded-sm bg-muted-foreground/25" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 rounded-full border border-border bg-muted" />
            <div className="h-5 w-3/5 rounded-full bg-muted" />
          </div>
          <div className="flex gap-2">
            <div className="h-4 w-24 rounded-full bg-muted" />
            <div className="h-4 w-20 rounded-full bg-muted" />
            <div className="h-4 w-16 rounded-full bg-muted" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-4 w-full rounded-full bg-muted" />
            <div className="h-4 w-5/6 rounded-full bg-muted" />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="h-6 w-20 rounded-full border border-border bg-muted" />
            <div className="h-6 w-24 rounded-full border border-border bg-muted" />
            <div className="h-6 w-28 rounded-full border border-border bg-muted" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground md:justify-end md:text-right">
        <div className="h-3 w-10 rounded-full bg-muted" />
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="h-3 w-12 rounded-full bg-muted" />
        <div className="h-3 w-14 rounded-full bg-muted" />
      </div>
    </article>
  );
}

export default function SearchStudio() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SearchSortMode>("relevance");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const searchKey = deferredQuery.trim();
  const queryResult = useQuery<SearchResponse>({
    queryKey: ["search", searchKey, page, sort],
    queryFn: async () => {
      const params = new URLSearchParams({
        query: searchKey,
        page: String(page),
        limit: String(PAGE_SIZE),
        sort,
      });
      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load search results");
      }
      return (await response.json()) as SearchResponse;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  const data = queryResult.data;
  const isLoading = queryResult.isPending && !data;

  const visibleResults = useMemo(() => {
    const results = data?.results ?? [];
    return results.filter((result) => {
      if (!matchesKind(kindFilter, result.kind)) return false;
      return true;
    });
  }, [data, kindFilter]);

  const kindCounts = {
    all: data?.facets.kinds.reduce((sum, item) => sum + item.count, 0) ?? 0,
    movie: data?.facets.kinds.find((item) => item.value === "movie")?.count ?? 0,
    tv: data?.facets.kinds.find((item) => item.value === "tv")?.count ?? 0,
  };

  const clearFilters = () => {
    setKindFilter("all");
    setPage(1);
  };

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setPage(1);
  };

  const handleSortChange = (nextSort: SearchSortMode) => {
    setSort(nextSort);
    setPage(1);
  };

  const localVisibleTotal = visibleResults.length;

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto flex h-[calc(100dvh-3.5rem)] min-h-0 w-full max-w-7xl flex-col gap-3 overflow-hidden px-4 py-2 md:px-6 md:py-3">
        <header className="sticky top-4 z-20 rounded-2xl border border-border bg-background/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-5">
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <LucideSearch className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-studio-query"
                type="text"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                placeholder="Search shows, films, titles, stars, studios, or franchises..."
                className="h-12 w-full border-border bg-background pr-12 pl-11 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => handleQueryChange("")}
                  className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LucideX className="h-4 w-4" />
                </button>
                )}
              </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Tabs
                  value={kindFilter}
                  onValueChange={(value) => {
                    setKindFilter(value as KindFilter);
                    setPage(1);
                  }}
                >
                  <TabsList className="h-auto bg-background p-0.5">
                    <TabsTrigger value="all" className="gap-2 px-3 py-1.5">
                      <span>All</span>
                      <span className="text-xs text-muted-foreground">{kindCounts.all}</span>
                    </TabsTrigger>
                    <TabsTrigger value="movie" className="gap-2 px-3 py-1.5">
                      <span>Movies</span>
                      <span className="text-xs text-muted-foreground">{kindCounts.movie}</span>
                    </TabsTrigger>
                    <TabsTrigger value="tv" className="gap-2 px-3 py-1.5">
                      <span>TV</span>
                      <span className="text-xs text-muted-foreground">{kindCounts.tv}</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={sort} onValueChange={(value) => handleSortChange(value as SearchSortMode)}>
                  <SelectTrigger className="h-11 w-[10rem] border-border bg-background">
                    <SelectValue placeholder="Sort results" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={!data?.hasPrev}
                    aria-label="Previous page"
                  >
                    <LucideChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((current) => (data?.hasNext ? current + 1 : current))}
                    disabled={!data?.hasNext}
                    aria-label="Next page"
                  >
                    <LucideChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto pr-1">
          {isLoading && !data ? (
            <div className="min-h-[32rem] border-t border-border px-0">
              <div className="flex items-center gap-3 py-6 text-muted-foreground">
                <Spinner />
                Searching the corpus...
              </div>
              <div className="divide-y divide-border border-b border-border">
                {Array.from({ length: 5 }, (_, index) => (
                  <ResultSkeletonRow key={index} index={index} />
                ))}
              </div>
            </div>
          ) : localVisibleTotal === 0 ? (
            <div className="min-h-[32rem] border-t border-dashed border-border p-10 text-center">
              <h3 className="text-lg font-semibold text-foreground">No results on this page</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The server found matches, but the instant filters removed this slice. Clear the local
                filters or move to another page.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
                <Button type="button" variant="secondary" onClick={() => setPage(1)}>
                  Return to page 1
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-[32rem] divide-y divide-border border-t border-border">
              {visibleResults.map((result, index) => (
                <ResultRow key={result.id} result={result} query={query} index={index} />
              ))}
            </div>
          )}
        </main>
      </div>
  </div>
  );
}
