import { useCallback, useEffect, useMemo, useState } from "react";
import { OnscreenKeyboard } from "~/components/games/onscreen-keyboard";

import {
  getKeyboardState,
  MAX_GUESSES,
  REALITEA_ANSWER_LENGTH,
  type PublicGamesPuzzle,
  type RealiteaGuess,
} from "~/lib/realitea";
import { buildRealiTeaShareText } from "~/lib/realitea/client/share";

import { RealiTeaGameHeader } from "./game-header";
import styles from "./game-board.module.css";
import { RealiTeaGameResult } from "./game-result";
import { RealiTeaGuessGrid } from "./guess-grid";
import { RealiTeaTile } from "./realitea-tile";
import { useRealiTeaGame } from "./use-game";
import { useRealiTeaShare } from "./use-share";

export interface RealiTeaGameBoardProps {
  puzzle: PublicGamesPuzzle;
  initialGuesses: readonly RealiteaGuess[];
  loginUrl: string;
  gameSlug: string;
  topics?: { slug: string; name: string }[];
  onTopicChange?: (slug: string) => void;
}

/**
 * The interactive RealiTea board — shared between today's route and the
 * specific-date route. Feature sections live in focused components so this
 * file owns only game orchestration and composition.
 */
export function RealiTeaGameBoard({
  puzzle,
  initialGuesses,
  loginUrl,
  gameSlug,
  topics,
  onTopicChange,
}: RealiTeaGameBoardProps) {
  const [isOffline, setIsOffline] = useState(false);
  const game = useRealiTeaGame({ puzzle, initialGuesses, gameSlug });
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

  return (
    <div
      className={`${styles.shell} mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 px-4 pt-2 sm:gap-6 sm:pt-4`}
    >
      <RealiTeaGameHeader
        isFallback={puzzle.isFallback}
        gameSlug={gameSlug}
        topics={topics}
        onTopicChange={onTopicChange}
      />

      {isOffline && (
        <div
          role="status"
          className="rounded-md border px-3 py-2 text-center text-xs"
          style={{
            borderColor: "var(--realitea-error-border)",
            background: "var(--realitea-paper)",
            color: "var(--realitea-ink)",
          }}
        >
          You&apos;re offline. Guesses will be available when your connection returns.
        </div>
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
            {Array.from({ length: REALITEA_ANSWER_LENGTH }).map((_, col) => (
              <RealiTeaTile
                key={col}
                state="empty"
                loading
                style={{ animationDelay: `${(row * REALITEA_ANSWER_LENGTH + col) * 100}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
