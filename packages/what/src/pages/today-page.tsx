import { useCallback, useEffect, useRef, useState } from "react";

import { fetchTodayPuzzle, type TodayPuzzleResponse } from "../lib/api";
import { WhatGameBoard, WhatGameBoardSkeleton } from "../game";

export function TodayPage() {
  const [data, setData] = useState<TodayPuzzleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameSlug, setGameSlug] = useState<string | undefined>(undefined);

  const load = useCallback(async (slug?: string) => {
    try {
      const result = await fetchTodayPuzzle(slug);
      setData(result);
      setError(null);
    } catch {
      setError("The WH?T puzzle couldn't load. Try refreshing the page.");
    }
  }, []);

  useEffect(() => {
    void load(gameSlug);
  }, [load, gameSlug]);

  // Cross-device progress can change while this tab is backgrounded — refresh
  // when the player returns, same as the old focus-revalidate behavior.
  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    const onFocus = () => void loadRef.current(gameSlug);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [gameSlug]);

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ fontSize: "0.75rem", opacity: 0.7 }}>{error}</p>
        <a href="/">Reload</a>
      </div>
    );
  }

  if (!data) return <WhatGameBoardSkeleton />;

  const boardKey = `${data.gameSlug}:${data.attempt ? `${data.attempt.status}:${data.attempt.guesses.length}` : "none"}`;

  return (
    <WhatGameBoard
      key={boardKey}
      puzzle={data.puzzle}
      initialGuesses={data.attempt?.guesses ?? []}
      loginUrl={data.loginUrl}
      gameSlug={data.gameSlug}
      topics={data.games}
      onTopicChange={setGameSlug}
    />
  );
}
