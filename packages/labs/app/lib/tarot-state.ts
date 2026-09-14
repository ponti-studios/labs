import {
  getDailyTarotStorageKey,
  getLegacyDailyTarotStorageKey,
  isDailyTarotResult,
} from "~/lib/tarot-daily";
import type { DailyTarotResult } from "~/lib/tarot-types";

function parseStoredResult(raw: string, dateKey: string): DailyTarotResult | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isDailyTarotResult(parsed) && parsed.date === dateKey) return parsed;
  } catch {
    // Corrupt entry — treated as missing by the caller.
  }
  return null;
}

export function readDailyTarotResult(dateKey: string): DailyTarotResult | null {
  if (typeof window === "undefined") return null;

  const storageKey = getDailyTarotStorageKey(dateKey);
  const raw = window.localStorage.getItem(storageKey);
  if (raw) {
    const result = parseStoredResult(raw, dateKey);
    if (result) return result;
    window.localStorage.removeItem(storageKey);
    return null;
  }

  // Pre-rebrand entries live under the legacy prefix — adopt once, then drop.
  const legacyKey = getLegacyDailyTarotStorageKey(dateKey);
  const legacyRaw = window.localStorage.getItem(legacyKey);
  window.localStorage.removeItem(legacyKey);
  if (!legacyRaw) return null;
  const migrated = parseStoredResult(legacyRaw, dateKey);
  if (!migrated) return null;
  window.localStorage.setItem(storageKey, JSON.stringify(migrated));
  return migrated;
}

export function saveDailyTarotResult(dateKey: string, result: DailyTarotResult) {
  setDailyTarotResult(dateKey, result);
}

export function setDailyTarotResult(dateKey: string, result: DailyTarotResult) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(getDailyTarotStorageKey(dateKey), JSON.stringify(result));
}
