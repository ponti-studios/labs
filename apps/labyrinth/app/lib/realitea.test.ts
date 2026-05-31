import { describe, expect, it } from "vitest";

import {
  MAX_GUESSES,
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
    const morning = getPuzzleKeyForDate(new Date(2026, 4, 20, 1, 0, 0));
    const evening = getPuzzleKeyForDate(new Date(2026, 4, 20, 23, 59, 59));

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
