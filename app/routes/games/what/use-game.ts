import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useFetcher } from "react-router";

import {
  deriveGameStatus,
  hasGuessedWord,
  isGuessLengthValid,
  normalizeGuess,
  type GameStatus,
  type PublicGamesPuzzle,
  type WhatGuess,
  type WhatGuessResult,
} from "~/lib/what";

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
  const wordValidator = useFetcher<WhatGuessResult>();

  type SubmissionState =
    | { status: "idle" }
    | { status: "submitting"; id: number; dateKey: string; word: string; guessIndex: number };
  type SubmissionEvent =
    | { type: "submit started"; id: number; dateKey: string; word: string; guessIndex: number }
    | { type: "validation succeeded"; id: number; dateKey: string }
    | { type: "validation rejected"; id: number; dateKey: string }
    | { type: "request failed"; id: number; dateKey: string }
    | { type: "puzzle changed" };
  const submissionReducer = (state: SubmissionState, event: SubmissionEvent): SubmissionState => {
    if (event.type === "puzzle changed") return { status: "idle" };
    if (event.type === "submit started")
      return {
        status: "submitting",
        id: event.id,
        dateKey: event.dateKey,
        word: event.word,
        guessIndex: event.guessIndex,
      };
    if (state.status !== "submitting" || state.id !== event.id || state.dateKey !== event.dateKey) {
      return state;
    }
    return { status: "idle" };
  };
  const [submission, dispatchSubmission] = useReducer(submissionReducer, { status: "idle" });
  const nextSubmissionIdRef = useRef(0);
  const fetcherWasSubmittingRef = useRef(false);

  const anim = useAnimation();
  const isRevealingRow = anim.revealingGuessIndex !== null;
  const isValidationPending = wordValidator.state !== "idle";
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
    dispatchSubmission({ type: "puzzle changed" });
    fetcherWasSubmittingRef.current = false;
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

  const submitGuess = () => {
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

    wordValidator.submit(
      {
        dateKey: puzzle.dateKey,
        gameSlug,
        previousGuesses: guesses.map((g) => ({ word: g.word })),
        word: guess,
      },
      {
        method: "POST",
        action: "/api/games/what/guess",
        encType: "application/json",
      },
    );
    nextSubmissionIdRef.current += 1;
    dispatchSubmission({
      type: "submit started",
      id: nextSubmissionIdRef.current,
      dateKey: puzzle.dateKey,
      word: guess,
      guessIndex: guesses.length,
    });
  };
  submitGuessRef.current = submitGuess;

  useEffect(() => {
    if (wordValidator.state === "submitting") {
      fetcherWasSubmittingRef.current = true;
      return;
    }
    if (wordValidator.state !== "idle" || !fetcherWasSubmittingRef.current) return;
    fetcherWasSubmittingRef.current = false;
    if (submission.status !== "submitting" || submission.dateKey !== puzzle.dateKey) return;

    const submissionId = submission.id;

    // A fetcher can return to idle without data when the request fails.
    if (!wordValidator.data) {
      dispatchSubmission({ type: "request failed", id: submissionId, dateKey: puzzle.dateKey });
      anim.animateError("Network error — try again", false, "network");
      return;
    }

    const result = wordValidator.data;

    if (!result.valid) {
      dispatchSubmission({
        type: "validation rejected",
        id: submissionId,
        dateKey: puzzle.dateKey,
      });
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
      dispatchSubmission({
        type: "validation succeeded",
        id: submissionId,
        dateKey: puzzle.dateKey,
      });
      setGuesses((prev) => {
        if (hasGuessedWord(prev, result.word!)) return prev;
        return [...prev, { word: result.word!, states: result.states! }];
      });
      typing.setCurrentGuess("");
      anim.startReveal(submission.guessIndex);
      if (result.authRequired) setAuthRequired(true);
    }
  }, [wordValidator.data, wordValidator.state, submission, puzzle.dateKey]);

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
