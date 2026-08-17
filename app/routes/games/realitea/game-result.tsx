import { Button, Card, CardContent } from "@ponti-studios/ui/primitives";

import type { PublicGamesPuzzle } from "~/lib/realitea";

import type { RealiTeaGameState } from "./use-game";

import styles from "./game-result.module.css";

interface RealiTeaGameResultProps {
  game: RealiTeaGameState;
  puzzle: PublicGamesPuzzle;
  loginUrl: string;
  onShare: () => void;
  onCopy: () => void;
}

export function RealiTeaGameResult({
  game,
  puzzle,
  loginUrl,
  onShare,
  onCopy,
}: RealiTeaGameResultProps) {
  if (game.authRequired) {
    return (
      <Card className="border-(--realitea-present-border)" data-testid="realitea-auth-required">
        <CardContent className="flex flex-col gap-3 text-center">
          <div>
            <p className="ui-eyebrow">Free guess used</p>
            <p className="mt-1 text-sm">
              Sign in to keep playing — six guesses a day, saved automatically.
            </p>
          </div>
          <Button asChild variant="default">
            <a href={loginUrl} data-testid="realitea-auth-signin">
              Sign in to keep playing
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!game.isGameOver) return null;

  return (
    <div className="flex flex-col gap-3" data-testid="realitea-result">
      <div className={styles.solvedRow}>
        <span className={styles.squiggle} aria-hidden>
          〜
        </span>
        <span
          className={styles.badge}
          data-testid="realitea-result-badge"
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
        <div className={`${styles.receipt} flex gap-4`} data-testid="realitea-receipt">
          <div className={styles.receiptBody}>
            <p className={styles.receiptHeading}>The Receipt</p>
            <p className="mt-2">{puzzle.detail}</p>
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

      <div className="flex flex-col gap-2">
        <button
          aria-label="Share result"
          className={styles.shareButton}
          data-testid="realitea-share"
          onClick={onShare}
          type="button"
        >
          Share the drama
        </button>
        <button
          className={styles.copyLink}
          data-testid="realitea-copy-story"
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
