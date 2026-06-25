import type { PuzzleWindow } from "./realitea.types";

const DATE_KEY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

const dateKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" });

export function getDateKey(date: Date): string {
  return dateKeyFormat.format(date);
}

export function isDateKey(value: string): boolean {
  return DATE_KEY_FORMAT.test(value);
}

export function parseDate(value: string | null | undefined): Date | null {
  if (!value || !isDateKey(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if ([year, month, day].some(Number.isNaN)) return null;
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

export function addDaysToDateKey(value: string, days: number): string | null {
  const date = parseDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return getDateKey(date);
}

export function getPuzzleWindow(date: Date): PuzzleWindow {
  const [year, month, day] = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
  const dateKey = dateKeyFormat.format(date);
  const publishAt = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const expireAt = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));
  return { dateKey, expireAt, publishAt };
}

/**
 * Build a contiguous array of date keys from `startKey` forward.
 *
 * - If `daysAhead` is set, returns exactly that many keys.
 * - If `endKey` is set, returns all keys from start through endKey (inclusive).
 * - If neither is set, returns a single-element array with `startKey`.
 */
export function buildDateRange(
  startKey: string,
  options: { endKey?: string; daysAhead?: number } = {},
): string[] {
  const dates: string[] = [];
  let current = startKey;

  if (options.daysAhead !== undefined) {
    for (let i = 0; i < options.daysAhead; i++) {
      dates.push(current);
      const next = addDaysToDateKey(current, 1);
      if (!next) break;
      current = next;
    }
    return dates;
  }

  if (options.endKey) {
    while (true) {
      dates.push(current);
      if (current === options.endKey) break;
      const next = addDaysToDateKey(current, 1);
      if (!next) break;
      current = next;
    }
    return dates;
  }

  return [startKey];
}
