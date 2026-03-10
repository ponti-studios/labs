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
  imagePosition: {
    x: number;
    y: number;
  };
}
export declare function PersonCardDisplay({
  cardData,
  selectedTheme,
  selectedType,
  image,
  imageScale,
  imagePosition,
}: PersonCardDisplayProps): import("react/jsx-runtime").JSX.Element;
export default PersonCardDisplay;
//# sourceMappingURL=person-card-display.d.ts.map
