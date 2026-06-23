import type { LetterState, RealiteaGuess } from './realitea';

const SHARE_TILES: Record<LetterState, string> = {
  absent: '⬜',
  present: '🟨',
  correct: '🟩',
};

export interface ShareRealiTeaResultOptions {
  guesses: readonly RealiteaGuess[];
  isSolved: boolean;
  date?: Date;
  copyToClipboard: (text: string) => Promise<void>;
  promptCopy: (message: string, text: string) => void;
}

function formatShareDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function buildRealiTeaShareText(
  guesses: readonly RealiteaGuess[],
  isSolved: boolean,
  date = new Date(),
): string {
  const score = isSolved ? `${guesses.length}/6` : 'X/6';
  const rows = guesses.map((guess) => guess.states.map((state) => SHARE_TILES[state]).join(''));

  return [`RealiTea - ${formatShareDate(date)}`, score, '', ...rows].join('\n');
}

export async function shareRealiTeaResult({
  guesses,
  isSolved,
  date = new Date(),
  copyToClipboard,
  promptCopy,
}: ShareRealiTeaResultOptions) {
  const shareText = buildRealiTeaShareText(guesses, isSolved, date);

  try {
    await copyToClipboard(shareText);
    return { method: 'clipboard' as const, shareText };
  } catch {
    promptCopy('Copy your RealiTea result:', shareText);
    return { method: 'prompt' as const, shareText };
  }
}
