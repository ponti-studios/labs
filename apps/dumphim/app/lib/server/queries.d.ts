/**
 * Server-side queries for dumphim
 * Replaces Supabase client queries
 */
export declare function getTrackers(): Promise<
  {
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
  }[]
>;
export declare function getTracker(id: string): Promise<
  | {
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
    }
  | undefined
>;
export declare function getTrackersByUser(userId: string): Promise<
  {
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
  }[]
>;
export declare function getVotesByTracker(trackerId: string): Promise<
  {
    value: "stay" | "dump";
    id: string;
    createdAt: Date;
    userId: string | null;
    trackerId: string;
    fingerprint: string;
    raterName: string;
    comment: string | null;
    updatedAt: Date;
  }[]
>;
export declare function getVoteStats(trackerId: string): Promise<{
  total: number;
  stay: number;
  dump: number;
  stayPercentage: number;
}>;
//# sourceMappingURL=queries.d.ts.map
