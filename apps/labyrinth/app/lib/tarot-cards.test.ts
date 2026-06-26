import { describe, expect, it } from "vitest";

import { DAILY_TAROT_CARDS, TAROT_CARDS } from "./tarot-cards";
import { isMajorArcanaCard, isMinorArcanaCourtCard, isMinorArcanaPipCard } from "./tarot-types";

describe("tarot card normalization", () => {
  it("normalizes the full deck into strict tarot subtypes", () => {
    expect(TAROT_CARDS).toHaveLength(78);
    expect(TAROT_CARDS.filter(isMajorArcanaCard)).toHaveLength(22);
    expect(TAROT_CARDS.filter(isMinorArcanaPipCard)).toHaveLength(40);
    expect(TAROT_CARDS.filter(isMinorArcanaCourtCard)).toHaveLength(16);
  });

  it("builds a daily card model with required reading fields", () => {
    const fool = DAILY_TAROT_CARDS.find((card) => card.name === "The Fool");

    expect(fool).toMatchObject({
      id: "major-arcana.trump.the-fool",
      arcana: "Major Arcana",
      suit: "Trump",
      rank: "The Fool",
    });
    expect(fool?.curatedReading.uprightSummary).toBeTruthy();
    expect(fool?.curatedReading.shadowSummary).toBeTruthy();
    expect(fool?.reflectionQuestions.length).toBeGreaterThan(0);
  });
});
