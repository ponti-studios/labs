import { Badge, Dialog, DialogContent, DialogHeader, DialogTitle } from "@pontistudios/ui";
import type { TarotCard } from "~/lib/tarot-types";

interface TarotCardDetailsProps {
  card: TarotCard | null;
  onClose: () => void;
}

export const TarotCardDetails = ({ card, onClose }: TarotCardDetailsProps) => {
  return (
    <Dialog open={!!card} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {card && (
          <>
            <DialogHeader>
              <div className="space-y-2">
                <DialogTitle className="text-3xl">{card.name}</DialogTitle>
                <p className="text-muted-foreground text-sm">{card.arcana}</p>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Card Image */}
              <div className="flex justify-center">
                <img
                  src={`/tarot-cards/${card.img}`}
                  alt={card.name}
                  className="h-64 w-48 rounded-lg object-cover shadow-md"
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3>Number</h3>
                  <p className="text-gray-600 dark:text-gray-400">{card.number}</p>
                </div>
                <div>
                  <h3>Suit</h3>
                  <p className="text-gray-600 dark:text-gray-400">{card.suit}</p>
                </div>
                {card.Archetype && (
                  <div>
                    <h3>Archetype</h3>
                    <p className="text-gray-600 dark:text-gray-400">{card.Archetype}</p>
                  </div>
                )}
                {card.Numerology && (
                  <div>
                    <h3>Numerology</h3>
                    <p className="text-gray-600 dark:text-gray-400">{card.Numerology}</p>
                  </div>
                )}
              </div>

              {/* Keywords */}
              <div>
                <h3 className="mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {card.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Light & Shadow Meanings */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2">✨ Light Meanings</h3>
                  <ul className="space-y-1">
                    {card.meanings.light.map((meaning) => (
                      <li
                        key={meaning}
                        className="flex gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span className="text-green-600">•</span>
                        {meaning}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2">🌑 Shadow Meanings</h3>
                  <ul className="space-y-1">
                    {card.meanings.shadow.map((meaning) => (
                      <li
                        key={meaning}
                        className="flex gap-2 text-sm text-gray-600 dark:text-gray-400"
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
                  <h3 className="mb-2">🔮 Fortune Telling</h3>
                  <ul className="space-y-1">
                    {card.fortune_telling.map((fortune) => (
                      <li
                        key={fortune}
                        className="flex gap-2 text-sm text-gray-600 dark:text-gray-400"
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
                  <h3 className="mb-2">❓ Questions to Ask</h3>
                  <ul className="space-y-2">
                    {card["Questions to Ask"].map((question) => (
                      <li
                        key={question}
                        className="text-sm text-gray-600 italic dark:text-gray-400"
                      >
                        "{question}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mystical Info */}
              {card["Mythical/Spiritual"] && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/30">
                  <h3 className="mb-2">🌟 Mythical/Spiritual</h3>
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
