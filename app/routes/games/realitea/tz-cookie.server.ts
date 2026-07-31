/**
 * Reads the client-set `tz` cookie (see route.tsx's first-mount effect) so
 * the server can resolve "today" against the player's local calendar date
 * instead of UTC. Shared by every loader that needs to know which puzzle
 * "today" refers to.
 */
export function parseTzCookie(cookieHeader: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const name = part.slice(0, eqIdx).trim();
    if (name !== "tz") continue;
    const value = decodeURIComponent(part.slice(eqIdx + 1).trim());
    try {
      // Validate that the value is a recognized IANA timezone name
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return value;
    } catch {
      return null;
    }
  }
  return null;
}
