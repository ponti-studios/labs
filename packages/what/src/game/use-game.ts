import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitGuess as submitGuessRequest } from "../lib/api";
import {
  deriveGameStatus,
  hasGuessedWord,
  isGuessLengthValid,
  normalizeGuess,
  type GameStatus,
  type PublicGamesPuzzle,
  type WhatGuess,
} from "../lib/player-what";

import { useAnimation } from "./use-animation";
import { useTyping } from "./use-typing";

export interface WhatGameState {
  guesses: readonly WhatGuess[];
  status: GameStatus;
  isSolved: boolean;
  isGameOver: boolean;
  // True once an anonymous player has used their one free guess (or tried a
  // second) without it solving the puzzle. isGameOver is also true in this
  // state, but callers that need to distinguish "sign in to keep playing"
  // from a genuinely finished game (solved/6 guesses) should check this.
  authRequired: boolean;
  isRevealingRow: boolean;
  isValidationPending: boolean;
  currentGuess: string;
  errorMessage: string | null;
  errorCode: string | null;
  isShaking: boolean;
  hasError: boolean;
  shakeToken: number;
  revealedTileCount: number;
  revealingGuessIndex: number | null;
  addLetter: (value: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  clearError: () => void;
}

interface UseWhatGameOptions {
  puzzle: PublicGamesPuzzle;
  initialGuesses: readonly WhatGuess[];
  gameSlug: string;
}

export function useWhatGame({
  puzzle,
  initialGuesses,
  gameSlug,
}: UseWhatGameOptions): WhatGameState {
  const [guesses, setGuesses] = useState<WhatGuess[]>(() => [...initialGuesses]);
  const [authRequired, setAuthRequired] = useState(false);
  const [isValidationPending, setIsValidationPending] = useState(false);

  // Guards against a response landing after the puzzle has already changed
  // underneath it (midnight rollover mid-flight) — no reducer needed since
  // submitGuess is disabled while a request is in flight, so there's never
  // more than one in-flight request to disambiguate between.
  const inFlightDateKeyRef = useRef<string | null>(null);

  const anim = useAnimation();
  const isRevealingRow = anim.revealingGuessIndex !== null;
  const status = useMemo(() => deriveGameStatus(guesses), [guesses]);
  const isGameOver = status !== "playing" || authRequired;
  const canMutateGuess = !isGameOver && !isValidationPending && !isRevealingRow;

  const typing = useTyping(!canMutateGuess);

  // Reset everything when the active puzzle changes (midnight rollover).
  // The ref guard prevents the effect from firing on the initial mount,
  // which would otherwise overwrite the localStorage-restored guesses.
  const prevDateKeyRef = useRef(puzzle.dateKey);
  useEffect(() => {
    if (puzzle.dateKey === prevDateKeyRef.current) return;
    prevDateKeyRef.current = puzzle.dateKey;
    setGuesses([]);
    setAuthRequired(false);
    setIsValidationPending(false);
    inFlightDateKeyRef.current = null;
    typing.setCurrentGuess("");
    anim.resetAnimation();
  }, [puzzle.dateKey]);

  // Stable refs so the keydown listener never needs to be re-registered
  // when these callbacks change identity between renders.
  const addLetterRef = useRef(typing.addLetter);
  const removeLetterRef = useRef(typing.removeLetter);
  const submitGuessRef = useRef(() => {});
  addLetterRef.current = typing.addLetter;
  removeLetterRef.current = typing.removeLetter;

  useEffect(() => {
    if (isGameOver) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName))
      ) {
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        submitGuessRef.current();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        removeLetterRef.current();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        addLetterRef.current(e.key);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isGameOver]);

  const submitGuess = useCallback(() => {
    if (!canMutateGuess) return;
    const guess = normalizeGuess(typing.currentGuess);

    if (!isGuessLengthValid(guess)) {
      anim.animateError("Not enough letters", true, "wrong-length");
      return;
    }

    if (hasGuessedWord(guesses, guess)) {
      anim.animateError("Already guessed", true, "already-guessed");
      return;
    }

    const dateKey = puzzle.dateKey;
    const guessIndex = guesses.length;
    inFlightDateKeyRef.current = dateKey;
    setIsValidationPending(true);

    void submitGuessRequest({
      dateKey,
      gameSlug,
      previousGuesses: guesses.map((g) => ({ word: g.word })),
      word: guess,
    }).then((result) => {
      // The puzzle rolled over while this request was in flight — the
      // puzzle-change effect above already reset state, so drop it.
      if (inFlightDateKeyRef.current !== dateKey) return;
      inFlightDateKeyRef.current = null;
      setIsValidationPending(false);

      if (!result) {
        anim.animateError("Network error — try again", false, "network");
        return;
      }

      if (!result.valid) {
        if (result.reason === "not-in-word-list")
          anim.animateError("Not in word list", true, "not-in-word-list");
        else if (result.reason === "wrong-length")
          anim.animateError("Not enough letters", true, "wrong-length");
        else if (result.reason === "already-guessed")
          anim.animateError("Already guessed", true, "already-guessed");
        else if (result.reason === "rate-limited")
          anim.animateError("Too many guesses — slow down", true, "rate-limited");
        else if (result.reason === "game-over")
          anim.animateError("This puzzle is already over", true, "game-over");
        if (result.reason === "auth-required") setAuthRequired(true);
        return;
      }

      if (result.word && result.states) {
        setGuesses((prev) => {
          if (hasGuessedWord(prev, result.word!)) return prev;
          return [...prev, { word: result.word!, states: result.states! }];
        });
        typing.setCurrentGuess("");
        anim.startReveal(guessIndex);
        if (result.authRequired) setAuthRequired(true);
      }
    });
  }, [canMutateGuess, typing, guesses, puzzle.dateKey, gameSlug, anim]);
  submitGuessRef.current = submitGuess;

  return {
    guesses,
    status,
    isSolved: status === "solved",
    isGameOver,
    authRequired,
    isRevealingRow,
    isValidationPending,
    currentGuess: typing.currentGuess,
    errorMessage: anim.errorMessage,
    errorCode: anim.errorCode,
    isShaking: anim.isShaking,
    hasError: anim.hasError,
    shakeToken: anim.shakeToken,
    revealedTileCount: anim.revealedTileCount,
    revealingGuessIndex: anim.revealingGuessIndex,
    addLetter: typing.addLetter,
    removeLetter: typing.removeLetter,
    submitGuess,
    clearError: anim.clearError,
  };
}
