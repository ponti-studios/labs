import { describe, expect, it } from "vitest";

import { buildGameShareText } from "./share";
import type { GameGuess } from "./types";

const guesses: GameGuess[] = [
  {
    word: "FLANK",
    states: ["absent", "absent", "present", "absent", "present"],
  },
  {
    word: "BACKS",
    states: ["correct", "present", "correct", "correct", "correct"],
  },
];

describe("game sharing", () => {
  it("shares the spoiler-free emoji result without guess words", () => {
    const text = buildGameShareText(guesses, true, "Realitea", new Date("2026-08-20T00:00:00Z"));

    expect(text).toContain("WH?T · Realitea · 20 Aug 2026");
    expect(text).toContain("🟨");
    expect(text).not.toContain("FLANK");
    expect(text).not.toContain("BACKS");
  });
});
