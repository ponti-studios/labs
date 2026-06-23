import { useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";

import {
  deriveGameStatus,
  isGuessSolved,
  MAX_GUESSES,
  normalizeGuess,
  type GameStatus,
  type PublicDailyPuzzle,
  type RealiteaGuess,
  type RealiteaGuessResult,
} from "~/lib/realitea";

import { useAnimation } from "./use-animation";
import { useTyping } from "./use-typing";

export interface RealiTeaGameState {
  guesses: readonly RealiteaGuess[];
  status: GameStatus;
  isSolved: boolean;
  isGameOver: boolean;
  isRevealingRow: boolean;
  isValidationPending: boolean;
  currentGuess: string;
  errorMessage: string | null;
  isShaking: boolean;
  hasError: boolean;
  revealedTileCount: number;
  revealingGuessIndex: number | null;
  cellRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  addLetter: (value: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  redirectToActiveCell: () => void;
  clearError: () => void;
}

interface UseRealiTeaGameOptions {
  puzzle: PublicDailyPuzzle;
  initialGuesses: readonly RealiteaGuess[];
  initialStatus: GameStatus;
}

export function useRealiTeaGame({
  puzzle,
  initialGuesses,
  initialStatus,
}: UseRealiTeaGameOptions): RealiTeaGameState {
  const [guesses, setGuesses] = useState<RealiteaGuess[]>(() => [...initialGuesses]);
  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);
  const wordValidator = useFetcher<RealiteaGuessResult>();

  const anim = useAnimation(puzzle.answerLength);
  const isRevealingRow = anim.revealingGuessIndex !== null;
  const isValidationPending = wordValidator.state !== "idle";
  const isGameOver = initialStatus === "solved" || initialStatus === "failed";
  const canMutateGuess = !isGameOver && !isValidationPending && !isRevealingRow;

  const typing = useTyping(puzzle.answerLength, !canMutateGuess);

  // Reset everything when the active puzzle changes
  useEffect(() => {
    setGuesses([...initialGuesses]);
    typing.setCurrentGuess("");
    anim.setRevealingGuessIndex(null);
    anim.setRevealedTileCount(0);
    anim.clearError();
  }, [puzzle.dateKey, initialGuesses]);

  const status: GameStatus = useMemo(() => {
    if (guesses.some(isGuessSolved)) return "solved";
    if (guesses.length >= MAX_GUESSES) return "failed";
    return "playing";
  }, [guesses]);

  const submitGuess = () => {
    if (!canMutateGuess) return;
    const guess = normalizeGuess(typing.currentGuess);

    if (guess.length !== puzzle.answerLength) {
      anim.showToast("Not enough letters", true);
      return;
    }

    if (guesses.some((existing) => existing.word === guess)) {
      anim.showToast("Already guessed", true);
      return;
    }

    wordValidator.submit(
      {
        dateKey: puzzle.dateKey,
        previousGuesses: guesses.map((g) => ({ word: g.word })),
        word: guess,
      },
      {
        method: "POST",
        action: "/api/games/realitea/guess",
        encType: "application/json",
      },
    );
  };

  useEffect(() => {
    if (wordValidator.state !== "idle" || !wordValidator.data) return;
    const result = wordValidator.data;

    if (!result.valid) {
      if (result.reason === "not-in-word-list") anim.showToast("Not in word list", true);
      else if (result.reason === "wrong-length") anim.showToast("Not enough letters", true);
      else if (result.reason === "already-guessed") anim.showToast("Already guessed", true);
      return;
    }

    if (result.word && result.states) {
      setGuesses((prev) => {
        if (prev.at(-1)?.word === result.word) return prev;
        return [...prev, { word: result.word!, states: result.states! }];
      });
      typing.setCurrentGuess("");
      anim.setRevealingGuessIndex(guesses.length);
      anim.setRevealedTileCount(0);
    }
  }, [wordValidator.data, wordValidator.state, guesses.length]);

  const redirectToActiveCell = useCallback(() => {
    if (isGameOver || isRevealingRow) return;
    const idx = Math.min(typing.currentGuess.length, puzzle.answerLength - 1);
    cellRefs.current[idx]?.focus();
  }, [typing.currentGuess.length, isGameOver, isRevealingRow, puzzle.answerLength]);

  return {
    guesses,
    status,
    isSolved: status === "solved",
    isGameOver,
    isRevealingRow,
    isValidationPending,
    currentGuess: typing.currentGuess,
    errorMessage: anim.errorMessage,
    isShaking: anim.isShaking,
    hasError: anim.hasError,
    revealedTileCount: anim.revealedTileCount,
    revealingGuessIndex: anim.revealingGuessIndex,
    cellRefs,
    addLetter: typing.addLetter,
    removeLetter: typing.removeLetter,
    submitGuess,
    redirectToActiveCell,
    clearError: anim.clearError,
  };
}

export { deriveGameStatus };
