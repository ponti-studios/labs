import type { DailyTarotCard, DailyTarotReading, DailyTarotResult } from "./tarot-types";

const DATE_KEY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const STORAGE_PREFIX = "labyrinth:tarot:daily";

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isDateKey(value: string): boolean {
  return DATE_KEY_FORMAT.test(value);
}

export function getDailyTarotStorageKey(dateKey: string): string {
  return `${STORAGE_PREFIX}:${dateKey}`;
}

export function buildFallbackDailyReading(
  card: DailyTarotCard,
  dateKey: string,
): DailyTarotReading {
  const readableDate = new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const [primaryKeyword = card.name, secondaryKeyword = "clarity"] = card.keywords;

  return {
    headline: `${card.name} for ${readableDate}`,
    todayMessage: card.curatedReading.uprightSummary,
    focus:
      card.curatedReading.fortuneTelling[0] ??
      `Let ${primaryKeyword.toLowerCase()} and ${secondaryKeyword.toLowerCase()} guide your attention today.`,
    reflectionPrompt:
      card.reflectionQuestions[0] ??
      `How is ${primaryKeyword.toLowerCase()} showing up in your day right now?`,
    careNote: card.curatedReading.shadowSummary,
  };
}

export function isDailyTarotResult(value: unknown): value is DailyTarotResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DailyTarotResult>;
  return (
    typeof candidate.date === "string" &&
    isDateKey(candidate.date) &&
    (candidate.source === "ai" || candidate.source === "curated") &&
    !!candidate.card &&
    !!candidate.reading
  );
}
