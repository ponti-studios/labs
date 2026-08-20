import { useEffect } from "react";
import { useNavigate, useRevalidator } from "react-router";

import { GameBoard } from "../game";
import type { ActivePuzzleAttempt } from "../lib/game/server/puzzle.server";
import type { PublicGamesPuzzle } from "../lib/player-game";
import { TIME_ZONE_COOKIE } from "../lib/player-game/timezone";

export interface TodayPageProps {
  puzzle: PublicGamesPuzzle | null;
  attempt?: ActivePuzzleAttempt | null;
  loginUrl: string;
  gameSlug: string;
  games: { slug: string; name: string }[];
}

export function TodayPage({ puzzle, attempt, loginUrl, gameSlug, games }: TodayPageProps) {
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cookieValue = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${TIME_ZONE_COOKIE}=`))
      ?.slice(TIME_ZONE_COOKIE.length + 1);

    if (cookieValue !== encodeURIComponent(tz)) {
      document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(tz)}; Max-Age=31536000; Path=/; SameSite=Lax`;
      revalidator.revalidate();
    }
  }, [revalidator]);

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
    <GameBoard
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
