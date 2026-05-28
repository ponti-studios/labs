import { describe, expect, it, vi } from "vitest";

import { buildRhobhShareText, shareRhobhResult } from "./rhobh-wordle-share";

describe("rhobh-wordle share helpers", () => {
  it("builds a solved share grid without revealing the answer text", () => {
    expect(buildRhobhShareText("ERIKA", ["ERIKA"], true, new Date("2026-05-20T12:00:00.000Z"))).toBe(
      "RHOBH Wordle - 20 May 2026\n1/6\n\n🟩🟩🟩🟩🟩",
    );
  });

  it("uses X score when the puzzle is lost", () => {
    expect(
      buildRhobhShareText(
        "ERIKA",
        ["DORIT", "KYLEE", "TILLY", "DORIT", "KYLEE", "TILLY"],
        false,
        new Date("2026-05-20T12:00:00.000Z"),
      ),
    ).toContain("\nX/6\n");
  });

  it("copies to the clipboard when available", async () => {
    const copyToClipboard = vi.fn().mockResolvedValue(undefined);
    const promptCopy = vi.fn();

    const result = await shareRhobhResult({
      answer: "ERIKA",
      guesses: ["ERIKA"],
      isSolved: true,
      date: new Date("2026-05-20T12:00:00.000Z"),
      copyToClipboard,
      promptCopy,
    });

    expect(copyToClipboard).toHaveBeenCalledWith("RHOBH Wordle - 20 May 2026\n1/6\n\n🟩🟩🟩🟩🟩");
    expect(promptCopy).not.toHaveBeenCalled();
    expect(result.method).toBe("clipboard");
  });

  it("falls back to prompt when clipboard copy fails", async () => {
    const copyToClipboard = vi.fn().mockRejectedValue(new Error("denied"));
    const promptCopy = vi.fn();

    const result = await shareRhobhResult({
      answer: "ERIKA",
      guesses: ["ERIKA"],
      isSolved: true,
      date: new Date("2026-05-20T12:00:00.000Z"),
      copyToClipboard,
      promptCopy,
    });

    expect(promptCopy).toHaveBeenCalledWith(
      "Copy your RHOBH result:",
      "RHOBH Wordle - 20 May 2026\n1/6\n\n🟩🟩🟩🟩🟩",
    );
    expect(result.method).toBe("prompt");
  });
});
