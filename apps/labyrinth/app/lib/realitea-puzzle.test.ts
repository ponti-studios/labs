import { describe, expect, it } from "vitest";

import { getDateKey, getPuzzleWindow } from "./realitea-date";
import { validateCandidate } from "./realitea-validation";

const BRAVO_URL = "https://www.bravotv.com/the-daily-dish/test-story";

describe("realitea daily puzzle helpers", () => {
  it("rejects multi-word answers that normalize to more than five letters", () => {
    const result = validateCandidate({
      answer: "Tea Set",
      answerType: "place",
      clue: "A prim little object that fits the game's whole vibe.",
      detail: "A tiny tea set channels the campy elegance that makes the franchise memorable.",

      sourceUrls: [BRAVO_URL],
    });

    expect(result.normalizedAnswer).toBe("TEASET");
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer must normalize to exactly five letters");
  });

  it("accepts answers that normalize to exactly five letters", () => {
    const result = validateCandidate({
      answer: "Aspen",
      answerType: "place",
      clue: "A snowy destination tied to one of the franchise's messiest trips.",
      detail: "This trip setting became shorthand for off-camera accusations and fallout.",

      sourceUrls: [BRAVO_URL],
    });

    expect(result.valid).toBe(true);
  });

  it("rejects answers whose normalized length is not exactly five", () => {
    const result = validateCandidate({
      answer: "RH",
      answerType: "phrase",
      clue: "Too short to qualify.",
      detail: "This should never pass validation.",

      sourceUrls: [BRAVO_URL],
    });

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer must normalize to exactly five letters");
  });

  it("rejects candidates that leak the answer in the clue or detail", () => {
    const result = validateCandidate({
      answer: "Smile",
      answerType: "storyline",
      clue: "That smile became one of the biggest scandals ever.",
      detail: "The fallout split the cast.",

      sourceUrls: [BRAVO_URL],
    });

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer is leaked in clue or detail");
  });

  it("rejects answers that repeat inside the cooldown window", () => {
    const result = validateCandidate(
      {
        answer: "Aspen",
        answerType: "place",
        clue: "A snowy trip that detonated into one of the franchise's biggest fights.",
        detail: "The aftermath of this cast trip lingered all season.",

        sourceUrls: [BRAVO_URL],
      },
      new Set(["ASPEN"]),
    );

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer repeats inside cooldown window");
  });

  it("rejects candidates missing a bravotv.com source URL", () => {
    const result = validateCandidate({
      answer: "Rumor",
      answerType: "storyline",
      clue: "A relationship update is suddenly the center of coverage.",
      detail: "This story is dominating the news cycle.",

      sourceUrls: ["https://people.com/latest-bravo-story"],
    });

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("candidate is missing a bravotv.com source URL");
  });

  it("rejects candidates with no source URLs", () => {
    const result = validateCandidate({
      answer: "Drama",
      answerType: "moment",
      clue: "A clash that keeps the whole cast spinning.",
      detail: "A single conflict can dominate the full episode.",

      sourceUrls: [],
    });

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("candidate is missing a bravotv.com source URL");
  });

  it("accepts valid candidates with a bravotv.com source URL", () => {
    const result = validateCandidate({
      answer: "Drama",
      answerType: "moment",
      clue: "A clash that keeps the whole cast spinning.",
      detail: "A single conflict can dominate the full episode.",

      sourceUrls: [BRAVO_URL],
    });

    expect(result.valid).toBe(true);
  });

  it("rejects person answer types", () => {
    const result = validateCandidate({
      answer: "Dorit",
      answerType: "person",
      clue: "A Beverly Hills diamond is dealing with friendship fallout.",
      detail: "She remains central to the post-reunion conversation.",

      sourceUrls: [BRAVO_URL],
    });

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain(
      "answer type must not be a person; prefer a storyline, moment, place, or phrase",
    );
  });

  it("uses the canonical UTC day boundary", () => {
    const justBeforeMidnight = new Date("2026-06-16T23:59:59.999Z");
    const justAfterMidnight = new Date("2026-06-17T00:00:00.000Z");

    expect(getDateKey(justBeforeMidnight)).toBe("2026-06-16");
    expect(getDateKey(justAfterMidnight)).toBe("2026-06-17");

    const window = getPuzzleWindow(justBeforeMidnight);
    expect(window.dateKey).toBe("2026-06-16");
    expect(window.publishAt.toISOString()).toBe("2026-06-16T00:00:00.000Z");
    expect(window.expireAt.toISOString()).toBe("2026-06-17T00:00:00.000Z");
  });
});
