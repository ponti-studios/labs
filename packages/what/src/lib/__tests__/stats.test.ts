import { describe, expect, it } from "vitest";

import { buildStreakMosaic, computeHistoryStats } from "../puzzle/stats";

type StoredGuess = { word: string; states: ("absent" | "correct" | "present")[] };
type Fixture = { dateUtc: string; status: "playing" | "solved" | "failed"; guesses: StoredGuess[] };

function attempt(dateUtc: string, status: Fixture["status"], guessCount = 0): Fixture {
  return {
    dateUtc,
    status,
    guesses: Array.from({ length: guessCount }, () => ({ word: "WORDY", states: [] })),
  };
}

describe("computeHistoryStats", () => {
  it("returns all-zero stats for an empty history", () => {
    const stats = computeHistoryStats([]);

    expect(stats).toEqual({
      gamesPlayed: 0,
      gamesSolved: 0,
      winRate: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    });
  });

  it("counts a contiguous run of solved days as one streak", () => {
    const stats = computeHistoryStats([
      attempt("2026-07-29", "solved", 3),
      attempt("2026-07-28", "solved", 4),
      attempt("2026-07-27", "solved", 2),
    ]);

    expect(stats.gamesPlayed).toBe(3);
    expect(stats.gamesSolved).toBe(3);
    expect(stats.winRate).toBe(1);
    expect(stats.currentStreak).toBe(3);
    expect(stats.maxStreak).toBe(3);
  });

  it("breaks the streak on a gap (an unattempted date in between)", () => {
    const stats = computeHistoryStats([
      attempt("2026-07-29", "solved", 3),
      // 2026-07-28 has no attempt row at all — a gap
      attempt("2026-07-27", "solved", 2),
    ]);

    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(1);
  });

  it("breaks the streak on a failed day", () => {
    const stats = computeHistoryStats([
      attempt("2026-07-29", "solved", 3),
      attempt("2026-07-28", "failed", 6),
      attempt("2026-07-27", "solved", 2),
    ]);

    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(1);
  });

  it("breaks the streak on a still-in-progress day", () => {
    const stats = computeHistoryStats([
      attempt("2026-07-29", "playing", 2),
      attempt("2026-07-28", "solved", 3),
      attempt("2026-07-27", "solved", 4),
    ]);

    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(2);
  });

  it("finds the max streak in the middle of history, distinct from the current streak", () => {
    const stats = computeHistoryStats([
      attempt("2026-07-29", "solved", 3), // current streak: 1
      attempt("2026-07-28", "failed", 6),
      attempt("2026-07-27", "solved", 2),
      attempt("2026-07-26", "solved", 3),
      attempt("2026-07-25", "solved", 4), // best run: 3 (07-25..07-27)
    ]);

    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(3);
  });

  it("only counts solved attempts in the guess distribution, keyed by guess count at solve", () => {
    const stats = computeHistoryStats([
      attempt("2026-07-29", "solved", 3),
      attempt("2026-07-28", "solved", 3),
      attempt("2026-07-27", "failed", 6),
      attempt("2026-07-26", "solved", 1),
    ]);

    expect(stats.guessDistribution).toEqual({ 1: 1, 2: 0, 3: 2, 4: 0, 5: 0, 6: 0 });
  });

  it("computes win rate across solved and unsolved attempts", () => {
    const stats = computeHistoryStats([
      attempt("2026-07-29", "solved", 3),
      attempt("2026-07-28", "failed", 6),
      attempt("2026-07-27", "playing", 2),
      attempt("2026-07-26", "solved", 4),
    ]);

    expect(stats.gamesPlayed).toBe(4);
    expect(stats.gamesSolved).toBe(2);
    expect(stats.winRate).toBe(0.5);
  });
});

describe("buildStreakMosaic", () => {
  it("fills a day with no attempt row as unplayed", () => {
    const cells = buildStreakMosaic([], { fromKey: "2026-07-27", toKey: "2026-07-29" });

    expect(cells).toEqual([
      { dateKey: "2026-07-27", status: "unplayed", guessCount: null },
      { dateKey: "2026-07-28", status: "unplayed", guessCount: null },
      { dateKey: "2026-07-29", status: "unplayed", guessCount: null },
    ]);
  });

  it("returns one cell per day in range, oldest first, regardless of attempt order", () => {
    const cells = buildStreakMosaic(
      [attempt("2026-07-29", "solved", 2), attempt("2026-07-27", "failed", 6)],
      { fromKey: "2026-07-27", toKey: "2026-07-29" },
    );

    expect(cells.map((c) => c.dateKey)).toEqual(["2026-07-27", "2026-07-28", "2026-07-29"]);
    expect(cells[0].status).toBe("failed");
    expect(cells[1].status).toBe("unplayed");
    expect(cells[2]).toEqual({ dateKey: "2026-07-29", status: "solved", guessCount: 2 });
  });

  it("carries guess count only for solved days", () => {
    const cells = buildStreakMosaic(
      [attempt("2026-07-27", "solved", 4), attempt("2026-07-28", "playing", 1)],
      { fromKey: "2026-07-27", toKey: "2026-07-28" },
    );

    expect(cells[0].guessCount).toBe(4);
    expect(cells[1]).toEqual({ dateKey: "2026-07-28", status: "playing", guessCount: null });
  });
});
