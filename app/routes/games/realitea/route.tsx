import { Button } from "@ponti-studios/ui/primitives";
import * as Sentry from "@sentry/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  isRouteErrorResponse,
  useLoaderData,
  useSearchParams,
  useRevalidator,
  type LoaderFunctionArgs,
} from "react-router";
import type { Route } from "./+types/route";

import { type PublicGamesPuzzle } from "~/lib/realitea";
import { getDateKey } from "~/lib/realitea/date";
import { loadActivePublicPuzzle, type ActivePuzzleAttempt } from "~/lib/realitea/puzzle.server";
import { buildHominemLoginUrl } from "~/lib/server/hominem-auth";

import { RealiTeaGameBoard, RealiTeaGameBoardSkeleton } from "./game-board";
import { resolveReturnTo } from "./return-to.server";
import { parseTzCookie } from "./tz-cookie.server";

import "./realitea.css";

const TZ_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year in seconds
const DEFAULT_REALITEA_GAME_SLUG = "rhobh";

export async function loader({ request }: LoaderFunctionArgs) {
  const timeZone = parseTzCookie(request.headers.get("Cookie") ?? "") ?? "UTC";
  const gameSlug = new URL(request.url).searchParams.get("game") ?? DEFAULT_REALITEA_GAME_SLUG;
  const envelope = await loadActivePublicPuzzle(new Date(), timeZone, gameSlug);

  if (!envelope) {
    throw Response.json(
      {
        code: "REALITEA_PUZZLE_NOT_FOUND",
        error: "No RealiTea puzzle found for today",
      },
      { status: 404, statusText: "No RealiTea puzzle found for today" },
    );
  }

  const loginUrl = buildHominemLoginUrl(resolveReturnTo(request));

  return Response.json({ ...envelope, loginUrl, gameSlug });
}

export type LoaderData = {
  puzzle: PublicGamesPuzzle;
  loginUrl: string;
};

export function meta() {
  return [
    { title: "RealiTea — Labyrinth" },
    {
      name: "description",
      content: "Guess today's reality TV answer from a rotating daily word game.",
    },
  ];
}

/**
 * Skeleton that React Router renders during SSR / before hydration. The route
 * then fetches the signed-in player's server-side attempt (React Query),
 * which shows the same skeleton again briefly until that resolves — see the
 * `attemptQuery.isPending` check below.
 */
export function HydrateFallback() {
  return <RealiTeaGameBoardSkeleton />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "The RealiTea puzzle couldn't load. Try refreshing the page.";

  if (isRouteErrorResponse(error)) {
    const routeErrorMessage =
      typeof error.data === "object" &&
      error.data !== null &&
      "error" in error.data &&
      typeof error.data.error === "string"
        ? error.data.error
        : null;
    message = routeErrorMessage ?? (error.statusText || message);
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  if (error && !isRouteErrorResponse(error)) {
    Sentry.withScope((scope) => {
      scope.setTag("game", "realitea");
      scope.setTag("realitea_surface", "daily-puzzle");
      Sentry.captureException(error);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-muted-foreground text-xs tracking-[0.15em] uppercase">
        Something went wrong
      </p>
      <p className="text-muted-foreground text-xs">{message}</p>
      <Button asChild variant="default" className="mt-2">
        <a href="/games/realitea">Reload</a>
      </Button>
    </div>
  );
}

export default function RealiTeaRoute() {
  const initial = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  const currentPuzzle = initial.puzzle;
  const loginUrl = initial.loginUrl;
  const gameSlug = searchParams.get("game") ?? DEFAULT_REALITEA_GAME_SLUG;
  const gamesQuery = useQuery({
    queryKey: ["realitea-games"],
    queryFn: async () => {
      const response = await fetch("/api/games/realitea/games");
      if (!response.ok) throw new Error(`Failed to load RealiTea games: ${response.status}`);
      return (await response.json()) as { games: { slug: string; name: string }[] };
    },
  });

  // On first mount, store the user's IANA timezone in a cookie so the server
  // can serve the puzzle for the user's local calendar date rather than UTC.
  // If the server used UTC and the local date differs, revalidate immediately.
  //
  // Both values are captured in refs so the effect dependency array is
  // genuinely empty (runs exactly once on mount, no stale-closure risk).
  const didSyncTzRef = useRef(false);
  const initialDateKeyRef = useRef(currentPuzzle.dateKey);
  const revalidateRef = useRef(revalidator.revalidate);
  revalidateRef.current = revalidator.revalidate;

  useEffect(() => {
    if (didSyncTzRef.current) return;
    didSyncTzRef.current = true;

    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Defensive: all modern browsers support Intl, but guard against edge cases
    if (!localTz) return;

    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `tz=${encodeURIComponent(localTz)}; path=/; max-age=${TZ_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;

    const localDateKey = getDateKey(new Date(), localTz);
    if (initialDateKeyRef.current !== localDateKey) {
      revalidateRef.current();
    }
  }, []);

  // Server-authoritative progress for signed-in players, not device-local
  // storage — a solve on one device shows up on another on the next fetch.
  // `refetchOnWindowFocus` (React Query's default) is what makes "switch
  // back to this tab after solving elsewhere" self-correct without a manual
  // reload. Returns `{ attempt: null }` for anonymous callers and signed-in
  // players who haven't attempted today's puzzle yet — both mean "start
  // empty," same as before.
  const attemptQuery = useQuery({
    queryKey: ["realitea-attempt", gameSlug, currentPuzzle.dateKey],
    queryFn: async () => {
      const response = await fetch(
        `/api/games/realitea/attempt?game=${encodeURIComponent(gameSlug)}`,
      );
      if (!response.ok) throw new Error(`Failed to load attempt: ${response.status}`);
      const data = (await response.json()) as { attempt: ActivePuzzleAttempt | null };
      return data.attempt;
    },
  });

  if (attemptQuery.isPending) {
    return <RealiTeaGameBoardSkeleton />;
  }

  // RealiTeaGameBoard seeds its guesses once at mount (see use-game.ts) and
  // isn't reactive to prop changes after that. A background refetch (e.g.
  // the window-focus refetch above) updates `attemptQuery.data` without
  // remounting the board by default — so the `key` forces a remount, and a
  // fresh reseed, whenever the *content* of the fetched attempt actually
  // changes (guess count or status), not on every refetch.
  const attempt = attemptQuery.data;
  const boardKey = `${gameSlug}:${attempt ? `${attempt.status}:${attempt.guesses.length}` : "none"}`;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 pt-4">
      <RealiTeaGameBoard
        key={boardKey}
        puzzle={currentPuzzle}
        initialGuesses={attempt?.guesses ?? []}
        loginUrl={loginUrl}
        gameSlug={gameSlug}
        topics={gamesQuery.data?.games}
        onTopicChange={(slug) => {
          const next = new URLSearchParams(searchParams);
          next.set("game", slug);
          setSearchParams(next);
        }}
      />
    </div>
  );
}
