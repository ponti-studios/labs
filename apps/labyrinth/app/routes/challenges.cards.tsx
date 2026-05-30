import { Button } from "@pontistudios/ui";
import { useState } from "react";

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["♥", "♦", "♣", "♠"] as const;

type SuitSymbol = (typeof SUITS)[number];

export class Card {
  id: string;
  suit: SuitSymbol;
  rank: string;
  value: number;

  constructor(suit: (typeof SUITS)[number], rank: string) {
    this.id = `${suit} ${rank}`;
    this.suit = suit;
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

type Winner = {
  id: Card["id"];
  score: number;
} | null;

export default function Cards() {
  const [deck, setDeck] = useState(() => new Deck().cards);
  const [hands, setHands] = useState<{ id: Card["id"]; cards: Card[]; score: number }[]>([]);
  const [winner, setWinner] = useState<Winner>(null);

  const dealHand = () => {
    if (deck.length < 5) return;

    const newDeck = [...deck];
    const hand: Card[] = [];
    for (let i = 0; i < 5; i++) {
      hand.push(newDeck.pop() as Card);
    }

    const score = hand.reduce((sum, card) => sum + card.value, 0);

    let newWinner: Winner = null;
    if (!winner || (winner && score > winner.score)) {
      newWinner = { id: hand[0].id, score };
    }

    setDeck(newDeck);
    setHands([...hands, { id: hand[0].id, cards: hand, score }]);
    setWinner(newWinner);
  };

  const collectHands = () => {
    setDeck(new Deck().cards);
    setHands([]);
    setWinner(null);
  };

  return (
    <div>
      <h2>Luck of the Draw</h2>
      <p>Deal hands and track the winner based on card values.</p>
      <div className="mb-4">
        <Button className="btn btn-primary" onClick={dealHand} disabled={deck.length < 5}>
          Deal Hand ({deck.length} cards left)
        </Button>
        <Button className="btn ml-2" onClick={collectHands}>
          Collect Hands
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        {hands.map((hand) => (
          <div
            key={hand.id}
            className={`card ${winner?.id === hand.id ? "bg-[#d4edda] border-[#c3e6cb]" : "bg-[#f8d7da] border-[#f5c6cb]"}`}
          >
            <div className="mb-2">
              <strong>Score: {hand.score}</strong>
              {winner?.id === hand.id && <span> - WINNER!</span>}
            </div>
            <div className="flex gap-2">
              {hand.cards.map((card) => (
                <div
                  key={card.id}
                  className={`w-[60px] border border-[#ccc] p-1 rounded-md bg-white ${card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-black"}`}
                >
                  <span>{card.rank}</span>
                  <span>{card.suit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
