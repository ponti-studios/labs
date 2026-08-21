import { Copy, ExternalLink, Share2 } from "lucide-react";

import type { PublicGamesPuzzle } from "../../lib/puzzle";
import { Button, Card, CardContent } from "../primitives";

import styles from "./game-result.module.css";
import type { GameState } from "../../hooks/use-game";

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
          <div className={styles.receiptContent}>
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
          <div className={styles.receiptActions}>
            <button
              aria-label="Share the drama"
              className={styles.receiptAction}
              data-testid="game-share"
              onClick={onShare}
              title="Share the drama"
              type="button"
            >
              <Share2 aria-hidden="true" size={18} strokeWidth={2.25} />
            </button>
            <button
              aria-label="Copy story"
              className={styles.receiptAction}
              data-testid="game-copy-story"
              onClick={onCopy}
              title="Copy story"
              type="button"
            >
              <Copy aria-hidden="true" size={18} strokeWidth={2.25} />
            </button>
            {puzzle.sources.length > 0 && (
              <a
                aria-label="Read the source article"
                className={styles.receiptAction}
                href={puzzle.sources[0].url}
                rel="noopener noreferrer"
                target="_blank"
                title={puzzle.sources[0].title ?? "Read the source article"}
              >
                <ExternalLink aria-hidden="true" size={18} strokeWidth={2.25} />
              </a>
            )}
          </div>
        </div>
        <div className={styles.receiptTorn} aria-hidden />
      </div>
    </div>
  );
}
