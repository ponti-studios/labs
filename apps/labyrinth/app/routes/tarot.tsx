import { Button, Card } from "@pontistudios/ui";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { TarotCardDetails } from "~/components/tarot-card-details";
import { TarotSpread } from "~/components/tarot-spread";
import { TAROT_SPREADS, type TarotSpreadType } from "~/lib/tarot-spreads";
import type { TarotCard } from "~/lib/tarot-types";

type TarotReadingResponse = {
  cards: TarotCard[];
  spreadType: TarotSpreadType;
};

export default function TarotRoute() {
  const [spreadType, setSpreadType] = useState<TarotSpreadType>("three_card");
  const [readingSeed, setReadingSeed] = useState(0);

  const tarotQuery = useQuery<TarotReadingResponse, Error>({
    queryKey: ["tarot", spreadType, readingSeed],
    queryFn: async () => {
      const response = await fetch(`/api/tarot?spreadType=${spreadType}`);

      if (!response.ok) {
        throw new Error(`Failed to load tarot cards (${response.status})`);
      }

      return (await response.json()) as TarotReadingResponse;
    },
    staleTime: 0,
  });

  const handleNewReading = () => {
    setReadingSeed((current) => current + 1);
  };

  const cards = tarotQuery.data?.cards ?? [];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-8 px-4 shadow-lg"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🔮</span>
            <h1 className="text-4xl font-bold">Tarot Spread Reader</h1>
          </div>
          <p className="text-purple-100 text-lg">Draw cards, explore meanings, and seek guidance</p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Choose a Spread</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(TAROT_SPREADS) as TarotSpreadType[]).map((key) => (
                <Button
                  key={key}
                  onClick={() => setSpreadType(key)}
                  variant={spreadType === key ? "default" : "outline"}
                  className={spreadType === key ? "scale-105" : ""}
                >
                  {TAROT_SPREADS[key].name}
                </Button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Main Spread */}
        <motion.div
          key={spreadType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 mb-8">
            {tarotQuery.isPending ? (
              <div className="py-16 text-center text-gray-600 dark:text-gray-400">
                Drawing your cards...
              </div>
            ) : tarotQuery.isError ? (
              <div className="py-16 text-center text-red-600 dark:text-red-400">
                {tarotQuery.error.message}
              </div>
            ) : cards.length > 0 ? (
              <TarotReadingPanel
                key={`${spreadType}-${readingSeed}`}
                cards={cards}
                spreadType={spreadType}
                onNewReading={handleNewReading}
              />
            ) : null}
          </Card>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">
              💡 How to Use
            </h3>
            <ul className="space-y-2 text-amber-800 dark:text-amber-50">
              <li>• Select a spread type above to begin your reading</li>
              <li>• Click on face-down cards to reveal them</li>
              <li>• Click on revealed cards to view detailed meanings</li>
              <li>• Each card has light and shadow interpretations</li>
              <li>• Use the fortune-telling and questions to guide your reflection</li>
              <li>• Draw a new reading whenever you're ready</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function TarotReadingPanel({
  cards,
  spreadType,
  onNewReading,
}: {
  cards: TarotCard[];
  spreadType: TarotSpreadType;
  onNewReading: () => void;
}) {
  const [revealedCards, setRevealedCards] = useState<boolean[]>(() =>
    Array.from({ length: cards.length }, () => false),
  );
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

  const handleCardClick = (index: number) => {
    const newRevealed = [...revealedCards];
    newRevealed[index] = !newRevealed[index];
    setRevealedCards(newRevealed);

    if (cards[index]) {
      setSelectedCard(cards[index]);
    }
  };

  const allRevealed = revealedCards.every((revealed) => revealed);

  return (
    <>
      <TarotSpread
        cards={cards}
        spreadType={spreadType}
        revealedCards={revealedCards}
        onCardClick={handleCardClick}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4 justify-center mb-8"
      >
        <Button onClick={onNewReading} size="lg">
          ✨ New Reading
        </Button>
        {allRevealed && (
          <Button
            onClick={() => setRevealedCards(Array.from({ length: cards.length }, () => false))}
            size="lg"
            variant="outline"
          >
            🔄 Reset Cards
          </Button>
        )}
      </motion.div>

      <TarotCardDetails card={selectedCard} onClose={() => setSelectedCard(null)} />
    </>
  );
}
