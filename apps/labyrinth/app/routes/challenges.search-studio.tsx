import {
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
      className="grid gap-3 border-b border-border py-4 last:border-0 md:grid-cols-[minmax(0,1fr)_8.5rem] md:gap-5"
      style={{ animation: "fade-slide-in 240ms ease-out both", animationDelay: `${index * 24}ms` }}
    >
      <div className="min-w-0 space-y-2">
        <a
          href={result.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="block min-w-0 text-[16px] font-medium leading-6 tracking-tight text-foreground underline-offset-4 hover:underline sm:text-[17px]"
        >
          <span className="line-clamp-2">{highlightText(result.title, query)}</span>
        </a>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-5 text-muted-foreground">
          <span className="uppercase tracking-[0.16em]">{kindLabel}</span>
          <span className="hidden sm:inline text-muted-foreground">•</span>
          <span>{highlightText(result.subtitle, query)}</span>
          <span className="hidden sm:inline text-muted-foreground">•</span>
          <span>{publishedLabel}</span>
          <span className="hidden sm:inline text-muted-foreground">•</span>
          <span>{result.location}</span>
        </div>

        <p className="line-clamp-2 max-w-4xl text-[14px] leading-6 text-muted-foreground">
          {highlightText(result.snippet, query)}
        </p>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground md:flex-col md:items-end md:justify-center md:text-right">
        <span className="font-medium tabular-nums uppercase tracking-[0.18em] text-foreground/70">
          #{index + 1}
        </span>
        <span className="hidden md:block h-px w-3 bg-border" />
        <span className="tabular-nums text-sm text-foreground">
          {result.finalScore.toFixed(1)} score
        </span>
      </div>
    </article>
  );
}

function ResultSkeletonRow({ index }: { index: number }) {
  return (
    <article
      aria-hidden="true"
      className="grid gap-3 border-b border-border py-4 last:border-0 md:grid-cols-[minmax(0,1fr)_8.5rem] md:gap-5"
      style={{ animationDelay: `${index * 24}ms` }}
    >
      <div className="min-w-0 space-y-2">
        <div className="h-6 w-3/4 rounded-full bg-muted" />
        <div className="flex gap-2">
          <div className="h-4 w-12 rounded-full bg-muted" />
          <div className="h-4 w-28 rounded-full bg-muted" />
          <div className="h-4 w-20 rounded-full bg-muted" />
          <div className="h-4 w-16 rounded-full bg-muted" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="h-4 w-full rounded-full bg-muted" />
          <div className="h-4 w-5/6 rounded-full bg-muted" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground md:flex-col md:items-end md:justify-center md:text-right">
        <div className="h-3 w-8 rounded-full bg-muted" />
        <div className="hidden md:block h-px w-3 bg-muted" />
        <div className="h-3 w-16 rounded-full bg-muted" />
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
    <div className="min-h-full w-full bg-background text-foreground">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="space-y-3">
            <p className="ui-eyebrow">Search studio</p>
            <h1 className="heading-1">Find the signal fast.</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Search the corpus, narrow it instantly, and browse results in a clean flow without
              losing your place.
            </p>
          </div>

          <div className="ui-flat-card flex items-end justify-between gap-4">
            <div>
              <div className="ui-data-label">Visible</div>
              <div className="ui-data-value">{localVisibleTotal}</div>
            </div>
            <div className="text-right">
              <div className="ui-data-label">Page</div>
              <div className="ui-data-value">
                {page}
                <span className="text-muted-foreground text-sm">/{data?.totalPages ?? 0}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="ui-flat-card space-y-4">
          <div className="relative">
            <label htmlFor="search-studio-query" className="sr-only">
              Search shows, films, titles, stars, studios, or franchises
            </label>
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

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
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

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Select value={sort} onValueChange={(value) => handleSortChange(value as SearchSortMode)}>
                <SelectTrigger className="h-11 w-full border-border bg-background">
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

              <div className="flex items-center justify-end gap-2">
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
        </section>

        <section className="flex items-center justify-between gap-3 px-1">
          <div>
            <div className="ui-eyebrow">Results</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {data ? `${data.total} total across ${data.totalPages} pages` : "Loading corpus..."}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {kindFilter === "all" ? "All formats" : `${kindFilter.toUpperCase()} only`}
          </div>
        </section>

        <main className="flex-1 pr-1">
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
