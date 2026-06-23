import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";

import {
  deriveGameStatus,
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
  /** Focus the cell the user should type into next. Only safe to call when
   *  the game is not over and not revealing a row — guards are internal. */
  redirectToActiveCell: () => void;
  clearError: () => void;
}

interface UseRealiTeaGameOptions {
  puzzle: PublicDailyPuzzle;
  initialGuesses: readonly RealiteaGuess[];
}

export function useRealiTeaGame({
  puzzle,
  initialGuesses,
}: UseRealiTeaGameOptions): RealiTeaGameState {
  const [guesses, setGuesses] = useState<RealiteaGuess[]>(() => [...initialGuesses]);
  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);
  const wordValidator = useFetcher<RealiteaGuessResult>();

  const anim = useAnimation(puzzle.answerLength);
  const isRevealingRow = anim.revealingGuessIndex !== null;
  const isValidationPending = wordValidator.state !== "idle";
  const status = useMemo(() => deriveGameStatus(guesses), [guesses]);
  const isGameOver = status !== "playing";
  const canMutateGuess = !isGameOver && !isValidationPending && !isRevealingRow;

  const typing = useTyping(puzzle.answerLength, !canMutateGuess);

  // Reset everything when the active puzzle changes (midnight rollover).
  // The ref guard prevents the effect from firing on the initial mount,
  // which would otherwise overwrite the localStorage-restored guesses.
  const prevDateKeyRef = useRef(puzzle.dateKey);
  useEffect(() => {
    if (puzzle.dateKey === prevDateKeyRef.current) return;
    prevDateKeyRef.current = puzzle.dateKey;
    setGuesses([]);
    typing.setCurrentGuess("");
    anim.resetAnimation();
  }, [puzzle.dateKey]);

  // Track the previous fetcher state so we can detect network failures
  // (state transition "submitting" → "idle" without data).
  const prevFetcherStateRef = useRef(wordValidator.state);
  useEffect(() => {
    prevFetcherStateRef.current = wordValidator.state;
  }, [wordValidator.state]);

  const submitGuess = () => {
    if (!canMutateGuess) return;
    const guess = normalizeGuess(typing.currentGuess);

    if (guess.length !== puzzle.answerLength) {
      anim.animateError("Not enough letters", true);
      return;
    }

    if (guesses.some((existing) => existing.word === guess)) {
      anim.animateError("Already guessed", true);
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
    if (wordValidator.state !== "idle") return;

    // Network / server failure — fetcher went idle without producing data
    if (!wordValidator.data) {
      if (prevFetcherStateRef.current === "submitting") {
        anim.animateError("Network error — try again", false);
      }
      return;
    }

    const result = wordValidator.data;

    if (!result.valid) {
      if (result.reason === "not-in-word-list") anim.animateError("Not in word list", true);
      else if (result.reason === "wrong-length") anim.animateError("Not enough letters", true);
      else if (result.reason === "already-guessed") anim.animateError("Already guessed", true);
      return;
    }

    if (result.word && result.states) {
      setGuesses((prev) => {
        if (prev.at(-1)?.word === result.word) return prev;
        return [...prev, { word: result.word!, states: result.states! }];
      });
      typing.setCurrentGuess("");
      anim.startReveal(guesses.length);
    }
  }, [wordValidator.data, wordValidator.state, guesses.length]);

  /** Focus the first empty cell. Internal guard prevents focusing when the
   *  game is over or a row is revealing. Safe to call from an auto-focus
   *  effect or after guess submission — NOT safe as an onFocus handler
   *  (would steal focus from the user on every cell click). */
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
