import { useEffect } from 'react';
import { useFetcher, type Fetcher } from 'react-router';

import { type PublicDailyPuzzle } from '~/lib/realitea';
import { getDateKey } from '~/lib/realitea-daily-puzzle';

interface DailyPuzzleResponse {
  puzzle: PublicDailyPuzzle;
}

export interface UseDailyPuzzle {
  /**
   * The next daily puzzle if a rollover fetch resolved with one, otherwise
   * the loader-provided initial. Server state stays in the loader; the hook
   * only contributes an override when polling produced a newer puzzle.
   */
  currentPuzzle: PublicDailyPuzzle;
  dailyPuzzleFetcher: Fetcher<DailyPuzzleResponse>;
}

/**
 * Owns the day-rollover poll for RealiTea. The loader still provides the
 * authoritative initial puzzle; this hook just surfaces a replacement when
 * the local date key changes. The poll skips when the tab is hidden and when
 * the cached puzzle already matches today.
 */
export function useDailyPuzzle(initial: PublicDailyPuzzle): UseDailyPuzzle {
  const dailyPuzzleFetcher = useFetcher<DailyPuzzleResponse>();

  useEffect(() => {
    const sync = () => {
      if (document.hidden) return;
      const todayKey = getDateKey(new Date());
      if (initial.dateKey === todayKey) return;
      dailyPuzzleFetcher.load(`/api/games/realitea/daily?date=${todayKey}`);
    };

    const interval = window.setInterval(sync, 60_000);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [dailyPuzzleFetcher, initial.dateKey]);

  const polled = dailyPuzzleFetcher.data?.puzzle;
  return {
    currentPuzzle: polled ?? initial,
    dailyPuzzleFetcher,
  };
}
