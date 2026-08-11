import { Button, Card, CardContent } from "@ponti-studios/ui/primitives";

import type { PublicDailyPuzzle } from "~/lib/realitea";

import type { RealiTeaGameState } from "./use-game";

import styles from "./game-result.module.css";

interface RealiTeaGameResultProps {
  game: RealiTeaGameState;
  puzzle: PublicDailyPuzzle;
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
    );
  }

  if (!game.isGameOver) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className={styles.solvedRow}>
        <span className={styles.squiggle} aria-hidden>
          〜
        </span>
        <span className={styles.badge}>
          {game.isSolved ? `Solved in ${game.guesses.length}` : "Out of guesses"}
        </span>
        <span className={styles.squiggle} aria-hidden>
          〜
        </span>
      </div>

      <div>
        <div className={`${styles.receipt} flex gap-4`}>
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
          onClick={onShare}
          type="button"
        >
          Share the drama
        </button>
        <button className={styles.copyLink} onClick={onCopy} type="button">
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
