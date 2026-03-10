/**
 * Profile Page Route
 *
 * IMPROVEMENTS:
 * - Uses auth utilities (~60% less code)
 * - Cleaner, more maintainable
 */
import type { Route } from "./+types/profile";
export declare function loader({ request }: Route.LoaderArgs): Promise<{
  trackers: {
    id: string;
    name: string;
    createdAt: Date;
    hp: string | null;
    cardType: string | null;
    description: string | null;
    attacks:
      | {
          name: string;
          damage: number;
        }[]
      | null;
    strengths: string[] | null;
    flaws: string[] | null;
    commitmentLevel: string | null;
    colorTheme: string | null;
    photoUrl: string | null;
    imageScale: number | null;
    imagePosition: {
      x: number;
      y: number;
    } | null;
    userId: string;
    updatedAt: Date;
  }[];
}>;
export declare function ProfilePage(): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=profile.d.ts.map
