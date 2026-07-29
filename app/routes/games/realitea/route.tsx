import { Button, Card, CardContent } from "@ponti-studios/ui/primitives";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useLoaderData, useRevalidator, type LoaderFunctionArgs } from "react-router";
import { OnscreenKeyboard } from "~/components/games/onscreen-keyboard";

import {
  getKeyboardState,
  MAX_GUESSES,
  REALITEA_ANSWER_LENGTH,
  type GameStatus,
  type PublicDailyPuzzle,
  type RealiteaGuess,
} from "~/lib/realitea";
import { getDateKey } from "~/lib/realitea/date";
import { loadActivePublicPuzzle } from "~/lib/realitea/puzzle.server";
import { buildHominemLoginUrl } from "~/lib/server/hominem-auth";
import { cn } from "~/lib/utils";

import { readGameState, saveGameState } from "./game-state";
import { RealiTeaTile, type RealiTeaTileState } from "./realitea-tile";
import { useRealiTeaGame } from "./use-game";
import { useRealiTeaShare } from "./use-share";

import { LucideHelpCircle, LucideNewspaper, LucideShare } from "lucide-react";

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

// Hominem's redirect policy only trusts LABS_URL's own origin (see task 3),
// so the return URL must round-trip through https even if the request
// reaches this server over plain http behind Railway's proxy.
function resolveReturnTo(request: Request): string {
  const url = new URL(request.url);
  if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    url.protocol = "https:";
  }
  // React Router's client-side revalidation (e.g. the timezone-sync effect
  // below) fetches this loader via a "<path>.data" endpoint, which would
  // otherwise leak into the login redirect and send the player back to a
  // JSON response instead of the page.
  if (url.pathname.endsWith(".data")) {
    url.pathname = url.pathname.slice(0, -".data".length);
  }
  url.search = "";
  url.hash = "";
  return url.toString();
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

const EmptyGuessRow = memo(function EmptyGuessRow() {
  return (
    <div className="flex gap-(--realitea-tile-gap)">
      {Array.from({ length: REALITEA_ANSWER_LENGTH }).map((_, cellIndex) => (
        <RealiTeaTile key={`empty-cell-${cellIndex}`} state="empty" />
      ))}
    </div>
  );
});

type RevealedGuessRowProps = {
  guess: RealiteaGuess;
  isRevealingThisRow: boolean;
  revealedTileCount: number;
};

const RevealedGuessRow = memo(function RevealedGuessRow({
  guess,
  isRevealingThisRow,
  revealedTileCount,
}: RevealedGuessRowProps) {
  return (
    <div className="flex gap-(--realitea-tile-gap)">
      {Array.from({ length: REALITEA_ANSWER_LENGTH }).map((_, cellIndex) => {
        const isTileRevealed = !isRevealingThisRow || cellIndex < revealedTileCount;
        const isAnimatingTile =
          isRevealingThisRow && revealedTileCount > 0 && cellIndex === revealedTileCount - 1;
        const tileState: RealiTeaTileState = isTileRevealed ? guess.states[cellIndex] : "empty";

        return (
          <RealiTeaTile
            key={`revealed-cell-${cellIndex}`}
            state={tileState}
            letter={guess.word[cellIndex] ?? ""}
            isRevealing={isAnimatingTile}
          />
        );
      })}
    </div>
  );
});

type CurrentGuessRowProps = {
  currentGuess: string;
  hasError: boolean;
  isShaking: boolean;
  isValidationPending: boolean;
};

const CurrentGuessRow = memo(function CurrentGuessRow({
  currentGuess,
  hasError,
  isShaking,
  isValidationPending,
}: CurrentGuessRowProps) {
  return (
    <div
      className={cn(
        "flex gap-(--realitea-tile-gap) transition-opacity",
        hasError && "realitea-tile-error",
        isShaking && "realitea-row-shake",
        isValidationPending && "opacity-60",
      )}
    >
      {Array.from({ length: REALITEA_ANSWER_LENGTH }).map((_, cellIndex) => (
        <RealiTeaTile
          key={`current-cell-${cellIndex}`}
          state={currentGuess[cellIndex] ? "typed" : "empty"}
          letter={currentGuess[cellIndex] ?? ""}
          ariaLabel={`Letter ${cellIndex + 1}`}
          hasError={hasError}
        />
      ))}
    </div>
  );
});

/**
 * Skeleton that React Router renders during SSR / before hydration. The route
 * reads `localStorage` for restored progress on the client, which would
 * otherwise mismatch the server-rendered output.
 *
 * Tiles match the live grid dimensions so there is zero layout shift.
 * A staggered fade animation sweeps across all 30 tiles.
 */
export function HydrateFallback() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4">
      <div className="flex w-fit flex-col gap-(--realitea-tile-gap)">
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="flex gap-(--realitea-tile-gap)">
            {Array.from({ length: 5 }).map((_, col) => (
              <RealiTeaTile
                key={col}
                state="empty"
                loading
                style={{ animationDelay: `${(row * 5 + col) * 100}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
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
  const [showInstructions, setShowInstructions] = useState(false);
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
  // effect in useRealiTeaGame handles the transition.
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

  const game = useRealiTeaGame({
    puzzle: currentPuzzle,
    initialGuesses: seed.guesses,
  });

  // Persist after every status/guess change. One-way write — no read.
  useEffect(() => {
    saveGameState({
      puzzleKey: currentPuzzle.dateKey,
      guesses: [...game.guesses],
      status: game.status,
    });
  }, [currentPuzzle.dateKey, game.guesses, game.status]);

  const keyboardState = useMemo(() => getKeyboardState(game.guesses), [game.guesses]);
  const shouldShowClue = !game.isGameOver && game.guesses.length === MAX_GUESSES - 1;

  const { share } = useRealiTeaShare({
    puzzle: currentPuzzle,
    guesses: game.guesses,
    isSolved: game.isSolved,
    onResult: game.clearError,
  });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 pb-[calc(env(safe-area-inset-bottom)+8px)]">
      <header className="sticky top-0 z-10 backdrop-blur md:static">
        <div className="relative flex items-center justify-center pt-4 pb-0">
          <img
            src="/experiments/logo.realitea.500x500.webp"
            alt="RealiTea"
            className="h-20 object-contain sm:h-14"
          />
          {/* <Button
            aria-label="How to play"
            variant="ghost"
            className="self-end"
            onClick={() => setShowInstructions((v) => !v)}
            type="button"
          >
            <LucideHelpCircle />
          </Button> */}
        </div>
      </header>

      {showInstructions && (
        <Card>
          <CardContent>
            <p>Guess today&apos;s reality TV answer in 6 tries.</p>
            <p className="mt-2">
              <span className="font-medium text-(--realitea-correct-text)">Green</span> means the
              right letter is in the right place.{" "}
              <span className="font-medium text-(--realitea-present-text)">Gold</span> means the
              letter belongs in the answer but is in the wrong place.
            </p>
          </CardContent>
        </Card>
      )}

      {shouldShowClue && (
        <div className="rounded-md border border-(--realitea-present-border) bg-(--realitea-present-bg) p-3 text-sm leading-5 text-(--realitea-present-text)">
          <p className="ui-eyebrow">Final clue</p>
          <p className="mt-1">{currentPuzzle.clue}</p>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <div className="flex w-fit flex-col gap-(--realitea-tile-gap)">
          {Array.from({
            length: game.isGameOver ? game.guesses.length : MAX_GUESSES,
          }).map((_, rowIndex) => {
            const isCurrentRow =
              rowIndex === game.guesses.length && !game.isGameOver && !game.isRevealingRow;
            const guess = game.guesses[rowIndex];
            const isRevealingThisRow = rowIndex === game.revealingGuessIndex;

            if (guess) {
              return (
                <RevealedGuessRow
                  key={`revealed-${rowIndex}`}
                  guess={guess}
                  isRevealingThisRow={isRevealingThisRow}
                  revealedTileCount={game.revealedTileCount}
                />
              );
            }

            if (isCurrentRow) {
              return (
                <CurrentGuessRow
                  key={`current-${rowIndex}`}
                  currentGuess={game.currentGuess}
                  hasError={game.hasError}
                  isShaking={game.isShaking}
                  isValidationPending={game.isValidationPending}
                />
              );
            }

            return <EmptyGuessRow key={`empty-${rowIndex}`} />;
          })}
        </div>

        {game.errorMessage ? (
          <p
            className="min-h-[1em] text-center text-xs font-medium text-(--realitea-error-border)"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {game.errorMessage}
          </p>
        ) : null}
      </div>

      {game.authRequired ? (
        <Card className="border-(--realitea-present-border)">
          <CardContent className="flex flex-col gap-3 text-center">
            <div>
              <p className="ui-eyebrow">Free guess used</p>
              <p className="mt-1 text-sm">
                Sign in to keep playing — six guesses a day, saved automatically.
              </p>
            </div>
            <Button asChild variant="default">
              <a href={loginUrl}>Sign in to keep playing</a>
            </Button>
          </CardContent>
        </Card>
      ) : game.isGameOver ? (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="ui-eyebrow">{game.isSolved ? "The Story" : "The puzzle ended"}</p>
              <p className="mt-1 text-xs">{currentPuzzle.detail.toLocaleLowerCase()}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button aria-label="Share result" onClick={share} type="button" variant="secondary">
                <LucideShare size={18} />
              </Button>
              {currentPuzzle.sources.length > 0 && (
                <Button asChild variant="default">
                  <a
                    href={currentPuzzle.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={currentPuzzle.sources[0].title}
                  >
                    <LucideNewspaper size={18} />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <OnscreenKeyboard
          appearance="realitea"
          letterStates={keyboardState}
          onLetter={game.addLetter}
          onEnter={game.submitGuess}
          onBackspace={game.removeLetter}
        />
      )}
    </div>
  );
}
