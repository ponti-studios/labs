import { EmptyState } from "@ponti-studios/ui/feedback";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ponti-studios/ui/overlays";
import { Button, StatusBadge, type StatusBadgeConfig } from "@ponti-studios/ui/primitives";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useSearchParams, type LoaderFunctionArgs } from "react-router";

import type { GameStatus } from "~/lib/realitea";
import { DEFAULT_REALITEA_GAME_SLUG } from "~/lib/realitea/generation/catalog";
import { loadPuzzleHistory, type PuzzleHistoryPage } from "~/lib/realitea/server/history.server";
import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";

import { RealiTeaTile } from "./realitea-tile";
import { resolveReturnTo } from "./return-to.server";

import "./realitea.css";

const UNPLAYED_PAGE_SIZE = 10;

export async function loader({ request }: LoaderFunctionArgs) {
  const loginUrl = buildHominemLoginUrl(resolveReturnTo(request));
  const user = await getHominemUser(request);

  if (!user) {
    return Response.json({ signedIn: false as const, loginUrl });
  }

  const url = new URL(request.url);
  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;
  const gameSlug = url.searchParams.get("game") ?? DEFAULT_REALITEA_GAME_SLUG;

  const history = await loadPuzzleHistory(user.id, { page }, gameSlug);

  return Response.json({ signedIn: true as const, loginUrl, history, gameSlug });
}

export type LoaderData =
  | { signedIn: false; loginUrl: string }
  | { signedIn: true; loginUrl: string; history: PuzzleHistoryPage; gameSlug: string };

export function meta() {
  return [
    { title: "RealiTea — History — Labyrinth" },
    { name: "description", content: "Every RealiTea puzzle you've played, and how you did." },
    { name: "robots", content: "noindex" },
  ];
}

const STATUS_CONFIG: Record<GameStatus, StatusBadgeConfig> = {
  solved: { label: "Solved", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
  playing: { label: "In progress", variant: "outline" },
};

function formatDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatShortDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface UnplayedSheetProps {
  dateKeys: readonly string[];
  gameSlug: string;
}

/** Newest-first, paginated locally — the loader already bounds this to a
 *  90-day lookback window, so no extra data fetch is needed to page it. */
function UnplayedSheet({ dateKeys, gameSlug }: UnplayedSheetProps) {
  const [page, setPage] = useState(0);
  const newestFirst = [...dateKeys].reverse();
  const totalPages = Math.max(1, Math.ceil(newestFirst.length / UNPLAYED_PAGE_SIZE));
  const shown = newestFirst.slice(page * UNPLAYED_PAGE_SIZE, (page + 1) * UNPLAYED_PAGE_SIZE);

  return (
    <Sheet onOpenChange={(open) => !open && setPage(0)}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="inline-flex gap-2">
          Unplayed
          {dateKeys.length > 0 && (
            <span className="text-muted-foreground text-xs">{dateKeys.length}</span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Puzzles you haven&apos;t played</SheetTitle>
        </SheetHeader>
        {shown.length === 0 ? (
          <p className="text-muted-foreground text-sm">You&apos;re all caught up.</p>
        ) : (
          <ul className="divide-border flex flex-col divide-y overflow-y-auto">
            {shown.map((dateKey) => (
              <li key={dateKey}>
                <Link
                  to={`/games/realitea/${dateKey}?game=${encodeURIComponent(gameSlug)}`}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-md px-2 py-3 text-sm transition-colors"
                >
                  {formatDate(dateKey)}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {totalPages > 1 && (
          <div className="mt-auto flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <span className="text-muted-foreground text-xs">
              {page + 1} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

interface WeekPaginationProps {
  history: PuzzleHistoryPage;
  onPageChange: (page: number) => void;
}

function WeekPagination({ history, onPageChange }: WeekPaginationProps) {
  if (history.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Previous week"
        disabled={!history.hasPrev}
        onClick={() => onPageChange(history.page - 1)}
      >
        <ChevronLeft aria-hidden />
      </Button>
      <span className="text-muted-foreground text-xs">
        Week of {formatShortDate(history.weekStartKey)}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Next week"
        disabled={!history.hasNext}
        onClick={() => onPageChange(history.page + 1)}
      >
        <ChevronRight aria-hidden />
      </Button>
    </div>
  );
}

type ErrorBoundaryProps = { error: Error };

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-muted-foreground text-xs tracking-[0.15em] uppercase">
        Something went wrong
      </p>
      <p className="text-muted-foreground text-xs">
        {error.message || "Your puzzle history couldn't load."}
      </p>
      <Button asChild variant="default" className="mt-2">
        <a href="/games/realitea">Back to today's puzzle</a>
      </Button>
    </div>
  );
}

export default function RealiTeaHistoryRoute() {
  const data = useLoaderData<LoaderData>();
  const [, setSearchParams] = useSearchParams();

  if (!data.signedIn) {
    return (
      <div
        className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10"
        data-testid="realitea-history-guest"
      >
        <EmptyState
          title="Sign in to see your puzzle history"
          description="Track every puzzle you've played, your win rate, and your streak."
          action={
            <Button asChild variant="default">
              <a href={data.loginUrl}>Sign in</a>
            </Button>
          }
        />
      </div>
    );
  }

  const { history, gameSlug } = data;
  const hasPlayed = history.stats.gamesPlayed > 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="ui-eyebrow">RealiTea</p>
          <h1 className="display-2">Your history</h1>
        </div>
        <UnplayedSheet dateKeys={history.playableUnplayedDateKeys} gameSlug={gameSlug} />
      </header>

      {hasPlayed && (
        <dl className="flex flex-wrap gap-x-5 gap-y-1.5">
          {[
            ["Played", history.stats.gamesPlayed],
            ["Win rate", `${Math.round(history.stats.winRate * 100)}%`],
            ["Streak", history.stats.currentStreak],
            ["Best streak", history.stats.maxStreak],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <dd className="text-lg font-semibold tabular-nums">{value}</dd>
              <dt className="text-muted-foreground text-xs">{label}</dt>
            </div>
          ))}
        </dl>
      )}

      {history.rows.length === 0 ? (
        <EmptyState
          title={hasPlayed ? "No puzzles played this week" : "No puzzles played yet"}
          description={
            hasPlayed
              ? "Try another week, or jump into today's puzzle."
              : "Jump into today's puzzle to start your streak."
          }
          action={
            <Button asChild variant="default">
              <Link to={`/games/realitea?game=${encodeURIComponent(gameSlug)}`}>Play today&apos;s puzzle</Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {history.rows.map((row) => {
            const lastGuess = row.guesses.at(-1);
            return (
              <li key={row.dateKey}>
                <Link
                  to={`/games/realitea/${row.dateKey}?game=${encodeURIComponent(gameSlug)}`}
                  className="hover:bg-muted/50 flex items-center gap-4 rounded-md px-2 py-4 transition-colors"
                >
                  {lastGuess && (
                    <div className="realitea-history-mini flex shrink-0 gap-(--realitea-tile-gap)">
                      {lastGuess.states.map((state, i) => (
                        <RealiTeaTile key={i} state={state} letter={lastGuess.word[i] ?? ""} />
                      ))}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{formatDate(row.dateKey)}</p>
                    {row.status === "playing" && (
                      <p className="text-muted-foreground truncate text-xs">{row.clue}</p>
                    )}
                  </div>
                  <StatusBadge status={row.status} config={STATUS_CONFIG} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <WeekPagination
        history={history}
        onPageChange={(page) =>
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", String(page));
            return next;
          })
        }
      />
    </div>
  );
}
