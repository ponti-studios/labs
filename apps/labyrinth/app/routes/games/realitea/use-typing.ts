import { useCallback, useState } from "react";
import { normalizeGuess } from "~/lib/realitea";

export function useTyping(answerLength: number, disabled: boolean) {
  const [currentGuess, setCurrentGuess] = useState("");

  const addLetter = useCallback(
    (value: string) => {
      if (disabled) return;
      const letter = normalizeGuess(value).charAt(0);
      if (!letter) return;
      setCurrentGuess((prev) => (prev.length >= answerLength ? prev : prev + letter));
    },
    [answerLength, disabled],
  );

  const removeLetter = useCallback(() => {
    if (disabled) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [disabled]);

  return { currentGuess, setCurrentGuess, addLetter, removeLetter };
}
