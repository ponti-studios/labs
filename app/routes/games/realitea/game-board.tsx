import { Button, Card, CardContent } from "@ponti-studios/ui/primitives";
import { LucideHistory, LucideNewspaper, LucideShare } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Link } from "react-router";
import { OnscreenKeyboard } from "~/components/games/onscreen-keyboard";

import {
  getKeyboardState,
  MAX_GUESSES,
  REALITEA_ANSWER_LENGTH,
  type PublicDailyPuzzle,
  type RealiteaGuess,
} from "~/lib/realitea";
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

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 px-4 pb-[calc(env(safe-area-inset-bottom)+88px)] sm:gap-6 sm:pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <header className="sticky top-0 z-10 backdrop-blur md:static">
        <div className="relative flex items-center justify-center pt-2 pb-0 sm:pt-4">
          <img
            src="/experiments/logo.realitea.500x500.webp"
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
              <p className="mt-1 text-xs">{puzzle.detail.toLocaleLowerCase()}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button aria-label="Share result" onClick={share} type="button" variant="secondary">
                <LucideShare size={18} />
              </Button>
              {puzzle.sources.length > 0 && (
                <Button asChild variant="default">
                  <a
                    href={puzzle.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={puzzle.sources[0].title}
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
