export interface TarotCard {
	name: string;
	number: string;
	arcana: string;
	suit: string;
	img: string;
	fortune_telling: string[];
	keywords: string[];
	meanings: {
		light: string[];
		shadow: string[];
	};
	Archetype: string;
	"Hebrew Alphabet": string;
	Numerology: string;
	Elemental: string;
	"Mythical/Spiritual": string;
	"Questions to Ask": string[];
}

// Import the tarot data
const tarotData = require("../data/tarot-cards.json");

export const TAROT_CARDS: TarotCard[] = tarotData.cards;

export const getCardByName = (name: string): TarotCard | undefined => {
	return TAROT_CARDS.find(
		(card) => card.name.toLowerCase() === name.toLowerCase(),
	);
};

export const getRandomCard = (): TarotCard => {
	return TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
};

export const getRandomCards = (count: number): TarotCard[] => {
	const cards: TarotCard[] = [];
	const usedIndices = new Set<number>();

	while (cards.length < count) {
		const index = Math.floor(Math.random() * TAROT_CARDS.length);
		if (!usedIndices.has(index)) {
			usedIndices.add(index);
			cards.push(TAROT_CARDS[index]);
		}
	}

	return cards;
};

export const TAROT_SPREADS = {
	three_card: {
		name: "Three Card Spread",
		positions: ["Past", "Present", "Future"],
		description:
			"A classic spread to understand the past, present, and future of a situation.",
	},
	celtic_cross: {
		name: "Celtic Cross",
		positions: [
			"Present Situation",
			"Challenge",
			"Distant Past",
			"Recent Past",
			"Possible Outcome",
			"Near Future",
			"Your Attitude",
			"Outside Influences",
			"Hopes & Fears",
			"Final Outcome",
		],
		description: "A comprehensive spread exploring all aspects of a situation.",
	},
	one_card: {
		name: "One Card Draw",
		positions: ["Daily Guidance"],
		description: "A simple daily card for guidance and reflection.",
	},
};
