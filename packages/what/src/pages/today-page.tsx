import { useNavigate, useRevalidator } from "react-router";

import { GameBoard } from "../game";
import type { ActivePuzzleAttempt } from "../lib/game/server/puzzle.server";
import type { PublicGamesPuzzle } from "../lib/player-game";
import { useTimeZone } from "../lib/player-game/use-timezone";

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

  useTimeZone(revalidator.revalidate);

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
