import type { TarotCard } from "./tarot-types";

// Import the tarot data
const tarotData = require("../data/tarot-cards.json");

export const TAROT_CARDS: TarotCard[] = tarotData.cards;

export const getCardByName = (name: string): TarotCard | undefined => {
  return TAROT_CARDS.find((card) => card.name.toLowerCase() === name.toLowerCase());
};

export const getRandomCard = (): TarotCard => {
  return TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
};

export const getRandomCards = (count: number): TarotCard[] => {
  const cards: TarotCard[] = [];
  const usedIndices = new Set<number>();

  while (cards.length < count) {
    const index = Math.floor(Math.random() * TAROT_CARDS.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      cards.push(TAROT_CARDS[index]);
    }
  }

  return cards;
};
