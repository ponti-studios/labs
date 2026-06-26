export type TarotArcana = "Major Arcana" | "Minor Arcana";
export type MajorArcanaSuit = "Trump";
export type MinorArcanaSuit = "Cups" | "Pentacles" | "Swords" | "Wands";
export type TarotSuit = MajorArcanaSuit | MinorArcanaSuit;

export type MinorPipRank =
  | "Ace"
  | "Two"
  | "Three"
  | "Four"
  | "Five"
  | "Six"
  | "Seven"
  | "Eight"
  | "Nine"
  | "Ten";

export type CourtRank = "Page" | "Knight" | "Queen" | "King";
export type MinorArcanaRank = MinorPipRank | CourtRank;

export interface TarotMeanings {
  light: string[];
  shadow: string[];
}

export interface TarotStudyNotes {
  archetype?: string;
  numerology?: string;
  elemental?: string;
  astrology?: string;
  hebrewAlphabet?: string;
  mythicalSpiritual?: string;
  affirmation?: string;
}

export interface RawTarotCard {
  name: string;
  number: string;
  arcana: TarotArcana;
  suit: TarotSuit;
  img: string;
  fortune_telling: string[];
  keywords: string[];
  meanings: TarotMeanings;
  Archetype?: string;
  "Hebrew Alphabet"?: string;
  Numerology?: string;
  Elemental?: string;
  Astrology?: string;
  Affirmation?: string;
  "Mythical/Spiritual"?: string;
  "Questions to Ask": string[];
}

export interface BaseTarotCard {
  id: string;
  name: string;
  number: string;
  arcana: TarotArcana;
  suit: TarotSuit;
  img: string;
  fortune_telling: string[];
  keywords: string[];
  meanings: TarotMeanings;
  "Questions to Ask": string[];
  studyNotes?: TarotStudyNotes;
  Archetype?: string;
  "Hebrew Alphabet"?: string;
  Numerology?: string;
  Elemental?: string;
  Astrology?: string;
  Affirmation?: string;
  "Mythical/Spiritual"?: string;
}

export interface MajorArcanaCard extends BaseTarotCard {
  kind: "major";
  arcana: "Major Arcana";
  suit: "Trump";
  majorIndex: number;
}

export interface MinorArcanaBaseCard extends BaseTarotCard {
  arcana: "Minor Arcana";
  suit: MinorArcanaSuit;
  rank: MinorArcanaRank;
}

export interface MinorArcanaPipCard extends MinorArcanaBaseCard {
  kind: "minor-pip";
  rank: MinorPipRank;
  pipValue: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export interface MinorArcanaCourtCard extends MinorArcanaBaseCard {
  kind: "minor-court";
  rank: CourtRank;
}

export type TarotCard = MajorArcanaCard | MinorArcanaPipCard | MinorArcanaCourtCard;

export interface CuratedDailyReading {
  uprightSummary: string;
  uprightDetails: string[];
  shadowSummary: string;
  shadowDetails: string[];
  fortuneTelling: string[];
}

export interface DailyTarotCard {
  id: string;
  name: string;
  arcana: TarotArcana;
  suit: TarotSuit;
  rank: string;
  img: string;
  keywords: string[];
  reflectionQuestions: string[];
  curatedReading: CuratedDailyReading;
  studyNotes?: TarotStudyNotes;
  card: TarotCard;
}

export interface DailyTarotReading {
  headline: string;
  todayMessage: string;
  focus: string;
  reflectionPrompt: string;
  careNote: string;
}

export interface DailyTarotResult {
  date: string;
  card: DailyTarotCard;
  reading: DailyTarotReading;
  source: "ai" | "curated";
}

export const isMajorArcanaCard = (card: TarotCard): card is MajorArcanaCard =>
  card.kind === "major";

const isMinorArcanaCard = (
  card: TarotCard,
): card is MinorArcanaPipCard | MinorArcanaCourtCard => card.kind !== "major";

export const isMinorArcanaPipCard = (card: TarotCard): card is MinorArcanaPipCard =>
  card.kind === "minor-pip";

export const isMinorArcanaCourtCard = (card: TarotCard): card is MinorArcanaCourtCard =>
  card.kind === "minor-court";
