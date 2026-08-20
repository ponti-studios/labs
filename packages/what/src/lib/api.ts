import type { ActivePuzzleEnvelope, DatedPuzzleEnvelope } from "./player-what/puzzle-types";
import type { PuzzleHistoryPage } from "./player-what/history-types";
import type { WhatGuessResult } from "./player-what/types";

/** The game API is served by the same WH?T deployment as the frontend. */
const API_ORIGIN = "";

function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function apiUrl(path: string, params: Record<string, string | undefined> = {}): string {
  const url = new URL(path, API_ORIGIN || window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

export type TodayPuzzleResponse = ActivePuzzleEnvelope & {
  games: { slug: string; name: string }[];
  loginUrl: string;
  gameSlug: string;
};

export function fetchTodayPuzzle(gameSlug?: string): Promise<TodayPuzzleResponse> {
  return getJson(
    apiUrl("/api/games/what/puzzle", {
      tz: localTimeZone(),
      game: gameSlug,
      returnTo: window.location.href,
    }),
  );
}

export type DatedPuzzleResponse = DatedPuzzleEnvelope & {
  signedIn: boolean;
  loginUrl: string;
  gameSlug: string;
};

export function fetchPuzzleForDate(dateKey: string, gameSlug?: string): Promise<DatedPuzzleResponse> {
  return getJson(
    apiUrl(`/api/games/what/puzzle/${dateKey}`, { game: gameSlug, returnTo: window.location.href }),
  );
}

export type HistoryResponse =
  | { signedIn: false; loginUrl: string }
  | { signedIn: true; loginUrl: string; history: PuzzleHistoryPage; gameSlug: string };

export function fetchHistory(page: number, gameSlug?: string): Promise<HistoryResponse> {
  return getJson(
    apiUrl("/api/games/what/history", {
      page: String(page),
      game: gameSlug,
      returnTo: window.location.href,
    }),
  );
}

export async function submitGuess(payload: {
  dateKey: string;
  gameSlug: string;
  previousGuesses: { word: string }[];
  word: string;
}): Promise<WhatGuessResult | null> {
  try {
    const res = await fetch(apiUrl("/api/games/what/guess"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as WhatGuessResult;
  } catch {
    return null;
  }
}
