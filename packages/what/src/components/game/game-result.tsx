import { CheckCircle2, Copy, ExternalLink, Share2, XCircle } from "lucide-react";
import type { CSSProperties } from "react";

import { MAX_GUESSES, type PublicGamesPuzzle } from "../../lib/puzzle";
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
      <div className={styles.resultCard} data-testid="game-receipt">
        <div
          className={styles.verdict}
          data-testid="game-result-badge"
          data-solved={game.isSolved ? "true" : "false"}
          data-guesses={game.guesses.length}
        >
          {game.isSolved ? (
            <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2.5} />
          ) : (
            <XCircle aria-hidden="true" size={18} strokeWidth={2.5} />
          )}
          <span className={styles.verdictLabel}>
            {game.isSolved ? `Solved in ${game.guesses.length}` : "Out of guesses"}
          </span>
          <div className={styles.verdictDots} aria-hidden="true">
            {Array.from({ length: MAX_GUESSES }, (_, i) => (
              <span
                key={i}
                className={styles.verdictDot}
                data-filled={i < game.guesses.length ? "true" : "false"}
              />
            ))}
          </div>
        </div>
        <div className={styles.resultBody}>
          <p className={styles.resultHeading}>The Receipt</p>
          <p>{puzzle.detail}</p>
        </div>
        <div className={styles.resultActions}>
          <button
            aria-label="Share the drama"
            className={styles.resultAction}
            data-testid="game-share"
            onClick={onShare}
            style={{ "--action-i": 0 } as CSSProperties}
            title="Share the drama"
            type="button"
          >
            <Share2 aria-hidden="true" size={18} strokeWidth={2.25} />
          </button>
          <button
            aria-label="Copy story"
            className={styles.resultAction}
            data-testid="game-copy-story"
            onClick={onCopy}
            style={{ "--action-i": 1 } as CSSProperties}
            title="Copy story"
            type="button"
          >
            <Copy aria-hidden="true" size={18} strokeWidth={2.25} />
          </button>
          {puzzle.sources.length > 0 && (
            <a
              aria-label="Read the source article"
              className={styles.resultAction}
              href={puzzle.sources[0].url}
              rel="noopener noreferrer"
              style={{ "--action-i": 2 } as CSSProperties}
              target="_blank"
              title={puzzle.sources[0].title ?? "Read the source article"}
            >
              <ExternalLink aria-hidden="true" size={18} strokeWidth={2.25} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
