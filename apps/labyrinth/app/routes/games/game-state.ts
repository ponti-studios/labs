import { usePersistedStorageQuery } from "~/lib/persisted-storage-query";
import { normalizeGuess } from "~/lib/realitea";

const STORAGE_PREFIX = "labyrinth:realitea:";

export interface GameState {
  puzzleKey: string;
  guesses: string[];
  status: "playing" | "solved" | "failed";
}

function getStorageKey(puzzleKey: string) {
  return `${STORAGE_PREFIX}${puzzleKey}`;
}

export function readGameState(puzzleKey: string): GameState | null {
  if (typeof window === "undefined") return null;

  const saved = window.localStorage.getItem(getStorageKey(puzzleKey));

  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as Partial<GameState>;
    if (
      parsed.puzzleKey !== puzzleKey ||
      !Array.isArray(parsed.guesses) ||
      (parsed.status !== "playing" && parsed.status !== "solved" && parsed.status !== "failed")
    ) {
      return null;
    }

    return {
      puzzleKey,
      guesses: parsed.guesses.map((guess) => normalizeGuess(String(guess))).filter(Boolean),
      status: parsed.status,
    };
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(getStorageKey(state.puzzleKey), JSON.stringify(state));
}

export function useGameState(puzzleKey: string) {
  const { value, isLoading, saveValue, isSaving } = usePersistedStorageQuery({
    queryKey: ["games", "realitea", "game-state", puzzleKey] as const,
    read: () => readGameState(puzzleKey),
    write: saveGameState,
  });

  return {
    gameState: value,
    isGameStateLoading: isLoading,
    saveGameState: saveValue,
    isSavingGameState: isSaving,
  };
}
