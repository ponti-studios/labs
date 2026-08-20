import { Button, Card, CardContent } from "../primitives";
import type { PublicGamesPuzzle } from "../lib/player-game";

import type { GameState } from "./use-game";
import styles from "./game-result.module.css";

interface GameResultProps {
  game: GameState;
  puzzle: PublicGamesPuzzle;
  loginUrl: string;
  onShare: () => void;
  onCopy: () => void;
}

export function GameResult({ game, puzzle, loginUrl, onShare, onCopy }: GameResultProps) {
  if (game.authRequired) {
    return (
      <Card className={styles.authCard} data-testid="game-auth-required">
        <CardContent className={styles.authCardContent}>
          <div>
            <p className={styles.eyebrow}>Free guess used</p>
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem" }}>
              Sign in to keep playing — six guesses a day, saved automatically.
            </p>
          </div>
          <Button asChild variant="default">
            <a href={loginUrl} data-testid="game-auth-signin">
              Sign in to keep playing
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!game.isGameOver) return null;

  return (
    <div className={styles.result} data-testid="game-result">
      <div className={styles.solvedRow}>
        <span className={styles.squiggle} aria-hidden>
          〜
        </span>
        <span
          className={styles.badge}
          data-testid="game-result-badge"
          data-solved={game.isSolved ? "true" : "false"}
          data-guesses={game.guesses.length}
        >
          {game.isSolved ? `Solved in ${game.guesses.length}` : "Out of guesses"}
        </span>
        <span className={styles.squiggle} aria-hidden>
          〜
        </span>
      </div>

      <div>
        <div className={styles.receipt} data-testid="game-receipt">
          <div className={styles.receiptBody}>
            <p className={styles.receiptHeading}>The Receipt</p>
            <p>{puzzle.detail}</p>
          </div>
          <div className={styles.receiptDivider} aria-hidden />
          <div className={styles.receiptStamp} aria-hidden>
            Real
            <br />
            Tea
            <br />
            Daily.
          </div>
        </div>
        <div className={styles.receiptTorn} aria-hidden />
      </div>

      <div className={styles.actions}>
        <button
          aria-label="Share result"
          className={styles.shareButton}
          data-testid="game-share"
          onClick={onShare}
          type="button"
        >
          Share the drama
        </button>
        <button
          className={styles.copyLink}
          data-testid="game-copy-story"
          onClick={onCopy}
          type="button"
        >
          Copy story
        </button>
        {puzzle.sources.length > 0 && (
          <a
            className={styles.sourceLink}
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
  );
}
