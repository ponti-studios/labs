import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pontistudios/ui/forms";
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideFilm,
  LucideSearch,
  LucideTv,
  LucideX,
} from "lucide-react";
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
    .replace(/[''"]/g, "")
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
      <mark key={`${index}-${match[0]}`} className="bg-accent/25 text-primary rounded-xs px-0.5">
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

function KindBadge({ kind }: { kind: SearchDocumentKind }) {
  const isMovie = kind === "movie";
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-medium tracking-[0.06em] uppercase",
        isMovie ? "bg-accent/8 text-primary/60" : "bg-accent/15 text-on-accent/70",
      ].join(" ")}
    >
      {isMovie ? <LucideFilm className="h-3 w-3" /> : <LucideTv className="h-3 w-3" />}
      {isMovie ? "Film" : "TV"}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, (score / 120) * 100));
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className="text-primary/50 text-[12px] leading-none font-medium tabular-nums">
        {score.toFixed(1)}
      </span>
      <div
        className="bg-border h-[3px] w-14 overflow-hidden rounded-full"
        aria-label={`Relevance score ${score.toFixed(1)}`}
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={120}
      >
        <div
          className="bg-accent h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
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
  const publishedDate = new Date(result.publishedAt);
  const publishedLabel = Number.isNaN(publishedDate.getTime())
    ? String(result.year)
    : new Intl.DateTimeFormat("en", {
        month: "short",
        year: "numeric",
      }).format(publishedDate);

  return (
    <article
      className="group border-default hover:bg-inset/40 relative -mx-4 grid items-start gap-4 rounded-lg border-b px-4 py-5 transition-colors duration-150 last:border-0 md:-mx-6 md:grid-cols-[2rem_minmax(0,1fr)_5rem] md:px-6"
      style={{
        animation: "fade-slide-in 200ms cubic-bezier(0,0,0.2,1) both",
        animationDelay: `${index * 30}ms`,
      }}
    >
      {/* Rank */}
      <div className="hidden justify-end pt-0.5 md:flex">
        <span className="text-primary/30 text-[11px] font-medium tracking-[0.04em] tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 space-y-2">
        <a
          href={result.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-primary decoration-border hover:decoration-foreground/40 block min-w-0 text-[16px] leading-[1.35] font-semibold tracking-[-0.01em] underline-offset-[3px] transition-colors duration-150 hover:underline"
        >
          <span className="line-clamp-2">{highlightText(result.title, query)}</span>
        </a>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <KindBadge kind={result.kind} />
          <span className="text-secondary text-[13px]">
            {highlightText(result.subtitle, query)}
          </span>
          <span className="text-secondary/40 text-[11px]">·</span>
          <span className="text-secondary/70 text-[12px] tabular-nums">{publishedLabel}</span>
          {result.location && (
            <>
              <span className="text-secondary/40 text-[11px]">·</span>
              <span className="text-secondary/70 text-[12px]">{result.location}</span>
            </>
          )}
        </div>

        <p className="text-secondary line-clamp-2 max-w-[68ch] text-[14px] leading-[1.55]">
          {highlightText(result.snippet, query)}
        </p>
      </div>

      {/* Score */}
      <div className="hidden items-start justify-end pt-0.5 md:flex">
        <ScoreBar score={result.finalScore} />
      </div>

      {/* Mobile rank + score row */}
      <div className="text-secondary/50 flex items-center justify-between text-[11px] md:hidden">
        <span className="font-medium tabular-nums">#{index + 1}</span>
        <ScoreBar score={result.finalScore} />
      </div>
    </article>
  );
}

function SkeletonLine({ width, height = "h-4" }: { width: string; height?: string }) {
  return <div className={`${height} ${width} skeleton-shimmer rounded-[4px]`} />;
}

function ResultSkeletonRow({ index }: { index: number }) {
  return (
    <article
      aria-hidden="true"
      className="border-default grid items-start gap-4 border-b py-5 last:border-0 md:grid-cols-[2rem_minmax(0,1fr)_5rem]"
      style={{ opacity: Math.max(0.3, 1 - index * 0.15) }}
    >
      <div className="hidden md:block" />
      <div className="min-w-0 space-y-2.5">
        <SkeletonLine width="w-3/4" height="h-[18px]" />
        <div className="flex items-center gap-2">
          <SkeletonLine width="w-10" height="h-5" />
          <SkeletonLine width="w-32" />
          <SkeletonLine width="w-16" />
        </div>
        <div className="space-y-1.5 pt-0.5">
          <SkeletonLine width="w-full" />
          <SkeletonLine width="w-4/5" />
        </div>
      </div>
      <div className="hidden flex-col items-end gap-2 pt-0.5 md:flex">
        <SkeletonLine width="w-8" height="h-[12px]" />
        <SkeletonLine width="w-14" height="h-[3px]" />
      </div>
    </article>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        active ? "bg-accent text-on-accent" : "text-secondary hover:text-primary hover:bg-inset",
      ].join(" ")}
    >
      {children}
    </button>
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
      if (!response.ok) throw new Error("Failed to load search results");
      return (await response.json()) as SearchResponse;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  const data = queryResult.data;
  const isLoading = queryResult.isPending && !data;

  const visibleResults = useMemo(() => {
    const results = data?.results ?? [];
    return results.filter((result) => matchesKind(kindFilter, result.kind));
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

  const totalResults = kindCounts.all;
  const hasActiveFilter = kindFilter !== "all";

  return (
    <div className="bg-canvas text-primary min-h-full w-full">
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
        {/* ── Search header ── */}
        <header className="space-y-4">
          {/* Hero search bar */}
          <div className="relative">
            <LucideSearch
              className="text-secondary pointer-events-none absolute top-1/2 left-5 h-[18px] w-[18px] -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="search-studio-query"
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search titles, stars, studios, franchises…"
              autoComplete="off"
              spellCheck="false"
              className="border-default bg-canvas text-primary placeholder:text-secondary/60 focus:border-focus/50 focus:ring-focus/30 h-14 w-full rounded-xl border pr-14 pl-[3.25rem] text-[16px] transition-[border-color,box-shadow] duration-150 focus:shadow-[0_0_0_4px_var(--color-ring-focus,rgba(160,112,58,0.12))] focus:ring-2 focus:outline-none"
            />
            {query.length > 0 && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => handleQueryChange("")}
                className="text-secondary hover:bg-inset hover:text-primary focus-visible:ring-focus absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
              >
                <LucideX className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Kind filters */}
            <div className="flex items-center gap-1.5">
              <FilterPill
                active={kindFilter === "all"}
                onClick={() => {
                  setKindFilter("all");
                  setPage(1);
                }}
              >
                All
                {totalResults > 0 && (
                  <span
                    className={kindFilter === "all" ? "text-on-accent/60" : "text-secondary/60"}
                  >
                    {totalResults.toLocaleString()}
                  </span>
                )}
              </FilterPill>
              <FilterPill
                active={kindFilter === "movie"}
                onClick={() => {
                  setKindFilter("movie");
                  setPage(1);
                }}
              >
                <LucideFilm className="h-3.5 w-3.5" />
                Films
                {kindCounts.movie > 0 && (
                  <span
                    className={kindFilter === "movie" ? "text-on-accent/60" : "text-secondary/60"}
                  >
                    {kindCounts.movie.toLocaleString()}
                  </span>
                )}
              </FilterPill>
              <FilterPill
                active={kindFilter === "tv"}
                onClick={() => {
                  setKindFilter("tv");
                  setPage(1);
                }}
              >
                <LucideTv className="h-3.5 w-3.5" />
                TV
                {kindCounts.tv > 0 && (
                  <span className={kindFilter === "tv" ? "text-on-accent/60" : "text-secondary/60"}>
                    {kindCounts.tv.toLocaleString()}
                  </span>
                )}
              </FilterPill>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-secondary hover:text-primary focus-visible:ring-focus inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <LucideX className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Sort + pagination */}
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={(v) => handleSortChange(v as SearchSortMode)}>
                <SelectTrigger className="border-default bg-canvas h-9 w-[9.5rem] text-[13px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="border-default divide-border flex items-center divide-x overflow-hidden rounded-lg border">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data?.hasPrev}
                  aria-label="Previous page"
                  className="text-secondary hover:bg-inset hover:text-primary focus-visible:ring-focus flex h-9 w-9 items-center justify-center transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-30"
                >
                  <LucideChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-secondary flex h-9 items-center px-3 text-[12px] font-medium tabular-nums select-none">
                  {page}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => (data?.hasNext ? p + 1 : p))}
                  disabled={!data?.hasNext}
                  aria-label="Next page"
                  className="text-secondary hover:bg-inset hover:text-primary focus-visible:ring-focus flex h-9 w-9 items-center justify-center transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-30"
                >
                  <LucideChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Results ── */}
        <main>
          {isLoading ? (
            <div>
              {/* Column header */}
              <div className="border-default hidden gap-4 border-b pb-3 md:grid md:grid-cols-[2rem_minmax(0,1fr)_5rem]">
                <div />
                <span className="text-secondary/50 text-[11px] font-medium tracking-[0.08em] uppercase">
                  Result
                </span>
                <span className="text-secondary/50 text-right text-[11px] font-medium tracking-[0.08em] uppercase">
                  Score
                </span>
              </div>
              {Array.from({ length: 6 }, (_, i) => (
                <ResultSkeletonRow key={i} index={i} />
              ))}
            </div>
          ) : visibleResults.length === 0 ? (
            <div className="flex min-h-[28rem] flex-col items-center justify-center gap-4 text-center">
              <div className="border-default bg-inset/30 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed">
                <LucideSearch className="text-secondary/40 h-7 w-7" />
              </div>
              <div className="max-w-[22rem] space-y-1.5">
                <h3 className="text-primary text-[16px] font-semibold tracking-[-0.01em]">
                  No results on this page
                </h3>
                <p className="text-secondary text-[14px] leading-[1.55]">
                  The server found matches but the active filter removed this slice. Clear filters
                  or move to another page.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="border-default text-primary hover:bg-inset focus-visible:ring-focus rounded-lg border px-4 py-2 text-[13px] font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="bg-accent text-on-accent focus-visible:ring-focus rounded-lg px-4 py-2 text-[13px] font-medium transition-opacity duration-150 hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
                >
                  Back to page 1
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Column header */}
              <div className="border-default hidden gap-4 border-b pb-3 md:grid md:grid-cols-[2rem_minmax(0,1fr)_5rem]">
                <div />
                <span className="text-secondary/50 text-[11px] font-medium tracking-[0.08em] uppercase">
                  {totalResults > 0
                    ? `${totalResults.toLocaleString()} result${totalResults === 1 ? "" : "s"}`
                    : "Result"}
                </span>
                <span className="text-secondary/50 text-right text-[11px] font-medium tracking-[0.08em] uppercase">
                  Score
                </span>
              </div>

              {visibleResults.map((result, index) => (
                <ResultRow key={result.id} result={result} query={query} index={index} />
              ))}

              {/* Footer pagination */}
              {(data?.hasPrev || data?.hasNext) && (
                <div className="border-default mt-2 flex items-center justify-between border-t pt-6">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!data?.hasPrev}
                    className="text-secondary hover:text-primary focus-visible:ring-focus inline-flex items-center gap-2 rounded text-[13px] font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30"
                  >
                    <LucideChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="text-secondary/60 text-[12px] tabular-nums">Page {page}</span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => (data?.hasNext ? p + 1 : p))}
                    disabled={!data?.hasNext}
                    className="text-secondary hover:text-primary focus-visible:ring-focus inline-flex items-center gap-2 rounded text-[13px] font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30"
                  >
                    Next
                    <LucideChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
