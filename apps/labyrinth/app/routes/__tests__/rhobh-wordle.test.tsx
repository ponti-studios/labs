import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getPuzzleForDate,
  getPuzzleKeyForDate,
  normalizeGuess,
} from "../../lib/rhobh-wordle";
import RhobhWordleRoute from "../games/rhobh-wordle";

function renderRoute() {
  return render(
    <MemoryRouter>
      <RhobhWordleRoute />
    </MemoryRouter>,
  );
}

function submitGuess(guess: string) {
  for (const letter of normalizeGuess(guess)) {
    fireEvent.click(screen.getByRole("button", { name: letter }));
  }

  fireEvent.click(screen.getByRole("button", { name: "Enter" }));
}

describe("RhobhWordleRoute", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it("restores saved progress for the same puzzle key after reload", () => {
    const date = new Date("2026-05-20T12:00:00.000Z");
    const puzzle = getPuzzleForDate(date);
    const puzzleKey = getPuzzleKeyForDate(date);
    const storageKey = `labyrinth:rhobh-wordle:${puzzleKey}`;
    const { unmount } = renderRoute();

    submitGuess(puzzle.answer);

    expect(screen.getByText(`Correct. ${puzzle.answer} was today's Beverly Hills answer.`)).toBeInTheDocument();

    unmount();
    renderRoute();

    expect(screen.getByText(`Correct. ${puzzle.answer} was today's Beverly Hills answer.`)).toBeInTheDocument();
    expect(screen.getByText("1 / 6")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}")).toMatchObject({
      puzzleKey,
      guesses: [puzzle.answer],
      status: "solved",
    });
  });

  it("clears current puzzle progress when reset is pressed", () => {
    renderRoute();

    submitGuess("Erika");
    expect(screen.getByText("1 / 6")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset board" }));

    expect(screen.getByText("0 / 6")).toBeInTheDocument();
    expect(
      screen.getByText("Daily challenge: guess the Beverly Hills name in 5 letters."),
    ).toBeInTheDocument();
  });

  it("rotates to a fresh puzzle when the utc day changes", () => {
    const firstDate = new Date("2026-05-20T12:00:00.000Z");
    const secondDate = new Date("2026-05-21T12:00:00.000Z");
    const firstPuzzle = getPuzzleForDate(firstDate);
    const secondPuzzle = getPuzzleForDate(secondDate);

    renderRoute();
    submitGuess(firstPuzzle.answer);
    expect(screen.getByText("1 / 6")).toBeInTheDocument();
    expect(screen.getByText(firstPuzzle.clue)).toBeInTheDocument();

    act(() => {
      vi.setSystemTime(secondDate);
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByText(secondPuzzle.clue)).toBeInTheDocument();
    expect(screen.getByText("0 / 6")).toBeInTheDocument();
    expect(
      screen.getByText(
        `Daily challenge: guess the Beverly Hills name in ${secondPuzzle.answer.length} letters.`,
      ),
    ).toBeInTheDocument();
  });

  it("ignores stale saved state for a different puzzle key", () => {
    const staleDate = new Date("2026-05-19T12:00:00.000Z");
    const stalePuzzle = getPuzzleForDate(staleDate);
    const stalePuzzleKey = getPuzzleKeyForDate(staleDate);

    window.localStorage.setItem(
      `labyrinth:rhobh-wordle:${stalePuzzleKey}`,
      JSON.stringify({
        puzzleKey: stalePuzzleKey,
        guesses: [stalePuzzle.answer],
        message: `Correct. ${stalePuzzle.answer} was today's Beverly Hills answer.`,
        status: "solved",
      }),
    );

    renderRoute();

    expect(screen.getByText("0 / 6")).toBeInTheDocument();
    expect(screen.queryByText(stalePuzzle.answer)).not.toBeInTheDocument();
  });

  it("rejects guesses outside the curated puzzle set", () => {
    renderRoute();

    submitGuess("zzzzz");

    expect(screen.getByText("Try a name from this Beverly Hills puzzle set.")).toBeInTheDocument();
    expect(screen.getByText("0 / 6")).toBeInTheDocument();
  });
});
