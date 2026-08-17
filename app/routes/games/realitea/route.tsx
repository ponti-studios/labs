import { Button } from "@ponti-studios/ui/primitives";
import * as Sentry from "@sentry/react-router";
import { useEffect, useRef, useState } from "react";
import {
  isRouteErrorResponse,
  useLoaderData,
  useSearchParams,
  useRevalidator,
  type LoaderFunctionArgs,
} from "react-router";
import type { Route } from "./+types/route";

import { type PublicGamesPuzzle } from "~/lib/realitea";
import { getDateKey } from "~/lib/realitea/core/date";
import { DEFAULT_REALITEA_GAME_SLUG } from "~/lib/realitea/generation/catalog";
import {
  loadActivePublicPuzzleWithAttempt,
  type ActivePuzzleAttempt,
} from "~/lib/realitea/server/puzzle.server";
import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";
import { getActiveGames } from "~/lib/realitea/server/games.server";

import { RealiTeaGameBoard, RealiTeaGameBoardSkeleton } from "./game-board";
import { resolveReturnTo } from "./return-to.server";
import { parseTzCookie } from "./tz-cookie.server";

import "./realitea.css";

const TZ_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year in seconds

export async function loader({ request }: LoaderFunctionArgs) {
  const timeZone = parseTzCookie(request.headers.get("Cookie") ?? "") ?? "UTC";
  const gameSlug = new URL(request.url).searchParams.get("game") ?? DEFAULT_REALITEA_GAME_SLUG;
  const user = await getHominemUser(request);
  const [envelope, games] = await Promise.all([
    loadActivePublicPuzzleWithAttempt(new Date(), timeZone, user, gameSlug),
    // Topic switching is secondary UI; a temporary inventory read failure
    // should not prevent the daily puzzle from loading.
    getActiveGames().catch(() => []),
  ]);

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

  return Response.json({
    ...envelope,
    games: games.map((game) => ({ slug: game.slug, name: game.name })),
    loginUrl,
    gameSlug,
  });
}

export type LoaderData = {
  puzzle: PublicGamesPuzzle;
  attempt: {
    guesses: ActivePuzzleAttempt["guesses"];
    status: ActivePuzzleAttempt["status"];
  } | null;
  games: { slug: string; name: string }[];
  loginUrl: string;
  gameSlug: string;
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
 * loader includes the server-authoritative attempt, so the live board can
 * hydrate directly without a second client-side loading state.
 */
export function HydrateFallback() {
  return <RealiTeaGameBoardSkeleton />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const [isOffline, setIsOffline] = useState(false);
  let message = "The RealiTea puzzle couldn't load. Try refreshing the page.";

  useEffect(() => {
    const updateOnlineState = () => setIsOffline(!navigator.onLine);
    updateOnlineState();
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

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

  if (isOffline) {
    message = "You're offline. RealiTea needs a connection to load today's puzzle.";
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
  const gameSlug = initial.gameSlug;

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

  // Keep cross-device progress fresh when a player returns to the installed
  // app after solving on another device. The loader now supplies the initial
  // attempt, so this replaces React Query's former focus refetch.
  useEffect(() => {
    const revalidateOnFocus = () => revalidateRef.current();
    window.addEventListener("focus", revalidateOnFocus);
    return () => window.removeEventListener("focus", revalidateOnFocus);
  }, []);

  // RealiTeaGameBoard seeds its guesses once at mount (see use-game.ts), so
  // the server-provided attempt is part of the board key. A topic change
  // re-runs this route loader and gets a fresh puzzle/attempt pair.
  const attempt = initial.attempt;
  const boardKey = `${gameSlug}:${attempt ? `${attempt.status}:${attempt.guesses.length}` : "none"}`;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 pt-4">
      <RealiTeaGameBoard
        key={boardKey}
        puzzle={currentPuzzle}
        initialGuesses={attempt?.guesses ?? []}
        loginUrl={loginUrl}
        gameSlug={gameSlug}
        topics={initial.games}
        onTopicChange={(slug) => {
          const next = new URLSearchParams(searchParams);
          next.set("game", slug);
          setSearchParams(next);
        }}
      />
    </div>
  );
}
