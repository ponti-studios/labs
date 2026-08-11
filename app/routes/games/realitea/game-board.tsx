import { Button, Card, CardContent } from "@ponti-studios/ui/primitives";
import { LucideHistory } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { OnscreenKeyboard } from "~/components/games/onscreen-keyboard";

import {
  getKeyboardState,
  MAX_GUESSES,
  REALITEA_ANSWER_LENGTH,
  type PublicDailyPuzzle,
  type RealiteaGuess,
} from "~/lib/realitea";
import { buildRealiTeaShareText } from "~/lib/realitea/share";
import { cn } from "~/lib/utils";

import { RealiTeaTile, type RealiTeaTileState } from "./realitea-tile";
import { useRealiTeaGame } from "./use-game";
import { useRealiTeaShare } from "./use-share";

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

// Shake is feedback for a rejected guess — an occasional, user-initiated
// action (never a keyboard shortcut fired 100+/day), so motion is warranted.
// Driven imperatively via WAAPI (not a CSS keyframe class) because the user
// can submit several wrong guesses in a row: a class-based keyframe
// animation only replays when the class transitions false→true, so back-to-
// back errors while `hasError` was already true would silently no-op.
// Calling `element.animate()` again always starts a fresh run.
const SHAKE_KEYFRAMES: Keyframe[] = [
  { transform: "translateX(0)" },
  { transform: "translateX(-6px)", offset: 0.2 },
  { transform: "translateX(6px)", offset: 0.4 },
  { transform: "translateX(-6px)", offset: 0.6 },
  { transform: "translateX(6px)", offset: 0.8 },
  { transform: "translateX(0)" },
];
// Mirrors --realitea-ease-in-out in realitea.css — WAAPI can't read CSS
// custom properties, so the curve is duplicated here.
const REALITEA_EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";

type CurrentGuessRowProps = {
  currentGuess: string;
  hasError: boolean;
  shakeToken: number;
  isValidationPending: boolean;
};

const CurrentGuessRow = memo(function CurrentGuessRow({
  currentGuess,
  hasError,
  shakeToken,
  isValidationPending,
}: CurrentGuessRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const shakeAnimationRef = useRef<Animation | null>(null);

  useEffect(() => {
    // shakeToken starts at 0; skip the effect's initial run on mount.
    if (shakeToken === 0) return;
    const row = rowRef.current;
    if (!row) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof row.animate !== "function") return;

    shakeAnimationRef.current?.cancel();
    shakeAnimationRef.current = row.animate(SHAKE_KEYFRAMES, {
      duration: 400,
      easing: REALITEA_EASE_IN_OUT,
    });
  }, [shakeToken]);

  return (
    <div
      ref={rowRef}
      className={cn(
        "flex gap-(--realitea-tile-gap) transition-opacity",
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

export interface RealiTeaGameBoardProps {
  puzzle: PublicDailyPuzzle;
  initialGuesses: readonly RealiteaGuess[];
  loginUrl: string;
}

/**
 * The interactive RealiTea board — tile grid, onscreen keyboard, and the
 * game-over / sign-in-required cards. Shared between the "today" route
 * (route.tsx) and the "specific date" route (date.$date.tsx); each owns its
 * own loader/seed logic and passes the result in as props.
 */
export function RealiTeaGameBoard({ puzzle, initialGuesses, loginUrl }: RealiTeaGameBoardProps) {
  // No control currently toggles this — the "how to play" button was
  // removed from the header — but the card itself is kept in case a future
  // entry point (e.g. a help icon elsewhere) wants to flip it back on.
  const [showInstructions] = useState(false);

  const game = useRealiTeaGame({ puzzle, initialGuesses });

  const keyboardState = useMemo(() => getKeyboardState(game.guesses), [game.guesses]);
  const shouldShowClue = !game.isGameOver && game.guesses.length === MAX_GUESSES - 1;

  const { share } = useRealiTeaShare({
    puzzle,
    guesses: game.guesses,
    isSolved: game.isSolved,
    onResult: game.clearError,
  });

  const copyStory = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildRealiTeaShareText(game.guesses, game.isSolved));
      game.clearError();
    } catch {
      // Clipboard permission denied or unavailable — the "Share the drama"
      // button above already covers the prompt-copy fallback.
    }
  }, [game.guesses, game.isSolved, game.clearError]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+184px)] sm:gap-6 sm:pt-4">
      <header className="sticky top-0 z-10 backdrop-blur md:static">
        <div className="relative flex items-center justify-center pt-2 pb-0 sm:pt-4">
          <img
            src="/experiments/logo.realitea.png"
            alt="RealiTea"
            className="h-14 object-contain sm:h-20"
          />
          <Button
            asChild
            aria-label="Your puzzle history"
            variant="ghost"
            className="absolute right-0"
          >
            <Link to="/games/realitea/history">
              <LucideHistory />
            </Link>
          </Button>
        </div>
      </header>

      {showInstructions && (
        <Card>
          <CardContent>
            <p>Guess today&apos;s reality TV answer in 6 tries.</p>
            <p className="mt-2">
              <span className="font-medium text-(--realitea-correct-accent)">Pink</span> means the
              right letter is in the right place.{" "}
              <span className="font-medium text-(--realitea-present-accent)">Gold</span> means the
              letter belongs in the answer but is in the wrong place.
            </p>
          </CardContent>
        </Card>
      )}

      {shouldShowClue && (
        <div className="rounded-md border border-(--realitea-present-border) bg-(--realitea-present-bg) p-3 text-sm leading-5 text-(--realitea-present-text)">
          <p className="ui-eyebrow">Final clue</p>
          <p className="mt-1">{puzzle.clue}</p>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <div
          className="flex w-fit flex-col gap-(--realitea-tile-gap)"
          data-testid="realitea-tile-grid"
        >
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
                  shakeToken={game.shakeToken}
                  isValidationPending={game.isValidationPending}
                />
              );
            }

            return <EmptyGuessRow key={`empty-${rowIndex}`} />;
          })}
        </div>

        {/* Always mounted (never conditionally rendered) so this row's height
            is reserved whether or not there's a message — otherwise the
            centered board above jumps every time an error message
            appears/disappears. `min-h-[1em]` sets that reserved height. */}
        <p
          className={cn(
            "min-h-[1em] text-center text-xs font-medium text-(--realitea-error-border) transition-opacity duration-150",
            game.errorMessage ? "opacity-100" : "opacity-0",
          )}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {game.errorMessage}
        </p>
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
        <div className="flex flex-col gap-3">
          <div className="realitea-solved-row">
            <span className="realitea-solved-squiggle" aria-hidden>
              〜
            </span>
            <span className="realitea-solved-badge">
              {game.isSolved ? `Solved in ${game.guesses.length}` : "Out of guesses"}
            </span>
            <span className="realitea-solved-squiggle" aria-hidden>
              〜
            </span>
          </div>

          <div>
            <div className="realitea-receipt flex gap-4">
              <div className="realitea-receipt-body">
                <p className="realitea-receipt-heading">The Receipt</p>
                <p className="mt-2">{puzzle.detail}</p>
              </div>
              <div className="realitea-receipt-divider" aria-hidden />
              <div className="realitea-receipt-stamp" aria-hidden>
                Real
                <br />
                Tea
                <br />
                Daily.
              </div>
            </div>
            <div className="realitea-receipt-torn" aria-hidden />
          </div>

          <div className="flex flex-col gap-2">
            <button
              aria-label="Share result"
              className="realitea-share-button"
              onClick={share}
              type="button"
            >
              Share the drama
            </button>
            <button className="realitea-copy-link" onClick={copyStory} type="button">
              Copy story
            </button>
            {puzzle.sources.length > 0 && (
              <a
                className="realitea-source-link"
                href={puzzle.sources[0].url}
                target="_blank"
                rel="noopener noreferrer"
                title={puzzle.sources[0].title}
              >
                Read the source ↗
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="realitea-keyboard-dock">
          <OnscreenKeyboard
            appearance="realitea"
            letterStates={keyboardState}
            onLetter={game.addLetter}
            onEnter={game.submitGuess}
            onBackspace={game.removeLetter}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton matching the live grid dimensions — zero layout shift on load.
 * Shared by both routes' HydrateFallback exports.
 */
export function RealiTeaGameBoardSkeleton() {
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
