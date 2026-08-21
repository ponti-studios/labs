import { useState } from "react";
import { useLoaderData, useSearchParams, type LoaderFunctionArgs } from "react-router";

import { GameTile } from "../components/game";
import styles from "../components/pages/history-page.module.css";
import {
  Button,
  EmptyState,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  StatusBadge,
  type StatusBadgeConfig,
} from "../components/primitives";
import { BRAND_NAME } from "../config/brand";
import { getGameBySlug } from "../lib/data/games.server";
import { loadPuzzleHistory } from "../lib/data/history.server";
import type { PuzzleHistoryPage } from "../lib/player/history-types";
import type { GameStatus } from "../lib/puzzle";
import { getGameUser, loginUrl } from "../server/auth";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const topic = params.topic!;
  const game = await getGameBySlug(topic);
  if (!game || !game.active) {
    throw new Response("Unknown game", { status: 404 });
  }

  const url = new URL(request.url);
  const login = loginUrl(request);
  const user = await getGameUser(request);

  if (!user) {
    return { signedIn: false as const, loginUrl: login, gameSlug: topic };
  }

  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;

  const history = await loadPuzzleHistory(user.id, { page }, topic);

  return { signedIn: true as const, loginUrl: login, gameSlug: topic, history };
}

export default function HistoryRoute() {
  const props = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();

  if (!props.signedIn) {
    return (
      <div className={styles.guestWrap}>
        <EmptyState
          title="Sign in to see your puzzle history"
          description="Track every puzzle you've played, your win rate, and your streak."
          action={
            <Button asChild variant="default">
              <a href={props.loginUrl}>Sign in</a>
            </Button>
          }
        />
      </div>
    );
  }

  const { history, gameSlug } = props;
  const hasPlayed = history.stats.gamesPlayed > 0;

  const setPage = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(page));
      return prev;
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{BRAND_NAME}</p>
          <h1 className={styles.title}>Your history</h1>
        </div>
        <UnplayedSheet dateKeys={history.playableUnplayedDateKeys} gameSlug={gameSlug} />
      </header>

      {hasPlayed && (
        <dl className={styles.stats}>
          {(
            [
              ["Played", history.stats.gamesPlayed],
              ["Win rate", `${Math.round(history.stats.winRate * 100)}%`],
              ["Streak", history.stats.currentStreak],
              ["Best streak", history.stats.maxStreak],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className={styles.stat}>
              <dd className={styles.statValue}>{value}</dd>
              <dt className={styles.statLabel}>{label}</dt>
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
              <a href={`/${gameSlug}`}>Play today&apos;s puzzle</a>
            </Button>
          }
        />
      ) : (
        <ul className={styles.rowList}>
          {history.rows.map((row) => {
            const lastGuess = row.guesses.at(-1);
            return (
              <li key={row.dateKey}>
                <a className={styles.row} href={`/${gameSlug}/${row.dateKey}`}>
                  {lastGuess && (
                    <div className={`game-history-mini ${styles.rowMini}`}>
                      {lastGuess.states.map((state, i) => (
                        <GameTile key={i} state={state} letter={lastGuess.word[i] ?? ""} />
                      ))}
                    </div>
                  )}
                  <div className={styles.rowBody}>
                    <p className={styles.rowDate}>{formatDate(row.dateKey)}</p>
                    {row.status === "playing" && <p className={styles.rowClue}>{row.clue}</p>}
                  </div>
                  <StatusBadge status={row.status} config={STATUS_CONFIG} />
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <WeekPagination history={history} onPageChange={setPage} />
    </div>
  );
}

const UNPLAYED_PAGE_SIZE = 10;

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

function UnplayedSheet({ dateKeys, gameSlug }: { dateKeys: readonly string[]; gameSlug: string }) {
  const [page, setPage] = useState(0);
  const newestFirst = [...dateKeys].reverse();
  const totalPages = Math.max(1, Math.ceil(newestFirst.length / UNPLAYED_PAGE_SIZE));
  const shown = newestFirst.slice(page * UNPLAYED_PAGE_SIZE, (page + 1) * UNPLAYED_PAGE_SIZE);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <span className={styles.triggerLabel}>
            Unplayed
            {dateKeys.length > 0 && <span className={styles.unplayedCount}>{dateKeys.length}</span>}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Puzzles you haven&apos;t played</SheetTitle>
        </SheetHeader>
        {shown.length === 0 ? (
          <p className={styles.unplayedCount}>You&apos;re all caught up.</p>
        ) : (
          <ul className={styles.unplayedList}>
            {shown.map((dateKey) => (
              <li key={dateKey}>
                <a className={styles.unplayedLink} href={`/${gameSlug}/${dateKey}`}>
                  {formatDate(dateKey)}
                </a>
              </li>
            ))}
          </ul>
        )}
        {totalPages > 1 && (
          <div className={styles.unplayedFooter}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <span aria-hidden>‹</span>
            </Button>
            <span className={styles.unplayedCount}>
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
              <span aria-hidden>›</span>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function WeekPagination({
  history,
  onPageChange,
}: {
  history: PuzzleHistoryPage;
  onPageChange: (page: number) => void;
}) {
  if (history.totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Previous week"
        disabled={!history.hasPrev}
        onClick={() => onPageChange(history.page - 1)}
      >
        <span aria-hidden>‹</span>
      </Button>
      <span className={styles.pageLabel}>Week of {formatShortDate(history.weekStartKey)}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Next week"
        disabled={!history.hasNext}
        onClick={() => onPageChange(history.page + 1)}
      >
        <span aria-hidden>›</span>
      </Button>
    </div>
  );
}
