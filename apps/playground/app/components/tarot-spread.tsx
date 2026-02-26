import { motion } from "framer-motion";
import type { TarotCard } from "~/lib/tarot-cards";
import { TAROT_SPREADS } from "~/lib/tarot-cards";
import { TarotCardDisplay } from "./tarot-card-display";

interface TarotSpreadProps {
	cards: TarotCard[];
	spreadType: keyof typeof TAROT_SPREADS;
	revealedCards: boolean[];
	onCardClick: (index: number) => void;
}

export const TarotSpread = ({
	cards,
	spreadType,
	revealedCards,
	onCardClick,
}: TarotSpreadProps) => {
	const spread = TAROT_SPREADS[spreadType];

	const spreadLayouts = {
		one_card: "flex justify-center items-center",
		three_card: "flex justify-center gap-8 items-center",
		celtic_cross: "grid grid-cols-4 gap-6 max-w-2xl mx-auto",
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					{spread.name}
				</h2>
				<p className="text-gray-600 dark:text-gray-400">{spread.description}</p>
			</div>

			<motion.div
				className={spreadLayouts[spreadType as keyof typeof spreadLayouts]}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{cards.map((card, index) => (
					<div key={index} className="flex flex-col items-center gap-2">
						<TarotCardDisplay
							card={card}
							isRevealed={revealedCards[index]}
							onClick={() => onCardClick(index)}
							index={index}
							position={spread.positions[index]}
						/>
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center w-32">
							{spread.positions[index]}
						</p>
					</div>
				))}
			</motion.div>
		</div>
	);
};
