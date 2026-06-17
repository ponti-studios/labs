import { describe, expect, it } from "vitest";

import {
  getDateKey,
  getPuzzleWindow,
  parseGenerationResponse,
  RHOBH_PRIMARY_SOURCE_DOMAIN,
  validateCandidate,
  type GeneratedCandidate,
} from "./realitea-daily-puzzle";

const currentPool: GeneratedCandidate[] = [
  {
    answer: "TEARS",
    answerType: "storyline",
    clue: "A flood of emotion that takes over a major RHOBH confrontation.",
    detail:
      "A dramatic RHOBH breakdown can turn tears into the episode's defining image and emotional pivot.",
    newsMode: "current",
    rationale: "Archive fixture",
    role: "Emotional fallout",
    sourcePublishedAt: [],
    sourceSummary: [],
    sourceTitles: [],
    sourceUrls: [],
  },
  {
    answer: "SWANS",
    answerType: "place",
    clue: "These elegant birds are inseparable from one iconic Beverly Hills estate.",
    detail: "The estate's swans became one of the most recognizable bits of RHOBH visual lore.",
    newsMode: "current",
    rationale: "Archive fixture",
    role: "Estate mascots",
    sourcePublishedAt: [],
    sourceSummary: [],
    sourceTitles: [],
    sourceUrls: [],
  },
  {
    answer: "BUNNY",
    answerType: "object",
    clue: "A small gift turned reunion seating into an all-time uncomfortable moment.",
    detail:
      "The returned bunny became one of the show's most memorable symbols of unresolved hurt and public fallout.",
    newsMode: "current",
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
    const candidate: GeneratedCandidate = {
      answer: "Tea Set",
      answerType: "place",
      clue: "A prim little object that fits the game's whole vibe.",
      detail: "A tiny tea set channels the campy elegance that makes the franchise memorable.",
      newsMode: "current",
      rationale: "Compact RHOBH object",
      role: "Tabletop prop",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateCandidate(candidate, {});

    expect(result.normalizedAnswer).toBe("TEASET");
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer must normalize to exactly five letters");
  });

  it("accepts answers that normalize to exactly five letters", () => {
    const candidate: GeneratedCandidate = {
      answer: "Aspen",
      answerType: "place",
      clue: "A snowy destination tied to one of the franchise's messiest trips.",
      detail: "This RHOBH trip setting became shorthand for off-camera accusations and fallout.",
      newsMode: "current",
      rationale: "Compact RHOBH place",
      role: "Trip destination",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateCandidate(candidate, {});

    expect(result.valid).toBe(true);
  });

  it("rejects answers whose normalized length is not exactly five", () => {
    const candidate: GeneratedCandidate = {
      answer: "RH",
      answerType: "phrase",
      clue: "Too short to qualify.",
      detail: "This should never pass validation.",
      newsMode: "current",
      rationale: "Invalid",
      role: "Invalid",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    };

    const result = validateCandidate(candidate, {});

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer must normalize to exactly five letters");
  });

  it("rejects candidates that leak the answer in the clue or detail", () => {
    const candidate: GeneratedCandidate = {
      answer: "Puppygate",
      answerType: "storyline",
      clue: "Puppygate became one of the biggest RHOBH scandals ever.",
      detail: "The Puppygate fallout split the cast.",
      newsMode: "current",
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
    const candidate: GeneratedCandidate = {
      answer: "Aspen",
      answerType: "place",
      clue: "A snowy trip that detonated into one of the franchise's biggest fights.",
      detail: "The aftermath of this cast trip lingered all season.",
      newsMode: "current",
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

  it("still rejects overlength current-news candidates before source checks", () => {
    const candidate: GeneratedCandidate = {
      answer: "Separation",
      answerType: "storyline",
      clue: "A relationship update is suddenly the center of the latest RHOBH coverage.",
      detail: "This story is dominating the RHOBH news cycle.",
      newsMode: "current",
      rationale: "Current news test",
      role: "Trending headline",
      sourcePublishedAt: ["2026-05-27T00:00:00.000Z"],
      sourceSummary: ["Coverage summary"],
      sourceTitles: ["Coverage title"],
      sourceUrls: ["https://people.com/latest-rhobh-story"],
    };

    const result = validateCandidate(candidate);

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer must normalize to exactly five letters");
    expect(result.reasons).toContain("current candidate is missing Bravo primary coverage");
    expect(result.reasons).toContain("current candidate is missing a corroborating source");
  });

  it("requires Bravo plus one corroborator for current-news candidates", () => {
    const candidate: GeneratedCandidate = {
      answer: "Rumor",
      answerType: "storyline",
      clue: "A relationship update is suddenly the center of the latest RHOBH coverage.",
      detail: "This story is dominating the RHOBH news cycle.",
      newsMode: "current",
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

  it("still rejects overlength current-news candidates even with strong source support", () => {
    const candidate: GeneratedCandidate = {
      answer: "Reunion",
      answerType: "moment",
      clue: "The latest RHOBH fallout is barreling toward this must-watch taping.",
      detail: "The current RHOBH conversation is building toward the next big sit-down.",
      newsMode: "current",
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

    expect(result.valid).toBe(false);
    expect(result.reasons).toContain("answer must normalize to exactly five letters");
  });

  it("accepts current-news candidates with exactly five letters plus Bravo and a corroborating source", () => {
    const candidate: GeneratedCandidate = {
      answer: "Drama",
      answerType: "moment",
      clue: "The latest RHOBH fallout is barreling toward this must-watch taping.",
      detail: "The current RHOBH conversation is building toward the next big sit-down.",
      newsMode: "current",
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
    const candidate: GeneratedCandidate = {
      answer: "Dorit",
      answerType: "person",
      clue: "A Beverly Hills diamond is dealing with friendship fallout and divorce headlines.",
      detail:
        "She remains central to the post-reunion conversation and a messy financial storyline.",
      newsMode: "current",
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
    const candidate: GeneratedCandidate = {
      answer: "Party",
      answerType: "moment",
      clue: "A made-up callback with no curated provenance.",
      detail: "This should be rejected because it is not generated from current sources.",
      newsMode: "archive",
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

  it("uses the canonical global day boundary for late-evening Pacific access", () => {
    const latePacificEvening = new Date("2026-06-17T04:00:00.000Z");
    const window = getPuzzleWindow(latePacificEvening);

    expect(getDateKey(latePacificEvening)).toBe("2026-06-16");
    expect(window.dateKey).toBe("2026-06-16");
    expect(window.publishAt.toISOString()).toBe("2026-06-16T07:00:00.000Z");
    expect(window.expireAt.toISOString()).toBe("2026-06-17T07:00:00.000Z");
  });
});
