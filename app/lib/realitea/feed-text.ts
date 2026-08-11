/** Normalize feed text before it becomes model input or puzzle copy. */
export function sanitizeFeedText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .split("")
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return !(
        (codePoint >= 0 && codePoint <= 8) ||
        codePoint === 11 ||
        codePoint === 12 ||
        (codePoint >= 14 && codePoint <= 31) ||
        codePoint === 127
      );
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
    .trim();
}

export const MAX_FEED_TITLE_LENGTH = 240;
export const MAX_FEED_DESCRIPTION_LENGTH = 4_000;
