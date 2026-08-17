import { useCallback } from "react";

import type { PublicGamesPuzzle, WhatGuess } from "~/lib/what";
import { shareWhatResult } from "~/lib/what/client/share";

export type ShareOutcome = "copied" | "prompt" | "error";

export interface UseWhatShare {
  share: () => Promise<ShareOutcome>;
}

/**
 * Wraps the share-text builder with a clipboard + prompt fallback. Returns
 * the outcome so the caller can show the right toast. Works from evaluated
 * `states`, never the answer.
 */
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
