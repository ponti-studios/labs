import { describe, expect, it, vi } from "vitest";

import { evaluateGuess, type WhatGuess } from "../index";
import { buildWhatShareText, shareWhatResult } from "../client/share";

const SAMPLE_ANSWER = "ERIKA";
const SAMPLE_GUESSES = ["ERIKA", "DORIT", "KYLEE", "TILLY", "DORIT", "KYLEE"];

function makeGuesses(words: readonly string[], answer = SAMPLE_ANSWER): WhatGuess[] {
  return words.map((word) => ({ word, states: evaluateGuess(answer, word) }));
}

describe("what share helpers", () => {
  it("builds a solved share grid without revealing the answer text", () => {
    expect(
      buildWhatShareText(makeGuesses(["ERIKA"]), true, new Date("2026-05-20T12:00:00.000Z")),
    ).toBe("WH?T - 20 May 2026\n1/6\n\n🟩🟩🟩🟩🟩");
  });

  it("uses X score when the puzzle is lost", () => {
    const text = buildWhatShareText(
      makeGuesses(SAMPLE_GUESSES),
      false,
      new Date("2026-05-20T12:00:00.000Z"),
    );
    expect(text).toContain("\nX/6\n");
  });

  it("copies to the clipboard when available", async () => {
    const copyToClipboard = vi.fn().mockResolvedValue(undefined);
    const promptCopy = vi.fn();

    const result = await shareWhatResult({
      guesses: makeGuesses(["ERIKA"]),
      isSolved: true,
      date: new Date("2026-05-20T12:00:00.000Z"),
      copyToClipboard,
      promptCopy,
    });

    expect(copyToClipboard).toHaveBeenCalledWith("WH?T - 20 May 2026\n1/6\n\n🟩🟩🟩🟩🟩");
    expect(promptCopy).not.toHaveBeenCalled();
    expect(result.method).toBe("clipboard");
  });

  it("falls back to prompt when clipboard copy fails", async () => {
    const copyToClipboard = vi.fn().mockRejectedValue(new Error("denied"));
    const promptCopy = vi.fn();

    const result = await shareWhatResult({
      guesses: makeGuesses(["ERIKA"]),
      isSolved: true,
      date: new Date("2026-05-20T12:00:00.000Z"),
      copyToClipboard,
      promptCopy,
    });

    expect(promptCopy).toHaveBeenCalledWith(
      "Copy your WH?T result:",
      "WH?T - 20 May 2026\n1/6\n\n🟩🟩🟩🟩🟩",
    );
    expect(result.method).toBe("prompt");
  });
});
