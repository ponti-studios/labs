export const TAROT_SPREADS = {
  three_card: {
    name: "Three Card Spread",
    positions: ["Past", "Present", "Future"],
    description: "A classic spread to understand the past, present, and future of a situation.",
  },
  celtic_cross: {
    name: "Celtic Cross",
    positions: [
      "Present Situation",
      "Challenge",
      "Distant Past",
      "Recent Past",
      "Possible Outcome",
      "Near Future",
      "Your Attitude",
      "Outside Influences",
      "Hopes & Fears",
      "Final Outcome",
    ],
    description: "A comprehensive spread exploring all aspects of a situation.",
  },
  one_card: {
    name: "One Card Draw",
    positions: ["Daily Guidance"],
    description: "A simple daily card for guidance and reflection.",
  },
} as const;

export type TarotSpreadType = keyof typeof TAROT_SPREADS;
