export const TIME_ZONE_COOKIE = "what_timezone";

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function readTimeZoneCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;

  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${TIME_ZONE_COOKIE}=`));
  if (!entry) return null;

  const value = decodeURIComponent(entry.slice(TIME_ZONE_COOKIE.length + 1));
  return isValidTimeZone(value) ? value : null;
}
