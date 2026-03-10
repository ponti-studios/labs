import type React from "react";
import type { Tracker, Vote } from "@pontistudios/db/schema";
interface VoteScreenProps {
  tracker: Tracker;
  votes: Vote[];
  onBack: () => void;
  onVoteCasted: (trackerId: string, updatedVotes: Vote[]) => void;
  fetcher: any;
}
declare const VoteScreen: React.FC<VoteScreenProps>;
export default VoteScreen;
//# sourceMappingURL=VoteScreen.d.ts.map
