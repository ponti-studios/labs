import { useCallback, useEffect, useRef, useState } from "react";

export function useAnimation(answerLength: number) {
  const [revealingGuessIndex, setRevealingGuessIndex] = useState<number | null>(null);
  const [revealedTileCount, setRevealedTileCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  const showToast = useCallback((message: string, shake: boolean) => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setErrorMessage(message);
    setIsShaking(shake);
    setHasError(shake);
    shakeTimerRef.current = setTimeout(() => {
      setIsShaking(false);
      setHasError(false);
      setErrorMessage(null);
    }, 400);
  }, []);

  const clearError = useCallback(() => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setErrorMessage(null);
    setIsShaking(false);
    setHasError(false);
  }, []);

  useEffect(() => {
    if (revealingGuessIndex === null) return;

    if (revealedTileCount >= answerLength) {
      revealTimerRef.current = setTimeout(() => {
        setRevealingGuessIndex(null);
        setRevealedTileCount(0);
      }, 250);
      return () => {
        if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      };
    }

    revealTimerRef.current = setTimeout(() => {
      setRevealedTileCount((count) => count + 1);
    }, 250);

    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, [answerLength, revealedTileCount, revealingGuessIndex]);

  return {
    revealingGuessIndex,
    setRevealingGuessIndex,
    revealedTileCount,
    setRevealedTileCount,
    errorMessage,
    isShaking,
    hasError,
    showToast,
    clearError,
  };
}
