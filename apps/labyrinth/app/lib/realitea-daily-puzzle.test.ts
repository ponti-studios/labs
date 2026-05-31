import { describe, expect, it } from "vitest";

import {
  parseGenerationResponse,
  RHOBH_PRIMARY_SOURCE_DOMAIN,
  validateCandidate,
  type GeneratedCandidate,
} from "./realitea-daily-puzzle";

const currentPool: GeneratedCandidate[] = [
  {
    answer: "PUPPYGATE",
    answerType: "storyline" as const,
    clue: "A rescue-dog scandal that fractured the cast and dominated confessionals.",
    detail:
      "Puppygate became one of RHOBH's defining modern scandals, dragging friendships and loyalties into a season-long spiral.",
    newsMode: "current" as const,
    rationale: "Archive fixture",
    role: "Iconic cast fracture",
    sourcePublishedAt: [],
    sourceSummary: [],
    sourceTitles: [],
    sourceUrls: [],
  },
  {
    answer: "VILLAROSA",
    answerType: "place" as const,
    clue: "This pink-toned estate is practically a cast member in its own right.",
    detail:
      "Villa Rosa is Lisa Vanderpump's famously lavish home and a signature setting in RHOBH history.",
    newsMode: "current" as const,
    rationale: "Archive fixture",
    role: "Signature mansion",
    sourcePublishedAt: [],
    sourceSummary: [],
    sourceTitles: [],
    sourceUrls: [],
  },
  {
    answer: "BUNNY",
    answerType: "object" as const,
    clue: "A small gift turned reunion seating into an all-time uncomfortable moment.",
    detail:
      "The returned bunny became one of the show's most memorable symbols of unresolved hurt and public fallout.",
    newsMode: "current" as const,
    rationale: "Archive fixture",
    role: "Reunion prop",
    sourcePublishedAt: [],
    sourceSummary: [],
    sourceTitles: [],
    sourceUrls: [],
  },
];

describe("rhobh daily puzzle helpers", () => {
  it("accepts collapsed multi-word answers that normalize cleanly", () => {
    const candidate = {
      answer: "Villa Rosa",
      answerType: "place" as const,
      clue: "A legendary pink mansion with plenty of swans and RHOBH lore.",
      detail: "Lisa Vanderpump's home became one of the most iconic locations in the franchise.",
      newsMode: "current" as const,
      rationale: "Iconic RHOBH place",
      role: "Iconic home base",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateCandidate(candidate, {});

    expect(result.normalizedAnswer).toBe("VILLAROSA");
    expect(result.valid).toBe(true);
  });

  it("rejects answers with unsupported normalized length", () => {
    const candidate = {
      answer: "RH",
      answerType: "phrase" as const,
      clue: "Too short to qualify.",
      detail: "This should never pass validation.",
      newsMode: "current" as const,
      rationale: "Invalid",
      role: "Invalid",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateCandidate(candidate, {});

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer length is unsupported");
  });

  it("rejects candidates that leak the answer in the clue or detail", () => {
    const candidate = {
      answer: "Puppygate",
      answerType: "storyline" as const,
      clue: "Puppygate became one of the biggest RHOBH scandals ever.",
      detail: "The Puppygate fallout split the cast.",
      newsMode: "current" as const,
      rationale: "Spoiler",
      role: "Infamous scandal",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateCandidate(candidate, {});

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer is leaked in clue or detail");
  });

  it("rejects answers that repeat inside the cooldown window", () => {
    const candidate = {
      answer: "Aspen",
      answerType: "place" as const,
      clue: "A snowy trip that detonated into one of the franchise's biggest fights.",
      detail: "The aftermath of this cast trip lingered all season.",
      newsMode: "current" as const,
      rationale: "Repeat test",
      role: "Trip destination",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateCandidate(candidate, {
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

    const result = validateCandidate(candidate);

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

    const result = validateCandidate(candidate);

    expect(result.valid).toBe(true);
  });

  it("rejects current-news person answers as too obvious", () => {
    const candidate = {
      answer: "Dorit",
      answerType: "person" as const,
      clue: "A Beverly Hills diamond is dealing with friendship fallout and divorce headlines.",
      detail:
        "She remains central to the post-reunion conversation and a messy financial storyline.",
      newsMode: "current" as const,
      rationale: "Current news test",
      role: "Cast member",
      sourcePublishedAt: ["2026-05-27T00:00:00.000Z", "2026-05-27T00:00:00.000Z"],
      sourceSummary: ["Bravo summary", "People summary"],
      sourceTitles: ["Bravo title", "People title"],
      sourceUrls: [
        `https://www.${RHOBH_PRIMARY_SOURCE_DOMAIN}/the-daily-dish/rhobh-dorit-story`,
        "https://people.com/rhobh-dorit-story",
      ],
    };

    const result = validateCandidate(candidate);

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain(
      "current candidate is too obvious; prefer a more distinctive RHOBH-specific concept",
    );
  });

  it("rejects non-current candidates", () => {
    const candidate = {
      answer: "Random Moment",
      answerType: "moment" as const,
      clue: "A made-up callback with no curated provenance.",
      detail: "This should be rejected because it is not generated from current sources.",
      newsMode: "archive" as const,
      rationale: "Current-only test",
      role: "Invalid archive entry",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateCandidate(candidate);

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("candidate must be generated from current sources");
  });

  it("parses a strict generation response", () => {
    const parsed = parseGenerationResponse(
      JSON.stringify([currentPool[0], currentPool[1], currentPool[2]]),
    );

    expect(parsed).toHaveLength(3);
    expect(parsed[0].answer).toBe(currentPool[0].answer);
  });

  it("rejects malformed generation payloads", () => {
    expect(() =>
      parseGenerationResponse(
        JSON.stringify([
          {
            answer: "Puppygate",
            clue: "Missing required fields",
          },
        ]),
      ),
    ).toThrow();
  });
});
