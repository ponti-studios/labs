import { useEffect, useState } from "react";

import { fetchPuzzleForDate, type DatedPuzzleResponse } from "../lib/api";
import { Button, Card, CardContent } from "../primitives";
import { WhatGameBoard, WhatGameBoardSkeleton } from "../game";
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
          <img src="/logo.what.webp" alt="WH?T" className={styles.logo} />
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

export function DatePage({ dateKey }: { dateKey: string }) {
  const [data, setData] = useState<DatedPuzzleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    fetchPuzzleForDate(dateKey)
      .then(setData)
      .catch(() => setError("That puzzle couldn't load."));
  }, [dateKey]);

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>{error}</p>
        <a href="/history">Back to history</a>
      </div>
    );
  }

  if (!data) return <WhatGameBoardSkeleton />;

  if (!data.signedIn) {
    return (
      <SignedOutTeaser dateKey={data.puzzle.dateKey} clue={data.puzzle.clue} loginUrl={data.loginUrl} />
    );
  }

  return (
    <WhatGameBoard
      puzzle={data.puzzle}
      initialGuesses={data.attempt?.guesses ?? []}
      loginUrl={data.loginUrl}
      gameSlug={data.gameSlug}
    />
  );
}
