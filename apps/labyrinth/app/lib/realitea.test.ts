import { describe, expect, it } from "vitest";

import {
  MAX_GUESSES,
  RHOBH_PUZZLES,
  evaluateGuess,
  getKeyboardState,
  getPuzzleKeyForDate,
  getPuzzleForDate,
  normalizeGuess,
} from "./realitea";

describe("realitea helpers", () => {
  it("normalizes guesses to uppercase letters", () => {
    expect(normalizeGuess(" Er!ika 123 ")).toBe("ERIKA");
  });

  it("returns a stable puzzle for the same utc day", () => {
    const morning = getPuzzleForDate(new Date("2026-05-20T01:00:00.000Z"));
    const evening = getPuzzleForDate(new Date("2026-05-20T23:59:59.000Z"));

    expect(morning).toBe(evening);
    expect(RHOBH_PUZZLES).toContain(morning);
  });

  it("returns a stable puzzle key for the same utc day", () => {
    const morning = getPuzzleKeyForDate(new Date("2026-05-20T01:00:00.000Z"));
    const evening = getPuzzleKeyForDate(new Date("2026-05-20T23:59:59.000Z"));

    expect(morning).toBe(evening);
    expect(morning).toMatch(/^rhobh-\d+$/);
  });

  it("evaluates guesses with duplicate-letter handling", () => {
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
