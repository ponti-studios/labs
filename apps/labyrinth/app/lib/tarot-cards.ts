import tarotData from "../data/tarot-cards.json";
import type {
  CourtRank,
  CuratedDailyReading,
  DailyTarotCard,
  MinorPipRank,
  RawTarotCard,
  TarotCard,
  TarotStudyNotes,
} from "./tarot-types";

const PIP_VALUES: Record<MinorPipRank, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10> = {
  Ace: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
  Eight: 8,
  Nine: 9,
  Ten: 10,
};

const COURT_RANKS: CourtRank[] = ["Page", "Knight", "Queen", "King"];

function buildStudyNotes(card: RawTarotCard): TarotStudyNotes | undefined {
  const studyNotes: TarotStudyNotes = {
    archetype: card.Archetype,
    numerology: card.Numerology,
    elemental: card.Elemental,
    astrology: card.Astrology,
    hebrewAlphabet: card["Hebrew Alphabet"],
    mythicalSpiritual: card["Mythical/Spiritual"],
    affirmation: card.Affirmation,
  };

  return Object.values(studyNotes).some(Boolean) ? studyNotes : undefined;
}

function buildCuratedReading(card: RawTarotCard): CuratedDailyReading {
  return {
    uprightSummary: card.meanings.light[0] ?? card.keywords[0] ?? card.name,
    uprightDetails: card.meanings.light,
    shadowSummary: card.meanings.shadow[0] ?? card.keywords[1] ?? card.name,
    shadowDetails: card.meanings.shadow,
    fortuneTelling: card.fortune_telling,
  };
}

function getCardId(card: RawTarotCard) {
  return card.img.replace(/\.jpg$/i, "");
}

function normalizeMinorCard(card: RawTarotCard): TarotCard {
  if (card.suit === "Trump") {
    throw new Error(`Minor arcana card ${card.name} cannot use Trump as its suit`);
  }

  const [rankToken] = card.name.split(" of ");
  const suit = card.suit;

  if ((Object.keys(PIP_VALUES) as MinorPipRank[]).includes(rankToken as MinorPipRank)) {
    const rank = rankToken as MinorPipRank;

    return {
      ...card,
      id: getCardId(card),
      kind: "minor-pip",
      suit,
      arcana: "Minor Arcana",
      rank,
      pipValue: PIP_VALUES[rank],
      studyNotes: buildStudyNotes(card),
    };
  }

  if (COURT_RANKS.includes(rankToken as CourtRank)) {
    return {
      ...card,
      id: getCardId(card),
      kind: "minor-court",
      suit,
      arcana: "Minor Arcana",
      rank: rankToken as CourtRank,
      studyNotes: buildStudyNotes(card),
    };
  }

  throw new Error(`Unsupported minor arcana rank for ${card.name}`);
}

function normalizeCard(card: RawTarotCard): TarotCard {
  if (card.arcana === "Major Arcana") {
    return {
      ...card,
      id: getCardId(card),
      kind: "major",
      arcana: "Major Arcana",
      suit: "Trump",
      majorIndex: Number.parseInt(card.number, 10),
      studyNotes: buildStudyNotes(card),
    };
  }

  return normalizeMinorCard(card);
}

function getDisplayRank(card: TarotCard): string {
  if (card.kind === "major") {
    return card.name;
  }

  return card.rank;
}

export const TAROT_CARDS: TarotCard[] = (tarotData.cards as RawTarotCard[]).map(normalizeCard);

export const DAILY_TAROT_CARDS: DailyTarotCard[] = TAROT_CARDS.map((card) => ({
  id: card.id,
  name: card.name,
  arcana: card.arcana,
  suit: card.suit,
  rank: getDisplayRank(card),
  img: card.img,
  keywords: card.keywords,
  reflectionQuestions: card["Questions to Ask"],
  curatedReading: buildCuratedReading(card),
  studyNotes: card.studyNotes,
  card,
}));

const getCardByName = (name: string): TarotCard | undefined => {
  return TAROT_CARDS.find((card) => card.name.toLowerCase() === name.toLowerCase());
};

const getDailyTarotCardById = (id: string): DailyTarotCard | undefined => {
  return DAILY_TAROT_CARDS.find((card) => card.id === id);
};

const getRandomCard = (): TarotCard => {
  return TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
};

const getRandomCards = (count: number): TarotCard[] => {
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

export const getRandomDailyTarotCard = (): DailyTarotCard => {
  return DAILY_TAROT_CARDS[Math.floor(Math.random() * DAILY_TAROT_CARDS.length)];
};
