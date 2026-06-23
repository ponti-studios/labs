import {
  normalizeGuess,
  type GameStatus,
  type LetterState,
  type RealiteaGuess,
} from '~/lib/realitea';

const STORAGE_PREFIX = 'labyrinth:realitea:';

export interface GameState {
  puzzleKey: string;
  guesses: RealiteaGuess[];
  status: GameStatus;
}

function getStorageKey(puzzleKey: string) {
  return `${STORAGE_PREFIX}${puzzleKey}`;
}

const LETTER_STATES: readonly LetterState[] = ['absent', 'present', 'correct'];

function isLetterState(value: unknown): value is LetterState {
  return typeof value === 'string' && LETTER_STATES.includes(value as LetterState);
}

function isStoredGuess(value: unknown): value is RealiteaGuess {
  if (!value || typeof value !== 'object') return false;
  const guess = value as Partial<RealiteaGuess>;
  if (typeof guess.word !== 'string') return false;
  if (!Array.isArray(guess.states)) return false;
  return guess.states.every(isLetterState);
}

/**
 * One-shot read of the persisted game state. Always safe to call on the server
 * (returns `null`). The result is treated as the seed for the route and is not
 * re-read during the lifetime of the route mount; persistence is one-way
 * (write-only) to avoid the feedback loop that arose when localStorage was
 * read reactively.
 */
export function readGameState(puzzleKey: string): GameState | null {
  if (typeof window === 'undefined') return null;

  const saved = window.localStorage.getItem(getStorageKey(puzzleKey));
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as Partial<GameState>;
    if (
      parsed.puzzleKey !== puzzleKey ||
      !Array.isArray(parsed.guesses) ||
      (parsed.status !== 'playing' && parsed.status !== 'solved' && parsed.status !== 'failed')
    ) {
      return null;
    }

    const validGuesses: RealiteaGuess[] = parsed.guesses
      .filter(isStoredGuess)
      .map((guess) => ({
        word: normalizeGuess(guess.word),
        states: guess.states,
      }))
      .filter((guess) => guess.word.length > 0);

    return { puzzleKey, guesses: validGuesses, status: parsed.status };
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getStorageKey(state.puzzleKey), JSON.stringify(state));
}
