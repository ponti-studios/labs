import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import type { CardTheme } from "./card-theme-picker";

interface PersonalityType {
  value: string;
  label: string;
  color: string;
}

interface PersonCardCompactProps {
  name: string;
  hp: string | null;
  photoUrl: string | null;
  imageScale?: number;
  imagePosition?: { x: number; y: number };
  selectedTheme: CardTheme;
  selectedType: PersonalityType;
  vibes: number;
  icks: number;
}

export function PersonCardCompact({
  name,
  hp,
  photoUrl,
  imageScale = 1,
  imagePosition = { x: 0, y: 0 },
  selectedTheme,
  selectedType,
  vibes,
  icks,
}: PersonCardCompactProps) {
  const hasVotes = vibes > 0 || icks > 0;

  return (
    <div className="flex flex-col gap-2">
      <motion.div
        className={cn("rounded-xl overflow-hidden border-[6px]", selectedTheme.border, "bg-card")}
        whileHover={{ scale: 1.03, rotateY: 4, transition: { duration: 0.25 } }}
      >
        <div className="flex justify-between items-center px-2.5 py-2">
          <span className="text-xs font-bold truncate max-w-[80px] text-foreground">{name}</span>
          <span className="text-[10px] font-bold text-red-600 shrink-0">HP {hp ?? "—"}</span>
        </div>

        <div className="relative overflow-hidden" style={{ height: 120 }}>
          {photoUrl ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${photoUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: `scale(${imageScale}) translate(${imagePosition.x / imageScale}px, ${imagePosition.y / imageScale}px)`,
                transformOrigin: "center center",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div
            className={cn(
              "absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-white",
              selectedType.color,
            )}
          >
            <span className="text-[8px] font-semibold leading-none">{selectedType.label}</span>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-1.5 flex-wrap px-0.5">
        {!hasVotes ? (
          <span className="text-[10px] text-muted-foreground">No takes yet</span>
        ) : (
          <>
            {vibes > 0 && (
              <span className="text-[10px] bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 rounded-full px-2 py-0.5">
                {vibes} {vibes === 1 ? "vibe" : "vibes"}
              </span>
            )}
            {icks > 0 && (
              <span className="text-[10px] bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                {icks} {icks === 1 ? "ick" : "icks"}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
