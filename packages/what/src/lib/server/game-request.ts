export const TIME_ZONE_COOKIE = "what_timezone";

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function resolveGameTimeZone(request: Request): string {
  const cookieHeader = request.headers.get("Cookie") ?? request.headers.get("cookie");
  const entry = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${TIME_ZONE_COOKIE}=`));

  if (!entry) return "UTC";

  try {
    const value = decodeURIComponent(entry.slice(TIME_ZONE_COOKIE.length + 1));
    return isValidTimeZone(value) ? value : "UTC";
  } catch {
    return "UTC";
  }
}

export function resolveGameReturnTo(url: URL): string {
  const returnTo = url.searchParams.get("returnTo");
  if (!returnTo) return url.origin;
  try {
    return new URL(returnTo).toString();
  } catch {
    return url.origin;
  }
}
