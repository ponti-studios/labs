import { describe, expect, it } from "vitest";

import {
  MAX_GUESSES,
  RHOBH_PUZZLES,
  evaluateGuess,
  getKeyboardState,
  getPuzzleForDate,
  normalizeGuess,
} from "./rhobh-wordle";

describe("rhobh-wordle helpers", () => {
  it("normalizes guesses to uppercase letters", () => {
    expect(normalizeGuess(" Er!ika 123 ")).toBe("ERIKA");
  });

  it("returns a stable puzzle for the same utc day", () => {
    const morning = getPuzzleForDate(new Date("2026-05-20T01:00:00.000Z"));
    const evening = getPuzzleForDate(new Date("2026-05-20T23:59:59.000Z"));

    expect(morning).toBe(evening);
    expect(RHOBH_PUZZLES).toContain(morning);
  });

  it("evaluates guesses with wordle-style duplicate handling", () => {
    expect(evaluateGuess("TILLY", "TULLY")).toEqual([
      "correct",
      "absent",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("keeps the strongest keyboard state for each letter", () => {
    expect(getKeyboardState("ERIKA", ["DORIT", "ERIKA"])).toMatchObject({
      D: "absent",
      E: "correct",
      R: "correct",
      I: "correct",
      K: "correct",
      A: "correct",
    });
  });

  it("keeps the game at six guesses", () => {
    expect(MAX_GUESSES).toBe(6);
  });
});
