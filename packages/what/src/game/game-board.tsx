import { useCallback, useEffect, useMemo, useState } from "react";

import { OnscreenKeyboard } from "../keyboard/onscreen-keyboard";
import { getKeyboardState, MAX_GUESSES, WHAT_ANSWER_LENGTH, type PublicGamesPuzzle, type WhatGuess } from "../lib/player-what";
import { buildWhatShareText } from "../lib/player-what/share";

import { WhatGameHeader } from "./game-header";
import styles from "./game-board.module.css";
import { WhatGameResult } from "./game-result";
import { WhatGuessGrid } from "./guess-grid";
import { WhatTile } from "./what-tile";
import { useWhatGame } from "./use-game";
import { useWhatShare } from "./use-share";

export interface WhatGameBoardProps {
  puzzle: PublicGamesPuzzle;
  initialGuesses: readonly WhatGuess[];
  loginUrl: string;
  gameSlug: string;
  topics?: { slug: string; name: string }[];
  onTopicChange?: (slug: string) => void;
}

/**
 * The interactive What board — feature sections live in focused components
 * so this file owns only game orchestration and composition.
 */
export function WhatGameBoard({
  puzzle,
  initialGuesses,
  loginUrl,
  gameSlug,
  topics,
  onTopicChange,
}: WhatGameBoardProps) {
  const [isOffline, setIsOffline] = useState(false);
  const game = useWhatGame({ puzzle, initialGuesses, gameSlug });
  const keyboardState = useMemo(() => getKeyboardState(game.guesses), [game.guesses]);
  const shouldShowClue = !game.isGameOver && game.guesses.length === MAX_GUESSES - 1;

  const { share } = useWhatShare({
    puzzle,
    guesses: game.guesses,
    isSolved: game.isSolved,
    onResult: game.clearError,
  });

  const copyStory = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildWhatShareText(game.guesses, game.isSolved));
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
    <div className={styles.shell}>
      <WhatGameHeader
        isFallback={puzzle.isFallback}
        gameSlug={gameSlug}
        topics={topics}
        onTopicChange={onTopicChange}
      />

      {isOffline && (
        <div role="status" className={styles.offlineBanner}>
          You&apos;re offline. Guesses will be available when your connection returns.
        </div>
      )}

      {shouldShowClue && (
        <div className={styles.clue}>
          <p className={styles.clueLabel}>Final clue</p>
          <p className={styles.clueText}>{puzzle.clue}</p>
        </div>
      )}

      <WhatGuessGrid game={game} />

      <WhatGameResult
        game={game}
        puzzle={puzzle}
        loginUrl={loginUrl}
        onShare={share}
        onCopy={copyStory}
      />

      {!game.authRequired && !game.isGameOver && (
        <div className={styles.keyboardDock}>
          <OnscreenKeyboard
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
export function WhatGameBoardSkeleton() {
  return (
    <div className={styles.skeletonWrap}>
      <div className={styles.skeleton}>
        {Array.from({ length: MAX_GUESSES }).map((_, row) => (
          <div className={styles.skeletonRow} key={row}>
            {Array.from({ length: WHAT_ANSWER_LENGTH }).map((_, col) => (
              <WhatTile
                key={col}
                state="empty"
                loading
                style={{ animationDelay: `${(row * WHAT_ANSWER_LENGTH + col) * 100}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
