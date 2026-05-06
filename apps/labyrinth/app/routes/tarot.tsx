import { Button, Card } from "@pontistudios/ui";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TarotCardDetails } from "~/components/tarot-card-details";
import { TarotSpread } from "~/components/tarot-spread";
import { getRandomCards, TAROT_SPREADS, type TarotCard } from "~/lib/tarot-cards";

type SpreadType = keyof typeof TAROT_SPREADS;

export default function TarotRoute() {
  const [spreadType, setSpreadType] = useState<SpreadType>("three_card");
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

  // Initialize with cards
  useEffect(() => {
    const positions = TAROT_SPREADS[spreadType].positions.length;
    const newCards = getRandomCards(positions);
    setCards(newCards);
    setRevealedCards(Array.from({ length: positions }, () => false));
  }, [spreadType]);

  const handleCardClick = (index: number) => {
    const newRevealed = [...revealedCards];
    newRevealed[index] = !newRevealed[index];
    setRevealedCards(newRevealed);
  };

  const handleNewReading = () => {
    const positions = TAROT_SPREADS[spreadType].positions.length;
    const newCards = getRandomCards(positions);
    setCards(newCards);
    setRevealedCards(Array.from({ length: positions }, () => false));
  };

  const handleViewDetails = (card: TarotCard) => {
    setSelectedCard(card);
  };

  const allRevealed = revealedCards.every((revealed) => revealed);

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
              {(Object.keys(TAROT_SPREADS) as SpreadType[]).map((key) => (
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
            {cards.length > 0 && (
              <TarotSpread
                cards={cards}
                spreadType={spreadType}
                revealedCards={revealedCards}
                onCardClick={(index) => {
                  handleCardClick(index);
                  if (cards[index]) {
                    handleViewDetails(cards[index]);
                  }
                }}
              />
            )}
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 justify-center mb-8"
        >
          <Button onClick={handleNewReading} size="lg">
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

      {/* Card Details Modal */}
      <TarotCardDetails card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
