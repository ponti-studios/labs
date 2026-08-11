import { Card, CardContent } from "@ponti-studios/ui/primitives";
import { useCallback, useMemo, useState } from "react";
import { OnscreenKeyboard } from "~/components/games/onscreen-keyboard";

import {
  getKeyboardState,
  MAX_GUESSES,
  type PublicDailyPuzzle,
  type RealiteaGuess,
} from "~/lib/realitea";
import { buildRealiTeaShareText } from "~/lib/realitea/share";

import { RealiTeaGameHeader } from "./game-header";
import styles from "./game-board.module.css";
import { RealiTeaGameResult } from "./game-result";
import { RealiTeaGuessGrid } from "./guess-grid";
import { RealiTeaTile } from "./realitea-tile";
import { useRealiTeaGame } from "./use-game";
import { useRealiTeaShare } from "./use-share";

export interface RealiTeaGameBoardProps {
  puzzle: PublicDailyPuzzle;
  initialGuesses: readonly RealiteaGuess[];
  loginUrl: string;
}

/**
 * The interactive RealiTea board — shared between today's route and the
 * specific-date route. Feature sections live in focused components so this
 * file owns only game orchestration and composition.
 */
export function RealiTeaGameBoard({ puzzle, initialGuesses, loginUrl }: RealiTeaGameBoardProps) {
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
      // Clipboard permission denied or unavailable; the share fallback remains available.
    }
  }, [game.guesses, game.isSolved, game.clearError]);

  return (
    <div
      className={`${styles.shell} mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 px-4 pt-2 sm:gap-6 sm:pt-4`}
    >
      <RealiTeaGameHeader isFallback={puzzle.isFallback} />

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
        <div className={styles.clue}>
          <p className="ui-eyebrow">Final clue</p>
          <p className="mt-1">{puzzle.clue}</p>
        </div>
      )}

      <RealiTeaGuessGrid game={game} />

      <RealiTeaGameResult
        game={game}
        puzzle={puzzle}
        loginUrl={loginUrl}
        onShare={share}
        onCopy={copyStory}
      />

      {!game.authRequired && !game.isGameOver && (
        <div className={styles.keyboardDock}>
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

/** Skeleton matching the live grid dimensions to avoid layout shift on load. */
export function RealiTeaGameBoardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4">
      <div className={styles.skeleton}>
        {Array.from({ length: MAX_GUESSES }).map((_, row) => (
          <div className={styles.skeletonRow} key={row}>
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
