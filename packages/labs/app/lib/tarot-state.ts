import { getDailyTarotStorageKey, isDailyTarotResult } from "~/lib/tarot-daily";
import type { DailyTarotResult } from "~/lib/tarot-types";

export function readDailyTarotResult(dateKey: string): DailyTarotResult | null {
  if (typeof window === "undefined") return null;

  const storageKey = getDailyTarotStorageKey(dateKey);
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (isDailyTarotResult(parsed) && parsed.date === dateKey) {
      return parsed;
    }
  } catch {
    // Fall through to cleanup.
  }

  window.localStorage.removeItem(storageKey);
  return null;
}

export function saveDailyTarotResult(dateKey: string, result: DailyTarotResult) {
  setDailyTarotResult(dateKey, result);
}

export function setDailyTarotResult(dateKey: string, result: DailyTarotResult) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(getDailyTarotStorageKey(dateKey), JSON.stringify(result));
}
