import { MetricCard } from "@ponti-studios/ui/data-display";
import { EmptyState } from "@ponti-studios/ui/feedback";
import { PaginationControls } from "@ponti-studios/ui/navigation";
import { Button, StatusBadge, type StatusBadgeConfig } from "@ponti-studios/ui/primitives";
import { Link, useLoaderData, useSearchParams, type LoaderFunctionArgs } from "react-router";

import type { GameStatus } from "~/lib/realitea";
import { loadPuzzleHistory, type PuzzleHistoryPage } from "~/lib/realitea/history.server";
import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";

import { RealiTeaTile } from "./realitea-tile";
import { resolveReturnTo } from "./return-to.server";

import "./realitea.css";

const HISTORY_PAGE_SIZE = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const loginUrl = buildHominemLoginUrl(resolveReturnTo(request));
  const user = await getHominemUser(request);

  if (!user) {
    return Response.json({ signedIn: false as const, loginUrl });
  }

  const url = new URL(request.url);
  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;

  const history = await loadPuzzleHistory(user.id, { page, pageSize: HISTORY_PAGE_SIZE });

  return Response.json({ signedIn: true as const, loginUrl, history });
}

export type LoaderData =
  | { signedIn: false; loginUrl: string }
  | { signedIn: true; loginUrl: string; history: PuzzleHistoryPage };

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
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
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

  const { history } = data;
  const hasPlayed = history.stats.gamesPlayed > 0;
  const unplayed = history.playableUnplayedDateKeys;
  const unplayedShown = unplayed.slice(-10).reverse();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <p className="ui-eyebrow">RealiTea</p>
        <h1 className="display-2">Your history</h1>
      </header>

      {hasPlayed && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Played" value={history.stats.gamesPlayed} />
          <MetricCard label="Win rate" value={`${Math.round(history.stats.winRate * 100)}%`} />
          <MetricCard label="Current streak" value={history.stats.currentStreak} />
          <MetricCard label="Best streak" value={history.stats.maxStreak} />
        </div>
      )}

      {unplayedShown.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="ui-eyebrow">Puzzles you haven&apos;t played</p>
          <div className="flex flex-wrap gap-2">
            {unplayedShown.map((dateKey) => (
              <Button key={dateKey} asChild variant="outline" size="sm">
                <Link to={`/games/realitea/${dateKey}`}>{formatShortDate(dateKey)}</Link>
              </Button>
            ))}
            {unplayed.length > unplayedShown.length && (
              <span className="text-muted-foreground self-center text-xs">
                +{unplayed.length - unplayedShown.length} more
              </span>
            )}
          </div>
        </div>
      )}

      {history.rows.length === 0 ? (
        <EmptyState
          title="No puzzles played yet"
          description="Jump into today's puzzle to start your streak."
          action={
            <Button asChild variant="default">
              <Link to="/games/realitea">Play today&apos;s puzzle</Link>
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
                  to={`/games/realitea/${row.dateKey}`}
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

      <PaginationControls
        currentPage={history.page - 1}
        totalPages={history.totalPages}
        onPageChange={(zeroIndexedPage) =>
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", String(zeroIndexedPage + 1));
            return next;
          })
        }
      />
    </div>
  );
}
