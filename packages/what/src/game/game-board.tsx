import { useCallback, useEffect, useMemo, useState } from "react";

import { OnscreenKeyboard } from "../keyboard/onscreen-keyboard";
import {
  getKeyboardState,
  MAX_GUESSES,
  GAME_ANSWER_LENGTH,
  type PublicGamesPuzzle,
  type GameGuess,
} from "../lib/player-game";
import { buildGameShareText } from "../lib/player-game/share";

import { GameHeader } from "./game-header";
import styles from "./game-board.module.css";
import { GameResult } from "./game-result";
import { GuessGrid } from "./guess-grid";
import { GameTile } from "./game-tile";
import { useGame } from "./use-game";
import { useShare } from "./use-share";

export interface GameBoardProps {
  puzzle: PublicGamesPuzzle;
  initialGuesses: readonly GameGuess[];
  loginUrl: string;
  gameSlug: string;
  topics?: { slug: string; name: string }[];
  onTopicChange?: (slug: string) => void;
}

/**
 * The interactive game board — feature sections live in focused components
 * so this file owns only game orchestration and composition.
 */
export function GameBoard({
  puzzle,
  initialGuesses,
  loginUrl,
  gameSlug,
  topics,
  onTopicChange,
}: GameBoardProps) {
  const [isOffline, setIsOffline] = useState(false);
  const game = useGame({ puzzle, initialGuesses, gameSlug });
  const keyboardState = useMemo(() => getKeyboardState(game.guesses), [game.guesses]);
  const shouldShowClue = !game.isGameOver && game.guesses.length === MAX_GUESSES - 1;

  const { share } = useShare({
    puzzle,
    guesses: game.guesses,
    isSolved: game.isSolved,
    onResult: game.clearError,
  });

  const copyStory = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildGameShareText(game.guesses, game.isSolved));
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
      <GameHeader
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

      <GuessGrid game={game} />

      <GameResult
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
export function GameBoardSkeleton() {
  return (
    <div className={styles.skeletonWrap}>
      <div className={styles.skeleton}>
        {Array.from({ length: MAX_GUESSES }).map((_, row) => (
          <div className={styles.skeletonRow} key={row}>
            {Array.from({ length: GAME_ANSWER_LENGTH }).map((_, col) => (
              <GameTile
                key={col}
                state="empty"
                loading
                style={{ animationDelay: `${(row * GAME_ANSWER_LENGTH + col) * 100}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
