import { Card } from "@pontistudios/ui";
import { motion } from "framer-motion";
import type { TarotCard } from "~/lib/tarot-types";

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
      className="perspective cursor-pointer"
    >
      {isRevealed && card ? (
        <Card className="flex h-56 w-40 flex-col items-center justify-center p-4">
          <img
            src={`/tarot-cards/${card.img}`}
            alt={card.name}
            className="mb-2 h-40 w-32 rounded object-cover"
          />
          <h3>{card.name}</h3>
          <p className="text-muted-foreground text-center text-xs">{card.arcana}</p>
          {position && <p className="mt-1 text-xs font-semibold">{position}</p>}
        </Card>
      ) : (
        <div className="flex h-56 w-40 items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="mb-2 text-4xl">🔮</div>
            <p className="text-xs font-semibold text-white">Click to Reveal</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
