import { describe, expect, it } from "vitest";

import {
  chooseArchivePuzzle,
  getRhobhArchiveMoments,
  parseRhobhGenerationResponse,
  RHOBH_PRIMARY_SOURCE_DOMAIN,
  validateRhobhCandidate,
} from "./rhobh-daily-puzzle";

describe("rhobh daily puzzle helpers", () => {
  it("accepts collapsed multi-word answers that normalize cleanly", () => {
    const candidate = {
      answer: "Villa Rosa",
      answerType: "place" as const,
      clue: "A legendary pink mansion with plenty of swans and RHOBH lore.",
      detail: "Lisa Vanderpump's home became one of the most iconic locations in the franchise.",
      newsMode: "archive" as const,
      rationale: "Iconic RHOBH place",
      role: "Iconic home base",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateRhobhCandidate(candidate, {
      archiveAnswers: new Set(["VILLAROSA"]),
    });

    expect(result.normalizedAnswer).toBe("VILLAROSA");
    expect(result.valid).toBe(true);
  });

  it("rejects answers with unsupported normalized length", () => {
    const candidate = {
      answer: "RH",
      answerType: "phrase" as const,
      clue: "Too short to qualify.",
      detail: "This should never pass validation.",
      newsMode: "archive" as const,
      rationale: "Invalid",
      role: "Invalid",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateRhobhCandidate(candidate, {
      archiveAnswers: new Set(["RH"]),
    });

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer length is unsupported");
  });

  it("rejects candidates that leak the answer in the clue or detail", () => {
    const candidate = {
      answer: "Puppygate",
      answerType: "storyline" as const,
      clue: "Puppygate became one of the biggest RHOBH scandals ever.",
      detail: "The Puppygate fallout split the cast.",
      newsMode: "archive" as const,
      rationale: "Spoiler",
      role: "Infamous scandal",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateRhobhCandidate(candidate, {
      archiveAnswers: new Set(["PUPPYGATE"]),
    });

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer is leaked in clue or detail");
  });

  it("rejects answers that repeat inside the cooldown window", () => {
    const candidate = {
      answer: "Aspen",
      answerType: "place" as const,
      clue: "A snowy trip that detonated into one of the franchise's biggest fights.",
      detail: "The aftermath of this cast trip lingered all season.",
      newsMode: "archive" as const,
      rationale: "Repeat test",
      role: "Trip destination",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateRhobhCandidate(candidate, {
      archiveAnswers: new Set(["ASPEN"]),
      previousAnswers: new Set(["ASPEN"]),
    });

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer repeats inside cooldown window");
  });

  it("requires Bravo plus one corroborator for current-news candidates", () => {
    const candidate = {
      answer: "Separation",
      answerType: "storyline" as const,
      clue: "A relationship update is suddenly the center of the latest RHOBH coverage.",
      detail: "This story is dominating the RHOBH news cycle.",
      newsMode: "current" as const,
      rationale: "Current news test",
      role: "Trending headline",
      sourcePublishedAt: ["2026-05-27T00:00:00.000Z"],
      sourceSummary: ["Coverage summary"],
      sourceTitles: ["Coverage title"],
      sourceUrls: ["https://people.com/latest-rhobh-story"],
    };

    const result = validateRhobhCandidate(candidate);

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("current candidate is missing Bravo primary coverage");
    expect(result.reasons).toContain("current candidate is missing a corroborating source");
  });

  it("accepts current-news candidates with Bravo and a corroborating source", () => {
    const candidate = {
      answer: "Reunion",
      answerType: "moment" as const,
      clue: "The latest RHOBH fallout is barreling toward this must-watch taping.",
      detail: "The current RHOBH conversation is building toward the next big sit-down.",
      newsMode: "current" as const,
      rationale: "Current news test",
      role: "High-stakes event",
      sourcePublishedAt: ["2026-05-27T00:00:00.000Z", "2026-05-27T00:00:00.000Z"],
      sourceSummary: ["Bravo summary", "People summary"],
      sourceTitles: ["Bravo title", "People title"],
      sourceUrls: [
        `https://www.${RHOBH_PRIMARY_SOURCE_DOMAIN}/the-daily-dish/rhobh-reunion-story`,
        "https://people.com/rhobh-reunion-story",
      ],
    };

    const result = validateRhobhCandidate(candidate);

    expect(result.valid).toBe(true);
  });

  it("requires archive candidates to come from the curated archive pool", () => {
    const candidate = {
      answer: "Random Moment",
      answerType: "moment" as const,
      clue: "A made-up callback with no curated provenance.",
      detail: "This should be rejected because it is not in the archive pool.",
      newsMode: "archive" as const,
      rationale: "Archive provenance test",
      role: "Invalid archive entry",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateRhobhCandidate(candidate);

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("archive candidate is not backed by the curated archive pool");
  });

  it("parses a strict generation response", () => {
    const archiveCandidate = getRhobhArchiveMoments()[0];
    const secondArchiveCandidate = getRhobhArchiveMoments()[1];
    const thirdArchiveCandidate = getRhobhArchiveMoments()[2];

    const parsed = parseRhobhGenerationResponse(
      JSON.stringify([archiveCandidate, secondArchiveCandidate, thirdArchiveCandidate]),
    );

    expect(parsed).toHaveLength(3);
    expect(parsed[0].answer).toBe(archiveCandidate.answer);
  });

  it("rejects malformed generation payloads", () => {
    expect(() =>
      parseRhobhGenerationResponse(
        JSON.stringify([
          {
            answer: "Puppygate",
            clue: "Missing required fields",
          },
        ]),
      ),
    ).toThrow();
  });

  it("chooses a deterministic archive puzzle while respecting recent repeats", () => {
    const archivePool = getRhobhArchiveMoments();
    const skipped = archivePool[0];
    const chosen = chooseArchivePuzzle(new Date("2026-05-27T12:00:00.000Z"), new Set([skipped.answer]), [
      skipped,
      archivePool[1],
      archivePool[2],
    ]);

    expect(chosen.answer).not.toBe(skipped.answer);
  });
});
