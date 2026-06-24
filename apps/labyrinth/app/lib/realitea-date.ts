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
