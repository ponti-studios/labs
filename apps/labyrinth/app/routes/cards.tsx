import { useState, type JSX } from "react";

import { createDeck, type Card } from "./cards-lib";

interface Hand {
  cards: Card[];
  id: string;
  score: number;
}

interface Winner {
  id: string;
  score: number;
}

export default function Cards(): JSX.Element {
  const [deck, setDeck] = useState<Card[]>(() => createDeck());
  const [hands, setHands] = useState<Hand[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);

  const dealHand = (): void => {
    if (deck.length < 5) {
      return;
    }

    const newDeck = [...deck];
    const hand: Card[] = [];

    for (let index = 0; index < 5; index += 1) {
      const card = newDeck.pop();
      if (!card) {
        return;
      }

      hand.push(card);
    }

    const score = hand.reduce((sum, card) => sum + card.value, 0);
    const nextWinner = !winner || score > winner.score ? { id: hand[0].id, score } : winner;

    setDeck(newDeck);
    setHands([...hands, { id: hand[0].id, cards: hand, score }]);
    setWinner(nextWinner);
  };

  const collectHands = (): void => {
    setDeck(createDeck());
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