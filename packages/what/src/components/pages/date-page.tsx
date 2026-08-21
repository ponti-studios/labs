import { GameBoard } from "../game";
import { BRAND_NAME } from "../../config/brand";
import { Button, Card, CardContent } from "../primitives";
import type { PublicGamesPuzzle } from "../../lib/player-game";
import type { GameGuess, GameStatus } from "../../lib/player-game";
import styles from "./date-page.module.css";

/**
 * Signed-out visitors get a clue-only teaser, never the interactive board —
 * the anonymous one-free-guess design on the API is meant for "today," not
 * arbitrary historical dates.
 */
function SignedOutTeaser({
  dateKey,
  clue,
  loginUrl,
}: {
  dateKey: string;
  clue: string;
  loginUrl: string;
}) {
  return (
    <div className={styles.teaser}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <img src="/logo.webp" alt={BRAND_NAME} className={styles.logo} />
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.clue}>
          <p className={styles.clueLabel}>{dateKey}</p>
          <p className={styles.clueText}>{clue}</p>
        </div>

        <Card className={styles.card}>
          <CardContent className={styles.cardContent}>
            <div>
              <p className={styles.clueLabel}>Sign in to play</p>
              <p style={{ marginTop: "0.25rem", fontSize: "0.875rem" }}>
                Six guesses a day, saved automatically — sign in to play this puzzle.
              </p>
            </div>
            <Button asChild variant="default">
              <a href={loginUrl}>Sign in to play</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export interface DatePageProps {
  puzzle: PublicGamesPuzzle;
  attempt: { guesses: GameGuess[]; status: GameStatus } | null;
  signedIn: boolean;
  loginUrl: string;
  gameSlug: string;
}

export function DatePage({ puzzle, attempt, signedIn, loginUrl, gameSlug }: DatePageProps) {
  if (!signedIn) {
    return <SignedOutTeaser dateKey={puzzle.dateKey} clue={puzzle.clue} loginUrl={loginUrl} />;
  }

  return (
    <GameBoard
      puzzle={puzzle}
      initialGuesses={attempt?.guesses ?? []}
      loginUrl={loginUrl}
      gameSlug={gameSlug}
    />
  );
}
