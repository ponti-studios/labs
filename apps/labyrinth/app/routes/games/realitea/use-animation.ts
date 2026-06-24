import { useCallback, useEffect, useRef, useState } from "react";

import { REALITEA_ANSWER_LENGTH } from "~/lib/realitea";

export function useAnimation() {
  const [revealingGuessIndex, setRevealingGuessIndex] = useState<number | null>(null);
  const [revealedTileCount, setRevealedTileCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // hasError is derived from isShaking — they always transition together
  const hasError = isShaking;

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  const animateError = useCallback((message: string, shake: boolean) => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setErrorMessage(message);
    setIsShaking(shake);
    shakeTimerRef.current = setTimeout(() => {
      setIsShaking(false);
      setErrorMessage(null);
    }, 400);
  }, []);

  const clearError = useCallback(() => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setErrorMessage(null);
    setIsShaking(false);
  }, []);

  /** Begin the tile-reveal animation for a newly submitted guess. */
  const startReveal = useCallback((guessIndex: number) => {
    setRevealingGuessIndex(guessIndex);
    setRevealedTileCount(0);
  }, []);

  /** Reset everything — used on midnight rollover. */
  const resetAnimation = useCallback(() => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    setErrorMessage(null);
    setIsShaking(false);
    setRevealingGuessIndex(null);
    setRevealedTileCount(0);
  }, []);

  useEffect(() => {
    if (revealingGuessIndex === null) return;

    revealTimerRef.current = setTimeout(() => {
      if (revealedTileCount >= REALITEA_ANSWER_LENGTH) {
        setRevealingGuessIndex(null);
        setRevealedTileCount(0);
      } else {
        setRevealedTileCount((count) => count + 1);
      }
    }, 250);

    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, [revealedTileCount, revealingGuessIndex]);

  return {
    revealingGuessIndex,
    revealedTileCount,
    errorMessage,
    isShaking,
    hasError,
    animateError,
    clearError,
    startReveal,
    resetAnimation,
  };
}
