import { Card } from "@pontistudios/ui";
import { motion } from "framer-motion";
import type { TarotCard } from "~/lib/tarot-cards";

interface TarotCardDisplayProps {
  card: TarotCard;
  isRevealed?: boolean;
  onClick?: () => void;
  index?: number;
  position?: string;
}

export const TarotCardDisplay = ({
  card,
  isRevealed = false,
  onClick,
  index = 0,
  position,
}: TarotCardDisplayProps) => {
  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: isRevealed ? 0 : 180, opacity: 1 }}
      transition={{ duration: 0.6, delay: index ? index * 0.1 : 0 }}
      onClick={onClick}
      className="cursor-pointer perspective"
    >
      {isRevealed && card ? (
        <Card className="w-40 h-56 flex flex-col items-center justify-center p-4">
          <img
            src={`/tarot-cards/${card.img}`}
            alt={card.name}
            className="w-32 h-40 object-cover rounded mb-2"
          />
          <h3 className="text-sm font-bold text-center">{card.name}</h3>
          <p className="text-xs text-muted-foreground text-center">{card.arcana}</p>
          {position && <p className="text-xs font-semibold mt-1">{position}</p>}
        </Card>
      ) : (
        <div className="w-40 h-56 rounded-lg flex items-center justify-center bg-gradient-to-b from-purple-900 to-indigo-900">
          <div className="text-center">
            <div className="text-4xl mb-2">🔮</div>
            <p className="text-white text-xs font-semibold">Click to Reveal</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
