import { useEffect } from "react";
import { useNavigate, useRevalidator, useSearchParams } from "react-router";

import { WhatGameBoard } from "../game";
import type { ActivePuzzleAttempt } from "../lib/what/server/puzzle.server";
import type { PublicGamesPuzzle } from "../lib/player-what";

export interface TodayPageProps {
  puzzle: PublicGamesPuzzle | null;
  attempt?: ActivePuzzleAttempt | null;
  loginUrl: string;
  gameSlug: string;
  games: { slug: string; name: string }[];
}

export function TodayPage({ puzzle, attempt, loginUrl, gameSlug, games }: TodayPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  // Correct "today" to the visitor's real time zone once we know it — the
  // server defaults to UTC on first render since it has no way to know this.
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (searchParams.get("tz") !== tz) {
      setSearchParams(
        (prev) => {
          prev.set("tz", tz);
          return prev;
        },
        { replace: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cross-device progress can change while this tab is backgrounded — refresh
  // when the player returns, same as the old focus-revalidate behavior.
  useEffect(() => {
    const onFocus = () => revalidator.revalidate();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [revalidator]);

  if (!puzzle) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>No puzzle available right now.</p>
      </div>
    );
  }

  const boardKey = `${gameSlug}:${attempt ? `${attempt.status}:${attempt.guesses.length}` : "none"}`;

  return (
    <WhatGameBoard
      key={boardKey}
      puzzle={puzzle}
      initialGuesses={attempt?.guesses ?? []}
      loginUrl={loginUrl}
      gameSlug={gameSlug}
      topics={games}
      onTopicChange={(slug) => navigate(`/${slug}`)}
    />
  );
}
