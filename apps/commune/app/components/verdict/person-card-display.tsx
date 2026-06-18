"use client";

import type { RelationshipCaseParsed } from "@pontistudios/db";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import type { CardTheme } from "./card-theme-picker";

type CardDisplayData = Pick<
  RelationshipCaseParsed,
  "name" | "hp" | "cardType" | "description" | "attacks" | "strengths" | "flaws" | "commitmentLevel"
>;

interface PersonalityType {
  value: string;
  label: string;
  color: string;
}

interface PersonCardDisplayProps {
  cardData: CardDisplayData;
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
        "w-87.5 min-h-125 rounded-xl overflow-hidden border-8",
        selectedTheme.border,
        "shadow-xl relative",
      )}
      whileHover={{
        scale: 1.03,
        rotateY: 4,
        transition: { duration: 0.3 },
      }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Card content */}
      <div className="relative z-10 p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-2xl">{cardData.name}</h3>
          <div className="flex items-center">
            <span className="text-sm mr-1">HP</span>
            <span className="font-bold text-red-600 text-lg">{cardData.hp ?? ""}</span>
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
          {cardData.attacks.map((attack, index: number) => (
            <div
              key={`attack-${index}`}
              className={`flex justify-between items-center ${
                index < cardData.attacks.length - 1 ? "border-b border-gray-400/50 pb-1" : ""
              }`}
            >
              <span>{attack.name}</span>
              <span className="font-bold">{attack.damage}</span>
            </div>
          ))}
        </div>

        {/* Flaws & Strengths */}
        <div className="flex flex-col gap-2 text-sm leading-relaxed mb-2.5">
          <div className="flex items-center">
            <span className="font-semibold mr-1">Flaws:</span>
            <span>{cardData.flaws.join(", ")}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-1">Strengths:</span>
            <span>{cardData.strengths.join(", ")}</span>
          </div>
        </div>

        {/* Commitment Level & Card Number (Placeholder) */}
        <div className="flex justify-between items-center text-xs leading-relaxed">
          <div className="flex items-center">
            <span className="font-semibold mr-1">Commitment Level:</span>
            <span>{"★".repeat(Number(cardData.commitmentLevel ?? 0) || 0)}</span>
          </div>
          <span className="text-gray-500">001/100</span>
        </div>
      </div>
    </motion.div>
  );
}

export default PersonCardDisplay;
