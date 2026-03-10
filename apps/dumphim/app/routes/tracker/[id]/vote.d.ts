import type { Route } from "../../../+types/root";
export declare const loader: (loaderData: Route.LoaderArgs) => Promise<{
  tracker: {
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
  };
  votes: {
    value: "stay" | "dump";
    id: string;
    createdAt: Date;
    userId: string | null;
    trackerId: string;
    fingerprint: string;
    raterName: string;
    comment: string | null;
    updatedAt: Date;
  }[];
}>;
export declare const action: ({ request, params }: Route.ActionArgs) => Promise<
  | {
      error: string;
      success?: undefined;
      vote?: undefined;
    }
  | {
      success: boolean;
      vote: {
        value: "stay" | "dump";
        id: string;
        createdAt: Date;
        userId: string | null;
        trackerId: string;
        fingerprint: string;
        raterName: string;
        comment: string | null;
        updatedAt: Date;
      };
      error?: undefined;
    }
>;
export default function TrackerVoteRoute(): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=vote.d.ts.map
