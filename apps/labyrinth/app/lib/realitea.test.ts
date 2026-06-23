import { describe, expect, it } from "vitest";

import {
  MAX_GUESSES,
  REALITEA_ANSWER_LENGTH,
  evaluateGuess,
  getKeyboardState,
  getPuzzleKeyForDate,
  normalizeGuess,
} from "./realitea";

describe("realitea helpers", () => {
  it("normalizes guesses to uppercase letters", () => {
    expect(normalizeGuess(" Er!ika 123 ")).toBe("ERIKA");
  });

  it("returns a stable puzzle key for the same local day", () => {
    const morning = getPuzzleKeyForDate(new Date("2026-05-20T08:00:00.000Z"));
    const evening = getPuzzleKeyForDate(new Date("2026-05-21T06:59:59.000Z"));

    expect(morning).toBe(evening);
    expect(morning).toMatch(/^bravo-\d+$/);
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
    const guesses = ["DORIT", "ERIKA"].map((word) => ({
      word,
      states: evaluateGuess("ERIKA", word),
    }));
    expect(getKeyboardState(guesses)).toMatchObject({
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

  it("locks RealiTea answers to five letters", () => {
    expect(REALITEA_ANSWER_LENGTH).toBe(5);
  });
});
