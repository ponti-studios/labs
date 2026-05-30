import { describe, expect, it, vi } from "vitest";

import { buildRealiTeaShareText, shareRealiTeaResult } from "./realitea-share";

describe("realitea share helpers", () => {
  it("builds a solved share grid without revealing the answer text", () => {
    expect(buildRealiTeaShareText("ERIKA", ["ERIKA"], true, new Date("2026-05-20T12:00:00.000Z"))).toBe(
      "RealiTea - 20 May 2026\n1/6\n\n🟩🟩🟩🟩🟩",
    );
  });

  it("uses X score when the puzzle is lost", () => {
    expect(
      buildRealiTeaShareText(
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

    const result = await shareRealiTeaResult({
      answer: "ERIKA",
      guesses: ["ERIKA"],
      isSolved: true,
      date: new Date("2026-05-20T12:00:00.000Z"),
      copyToClipboard,
      promptCopy,
    });

    expect(copyToClipboard).toHaveBeenCalledWith("RealiTea - 20 May 2026\n1/6\n\n🟩🟩🟩🟩🟩");
    expect(promptCopy).not.toHaveBeenCalled();
    expect(result.method).toBe("clipboard");
  });

  it("falls back to prompt when clipboard copy fails", async () => {
    const copyToClipboard = vi.fn().mockRejectedValue(new Error("denied"));
    const promptCopy = vi.fn();

    const result = await shareRealiTeaResult({
      answer: "ERIKA",
      guesses: ["ERIKA"],
      isSolved: true,
      date: new Date("2026-05-20T12:00:00.000Z"),
      copyToClipboard,
      promptCopy,
    });

    expect(promptCopy).toHaveBeenCalledWith(
      "Copy your RealiTea result:",
      "RealiTea - 20 May 2026\n1/6\n\n🟩🟩🟩🟩🟩",
    );
    expect(result.method).toBe("prompt");
  });
});