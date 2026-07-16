import { describe, expect, it } from "vitest";

import {
  MAX_GUESSES,
  REALITEA_ANSWER_LENGTH,
  evaluateGuess,
  getKeyboardState,
  normalizeGuess,
} from "../index";

describe("realitea helpers", () => {
  it("normalizes guesses to uppercase letters", () => {
    expect(normalizeGuess(" Er!ika 123 ")).toBe("ERIKA");
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
