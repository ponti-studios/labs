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
      <div style={{ marginBottom: "1rem" }}>
        <button className="btn btn-primary" onClick={dealHand} disabled={deck.length < 5}>
          Deal Hand ({deck.length} cards left)
        </button>
        <button className="btn" onClick={collectHands} style={{ marginLeft: "0.5rem" }}>
          Collect Hands
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {hands.map((hand) => (
          <div
            key={hand.id}
            className="card"
            style={{
              background: winner?.id === hand.id ? "#d4edda" : "#f8d7da",
              borderColor: winner?.id === hand.id ? "#c3e6cb" : "#f5c6cb",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Score: {hand.score}</strong>
              {winner?.id === hand.id && <span> - WINNER!</span>}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {hand.cards.map((card) => (
                <div
                  key={card.id}
                  style={{
                    width: "60px",
                    height: "84px",
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    color: card.suit === "♥" || card.suit === "♦" ? "red" : "black",
                  }}
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
