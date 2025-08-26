"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import type { trackers } from "../../db/schema";
import type { CardTheme } from "./card-theme-picker";

type CardData = typeof trackers.$inferInsert;

interface PersonalityType {
	value: string;
	label: string;
	color: string;
}

interface PersonCardDisplayProps {
	cardData: Omit<CardData, "userId">;
	selectedTheme: CardTheme;
	selectedType: PersonalityType;
	image: string | null;
	imageScale: number;
	imagePosition: { x: number; y: number };
}

export function PersonCardDisplay({
	cardData,
	selectedTheme,
	selectedType,
	image,
	imageScale,
	imagePosition,
}: PersonCardDisplayProps) {
	return (
		<motion.div
			data-testid="person-card"
			className={cn(
				"w-[350px] min-h-[500px] rounded-xl overflow-hidden border-8",
				selectedTheme.border,
				"shadow-xl relative",
			)}
			whileHover={{
				scale: 1.05,
				rotateY: [0, 5, 0, -5, 0],
				transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY },
			}}
			initial={{ y: 20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			{/* Card background */}
			<div
				className={cn("absolute inset-0 bg-gradient-to-b", selectedTheme.bg)}
			/>

			{/* Sparkle effects */}
			<motion.div
				className="absolute inset-0 pointer-events-none"
				animate={{
					background: [
						"radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 20%)",
						"radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 20%)",
						"radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 20%)",
						"radial-gradient(circle at 20% 70%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 20%)",
						"radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 20%)",
					],
				}}
				transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
			/>

			{/* Card content */}
			<div className="relative z-10 p-4 flex flex-col h-full">
				{/* Header */}
				<div className="flex justify-between items-center mb-2">
					<h3 className="font-bold text-2xl">{cardData.name}</h3>
					<div className="flex items-center">
						<span className="text-sm mr-1">HP</span>
						<span className="font-bold text-red-600 text-lg">
							{cardData.hp ?? ""}
						</span>
					</div>
				</div>

				{/* Type indicator */}
				<div
					className={cn(
						"self-end px-3 py-1 rounded text-white text-sm -mt-1 mb-1",
						selectedType.color,
					)}
				>
					{selectedType.label}
				</div>

				{/* Image */}
				<div className="w-full h-[240px] bg-gray-200 rounded overflow-hidden mb-3 border-2 border-gray-300">
					{image ? (
						<div
							style={{
								width: "100%",
								height: "100%",
								backgroundImage: `url(${image})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
								transform: `scale(${imageScale}) translate(${imagePosition.x / imageScale}px, ${imagePosition.y / imageScale}px)`,
								transformOrigin: "center center",
							}}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-gray-100">
							<Sparkles className="w-16 h-16 text-gray-400" />
						</div>
					)}
				</div>

				{/* Description */}
				<div className="text-sm leading-snug p-2.5 bg-white/70 rounded border border-gray-300/50 mb-2.5 flex-grow min-h-[70px]">
					<p className="italic">{cardData.description ?? ""}</p>
				</div>

				{/* Attacks */}
				<div className="space-y-2 text-sm leading-snug mb-2">
					{(cardData.attacks ?? []).map(
						(attack: { name: string; damage: number }, index: number) => (
							<div
								key={attack.name}
								className={`flex justify-between items-center ${
									index < (cardData.attacks?.length ?? 0) - 1
										? "border-b border-gray-400/50 pb-1"
										: ""
								}`}
							>
								<span>{attack.name}</span>
								<span className="font-bold">{attack.damage}</span>
							</div>
						),
					)}
				</div>

				{/* Flaws & Strengths */}
				<div className="flex flex-col gap-2 text-sm leading-relaxed mb-2.5">
					<div className="flex items-center">
						<span className="font-semibold mr-1">Flaws:</span>
						<span>{(cardData.flaws ?? []).join(", ")}</span>
					</div>
					<div className="flex items-center">
						<span className="font-semibold mr-1">Strengths:</span>
						<span>{(cardData.strengths ?? []).join(", ")}</span>
					</div>
				</div>

				{/* Commitment Level & Card Number (Placeholder) */}
				<div className="flex justify-between items-center text-xs leading-relaxed">
					<div className="flex items-center">
						<span className="font-semibold mr-1">Commitment Level:</span>
						<span>
							{"★".repeat(Number(cardData.commitmentLevel ?? 0) || 0)}
						</span>
					</div>
					<span className="text-gray-500">001/100</span>
				</div>
			</div>
		</motion.div>
	);
}

export default PersonCardDisplay;
