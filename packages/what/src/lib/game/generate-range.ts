import {
  addDaysToDateKey,
  buildDateRange,
  daysBetweenDateKeys,
  getDateKey,
  isDateKey,
} from "./core/date";

export const PRIMARY_PLAYER_TZ = "America/Los_Angeles";
export const MAX_GENERATE_SPAN_DAYS = 14;

export function liveDateKeys(now = new Date()): Set<string> {
  return new Set([getDateKey(now, "UTC"), getDateKey(now, PRIMARY_PLAYER_TZ)]);
}

export function isLiveDate(dateKey: string, now = new Date()): boolean {
  return liveDateKeys(now).has(dateKey);
}

export type GenerateRangeInput = {
  force: boolean;
  daysAhead: number;
  from?: string;
  to?: string;
  todayKey: string;
  now?: Date;
};

export type GenerateRange =
  | { ok: true; fromKey: string; toKey: string; dateKeys: string[]; force: boolean }
  | { ok: false; error: string };

export function resolveGenerateRange(input: GenerateRangeInput): GenerateRange {
  if ((input.from === undefined) !== (input.to === undefined)) {
    return { ok: false, error: "--from and --to must be provided together" };
  }

  if (input.from !== undefined && input.to !== undefined) {
    const from = input.from;
    const to = input.to;
    if (!isDateKey(from) || !isDateKey(to)) {
      return { ok: false, error: "--from and --to must be YYYY-MM-DD" };
    }
    const span = daysBetweenDateKeys(from, to);
    if (span === null || span < 0) {
      return { ok: false, error: "--from must be on or before --to" };
    }
    if (span + 1 > MAX_GENERATE_SPAN_DAYS) {
      return { ok: false, error: `range cannot exceed ${MAX_GENERATE_SPAN_DAYS} days` };
    }
    const live = liveDateKeys(input.now);
    if ([...live].some((liveKey) => from <= liveKey)) {
      return {
        ok: false,
        error: "range must start after the live UTC and America/Los_Angeles dates",
      };
    }
    return {
      ok: true,
      fromKey: from,
      toKey: to,
      dateKeys: buildDateRange(from, { endKey: to }),
      force: input.force,
    };
  }

  if (
    !Number.isInteger(input.daysAhead) ||
    input.daysAhead < 1 ||
    input.daysAhead > MAX_GENERATE_SPAN_DAYS
  ) {
    return {
      ok: false,
      error: `--days-ahead must be an integer from 1 to ${MAX_GENERATE_SPAN_DAYS}`,
    };
  }

  const fromKey = addDaysToDateKey(input.todayKey, 1);
  if (!fromKey) return { ok: false, error: "failed to compute tomorrow from todayKey" };
  const dateKeys = buildDateRange(fromKey, { daysAhead: input.daysAhead });
  const toKey = dateKeys[dateKeys.length - 1];
  if (!toKey) return { ok: false, error: "empty generate range" };
  return { ok: true, fromKey, toKey, dateKeys, force: input.force };
}
