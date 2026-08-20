/** Shared query-param parsing for the `what` app's GET endpoints. */

export function resolveWhatTimeZone(url: URL): string {
  const tz = url.searchParams.get("tz");
  if (!tz) return "UTC";
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

/**
 * The `what` app is a separate deployment, so — unlike a same-origin route —
 * this server has no way to know the page the browser is actually on. The
 * client passes its own current URL as `returnTo`; only its origin is
 * trusted here (Hominem's own redirect policy re-validates it against the
 * registered trusted-origins allowlist, so this is a sanity check, not the
 * security boundary).
 */
export function resolveWhatReturnTo(url: URL): string {
  const returnTo = url.searchParams.get("returnTo");
  if (!returnTo) return url.origin;
  try {
    return new URL(returnTo).toString();
  } catch {
    return url.origin;
  }
}
