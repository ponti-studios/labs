import { useCallback } from "react";

import type { PublicGamesPuzzle, WhatGuess } from "../lib/player-what";
import { shareWhatResult } from "../lib/player-what/share";

export type ShareOutcome = "copied" | "prompt" | "error";

export interface UseWhatShare {
  share: () => Promise<ShareOutcome>;
}

export function useWhatShare({
  guesses,
  isSolved,
  onResult,
}: {
  puzzle: PublicGamesPuzzle;
  guesses: readonly WhatGuess[];
  isSolved: boolean;
  onResult: (outcome: ShareOutcome) => void;
}): UseWhatShare {
  const share = useCallback(async (): Promise<ShareOutcome> => {
    try {
      const result = await shareWhatResult({
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
