import { useCallback } from "react";

import type { PublicGamesPuzzle, GameGuess } from "../lib/player-game";
import { shareGameResult } from "../lib/player-game/share";

export type ShareOutcome = "copied" | "prompt" | "error";

export interface UseShare {
  share: () => Promise<ShareOutcome>;
}

export function useShare({
  guesses,
  isSolved,
  onResult,
}: {
  puzzle: PublicGamesPuzzle;
  guesses: readonly GameGuess[];
  isSolved: boolean;
  onResult: (outcome: ShareOutcome) => void;
}): UseShare {
  const share = useCallback(async (): Promise<ShareOutcome> => {
    try {
      const result = await shareGameResult({
        guesses,
        isSolved,
        copyToClipboard: async (text) => {
          if (!navigator.clipboard?.writeText) {
            throw new Error("Clipboard unavailable");
          }
          await navigator.clipboard.writeText(text);
        },
        promptCopy: (message, text) => {
          window.prompt(message, text);
        },
      });

      const outcome: ShareOutcome = result.method === "clipboard" ? "copied" : "prompt";
      onResult(outcome);
      return outcome;
    } catch {
      onResult("error");
      return "error";
    }
  }, [guesses, isSolved, onResult]);

  return { share };
}
