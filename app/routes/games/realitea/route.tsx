import { Button } from "@ponti-studios/ui/primitives";
import { useEffect, useRef, useState } from "react";
import { useLoaderData, useRevalidator, type LoaderFunctionArgs } from "react-router";

import { type GameStatus, type PublicDailyPuzzle, type RealiteaGuess } from "~/lib/realitea";
import { getDateKey } from "~/lib/realitea/date";
import { loadActivePublicPuzzle } from "~/lib/realitea/puzzle.server";
import { buildHominemLoginUrl } from "~/lib/server/hominem-auth";

import { RealiTeaGameBoard, RealiTeaGameBoardSkeleton } from "./game-board";
import { readGameState, saveGameState } from "./game-state";
import { resolveReturnTo } from "./return-to.server";

import "./realitea.css";

const TZ_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year in seconds

function parseTzCookie(cookieHeader: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const name = part.slice(0, eqIdx).trim();
    if (name !== "tz") continue;
    const value = decodeURIComponent(part.slice(eqIdx + 1).trim());
    try {
      // Validate that the value is a recognized IANA timezone name
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return value;
    } catch {
      return null;
    }
  }
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const timeZone = parseTzCookie(request.headers.get("Cookie") ?? "") ?? "UTC";
  const envelope = await loadActivePublicPuzzle(new Date(), timeZone);

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

  return Response.json({ ...envelope, loginUrl });
}

export type LoaderData = {
  puzzle: PublicDailyPuzzle;
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
 * reads `localStorage` for restored progress on the client, which would
 * otherwise mismatch the server-rendered output.
 */
export function HydrateFallback() {
  return <RealiTeaGameBoardSkeleton />;
}

type ErrorBoundaryProps = { error: Error };

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-muted-foreground text-xs tracking-[0.15em] uppercase">
        Something went wrong
      </p>
      <p className="text-muted-foreground text-xs">
        {error.message || "The RealiTea puzzle couldn't load. Try refreshing the page."}
      </p>
      <Button asChild variant="default" className="mt-2">
        <a href="/games/realitea">Reload</a>
      </Button>
    </div>
  );
}

export default function RealiTeaRoute() {
  const initial = useLoaderData<LoaderData>();
  const revalidator = useRevalidator();

  const currentPuzzle = initial.puzzle;
  const loginUrl = initial.loginUrl;

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

  // Read once at mount. We deliberately do not subscribe to localStorage.
  // useState lazy initializer runs exactly once per mount — one-shot seed,
  // not reactive state. If the puzzle rolls over at midnight, the reset
  // effect inside useRealiTeaGame (via RealiTeaGameBoard) handles the
  // transition.
  const [seed] = useState(() => {
    if (typeof window === "undefined") {
      return { guesses: [] as RealiteaGuess[], status: "playing" as GameStatus };
    }
    const stored = readGameState(currentPuzzle.dateKey);
    return {
      guesses: stored?.guesses ?? [],
      status: stored?.status ?? ("playing" as GameStatus),
    };
  });

  return (
    <RealiTeaGameBoard
      puzzle={currentPuzzle}
      initialGuesses={seed.guesses}
      loginUrl={loginUrl}
      onGameChange={({ guesses, status }) =>
        saveGameState({ puzzleKey: currentPuzzle.dateKey, guesses: [...guesses], status })
      }
    />
  );
}
