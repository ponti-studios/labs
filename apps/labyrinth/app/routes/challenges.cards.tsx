/**
 * Challenge: Luck of the Draw (unknown company)
 *
 * Player vs House card game. Both sides are dealt 5 cards from a shuffled
 * deck. The player sees their hand and decides to challenge or fold.
 * If they challenge, the house reveals its hand and the higher score wins.
 *
 * Deck: standard 52-card deck, Fisher-Yates shuffled.
 * Scoring: card.value = SUITS.indexOf(suit) + RANKS.indexOf(rank) + 2
 */

import { Button, Card, CardContent, CardHeader, CardTitle, cn } from "@pontistudios/ui";
import { useState } from "react";

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["♥", "♦", "♣", "♠"] as const;

type SuitSymbol = (typeof SUITS)[number];

export class PlayingCard {
  id: string;
  suit: SuitSymbol;
  rank: string;
  value: number;

  constructor(suit: SuitSymbol, rank: string) {
    this.id = `${suit} ${rank}`;
    this.suit = suit;
    this.rank = rank;
    this.value = SUITS.indexOf(suit) + RANKS.indexOf(rank) + 2;
  }
}

export class Deck {
  cards: PlayingCard[];

  constructor() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push(new PlayingCard(suit, rank));
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
    return this.cards.pop()!;
  }
}

function handScore(cards: PlayingCard[]): number {
  return cards.reduce((sum, card) => sum + card.value, 0);
}

type Phase = "idle" | "dealt" | "revealed";
type Outcome = "player" | "house" | "tie";

function CardFace({
  card,
  isWinner,
  index,
  animation = "fade-slide-in",
}: {
  card: PlayingCard;
  isWinner: boolean;
  index: number;
  animation?: string;
}) {
  return (
    <div
      className={cn(
        "w-15 border border-border p-1 rounded-md bg-background flex flex-col items-center justify-center",
        {
          "border-green-500": isWinner,
          "text-red-500": card.suit === "♥" || card.suit === "♦",
        },
      )}
      style={{ animation: `${animation} 300ms ease-out both`, animationDelay: `${index * 80}ms` }}
    >
      <span className="font-semibold">{card.rank}</span>
      <span>{card.suit}</span>
    </div>
  );
}

function CardBack({ index }: { index: number }) {
  return (
    <div
      className="w-15 border border-border p-1 rounded-md bg-slate-700 flex flex-col items-center justify-center select-none"
      style={{ animation: "fade-slide-in 300ms ease-out both", animationDelay: `${index * 80}ms` }}
    >
      <span className="text-slate-400 text-xl">?</span>
    </div>
  );
}

export default function Cards() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [houseHand, setHouseHand] = useState<PlayingCard[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const deal = () => {
    const deck = new Deck();
    const player = Array.from({ length: 5 }, () => deck.deal());
    const house = Array.from({ length: 5 }, () => deck.deal());
    setPlayerHand(player);
    setHouseHand(house);
    setOutcome(null);
    setPhase("dealt");
  };

  const challenge = () => {
    const ps = handScore(playerHand);
    const hs = handScore(houseHand);
    setOutcome(ps > hs ? "player" : ps < hs ? "house" : "tie");
    setPhase("revealed");
  };

  const fold = () => {
    setOutcome("house");
    setPhase("revealed");
  };

  const playerScore = handScore(playerHand);
  const houseScore = handScore(houseHand);
  const playerWins = outcome === "player";
  const houseWins = outcome === "house";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">Luck of the Draw</h2>
        <p className="text-muted-foreground">Beat the house. Challenge or fold.</p>
      </header>

      {phase === "idle" && (
        <Button className="self-start" onClick={deal}>
          Deal
        </Button>
      )}

      {phase !== "idle" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={cn({
                "border-green-300 bg-green-50": playerWins,
                "border-red-300 bg-red-50": houseWins && phase === "revealed",
              })}
            >
              <CardHeader>
                <CardTitle className="text-sm flex justify-between">
                  <span>Your Hand</span>
                  <span>Score: {playerScore}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2 justify-center">
                {playerHand.map((card, i) => (
                  <CardFace key={card.id} card={card} isWinner={playerWins} index={i} />
                ))}
              </CardContent>
            </Card>

            <Card
              className={cn({
                "border-green-300 bg-green-50": houseWins,
                "border-red-300 bg-red-50": playerWins && phase === "revealed",
              })}
            >
              <CardHeader>
                <CardTitle className="text-sm flex justify-between">
                  <span>House</span>
                  {phase === "revealed" && <span>Score: {houseScore}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2 justify-center">
                {phase === "dealt"
                  ? Array.from({ length: 5 }, (_, i) => <CardBack key={i} index={i} />)
                  : houseHand.map((card, i) => (
                      <CardFace
                        key={card.id}
                        card={card}
                        isWinner={houseWins}
                        index={i}
                        animation="card-flip"
                      />
                    ))}
              </CardContent>
            </Card>
          </div>

          {phase === "dealt" && (
            <div className="flex gap-4 justify-end">
              <Button onClick={challenge}>Challenge</Button>
              <Button variant="outline" onClick={fold}>
                Fold
              </Button>
            </div>
          )}

          {phase === "revealed" && (
            <div className="flex gap-4 justify-end items-center">
              {outcome && (
                <p
                  className={cn("text-lg font-semibold", {
                    "text-green-600": outcome === "player",
                    "text-red-600": outcome === "house",
                    "text-muted-foreground": outcome === "tie",
                  })}
                >
                  {outcome === "player"
                    ? "You win!"
                    : outcome === "house"
                      ? "House wins."
                      : "It's a tie."}
                </p>
              )}
              <Button className="self-start" onClick={deal}>
                Play Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
