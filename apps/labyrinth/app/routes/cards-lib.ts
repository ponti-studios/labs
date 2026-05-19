const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["H", "D", "C", "S"] as const;

type SuitSymbol = "♥" | "♦" | "♣" | "♠";

function getSuit(suit: (typeof SUITS)[number]): SuitSymbol {
  switch (suit) {
    case "H":
      return "♥";
    case "D":
      return "♦";
    case "C":
      return "♣";
    case "S":
      return "♠";
  }
}

export class Card {
  id: string;
  suit: SuitSymbol;
  rank: string;
  value: number;

  constructor(suit: (typeof SUITS)[number], rank: string) {
    this.id = `${suit} ${rank}`;
    this.suit = getSuit(suit);
    this.rank = rank;
    this.value = SUITS.indexOf(suit) + RANKS.indexOf(rank) + 2;
  }
}

export class Deck {
  cards: Card[];

  constructor() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push(new Card(suit, rank));
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal() {
    return this.cards.pop();
  }
}

export function createDeck() {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(new Card(suit, rank));
    }
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export { RANKS, SUITS };
