import { Badge, Dialog, DialogContent, DialogHeader, DialogTitle } from "@pontistudios/ui";
import type { TarotCard } from "~/lib/tarot-cards";

interface TarotCardDetailsProps {
  card: TarotCard | null;
  onClose: () => void;
}

export const TarotCardDetails = ({ card, onClose }: TarotCardDetailsProps) => {
  return (
    <Dialog open={!!card} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {card && (
          <>
            <DialogHeader>
              <div className="space-y-2">
                <DialogTitle className="text-3xl">{card.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{card.arcana}</p>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Card Image */}
              <div className="flex justify-center">
                <img
                  src={`/tarot-cards/${card.img}`}
                  alt={card.name}
                  className="w-48 h-64 object-cover rounded-lg shadow-md"
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Number</h3>
                  <p className="text-gray-600 dark:text-gray-400">{card.number}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Suit</h3>
                  <p className="text-gray-600 dark:text-gray-400">{card.suit}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Archetype</h3>
                  <p className="text-gray-600 dark:text-gray-400">{card.Archetype}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Numerology</h3>
                  <p className="text-gray-600 dark:text-gray-400">{card.Numerology}</p>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {card.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Light & Shadow Meanings */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                    ✨ Light Meanings
                  </h3>
                  <ul className="space-y-1">
                    {card.meanings.light.map((meaning) => (
                      <li
                        key={meaning}
                        className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                      >
                        <span className="text-green-600">•</span>
                        {meaning}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                    🌑 Shadow Meanings
                  </h3>
                  <ul className="space-y-1">
                    {card.meanings.shadow.map((meaning) => (
                      <li
                        key={meaning}
                        className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                      >
                        <span className="text-red-600">•</span>
                        {meaning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Fortune Telling */}
              {card.fortune_telling && card.fortune_telling.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🔮 Fortune Telling
                  </h3>
                  <ul className="space-y-1">
                    {card.fortune_telling.map((fortune) => (
                      <li
                        key={fortune}
                        className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                      >
                        <span>✦</span>
                        {fortune}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Questions to Ask */}
              {card["Questions to Ask"] && card["Questions to Ask"].length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ❓ Questions to Ask
                  </h3>
                  <ul className="space-y-2">
                    {card["Questions to Ask"].map((question) => (
                      <li
                        key={question}
                        className="text-sm text-gray-600 dark:text-gray-400 italic"
                      >
                        "{question}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mystical Info */}
              {card["Mythical/Spiritual"] && (
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🌟 Mythical/Spiritual
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card["Mythical/Spiritual"]}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
