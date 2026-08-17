import { getServerAuth } from "@ponti-studios/auth/server";

/**
 * Session verification against Hominem's Better Auth deployment, which is the
 * sole auth authority for this app — labs never issues or validates its own
 * sessions, and never hosts a login form. Sign-in happens on Hominem's own
 * hosted /login page; we only read the resulting cross-subdomain cookie.
 *
 * In production the cookie is set on api.ponti.io for the shared .ponti.io
 * domain, so labs.ponti.io sends it automatically. Locally the two run on
 * different localhost ports, which cannot share a cookie domain — see
 * README/AGENTS notes on local auth for the workaround.
 */

const DEFAULT_HOMINEM_API_URL = "http://localhost:4040";

export function getHominemApiUrl(): string {
  return process.env.HOMINEM_API_URL ?? DEFAULT_HOMINEM_API_URL;
}

/**
 * Base URL for the server-to-server session check only — never expose this to
 * the browser. In production this is Hominem's Railway-private address
 * (HOMINEM_INTERNAL_API_URL), which reaches the API directly over Railway's
 * internal network instead of the public api.ponti.io hostname. That's
 * required because Cloudflare's bot-challenge in front of api.ponti.io
 * intercepts server-to-server fetches (no real browser to solve the
 * challenge) and returns its "Just a moment..." interstitial instead of
 * proxying to the origin, which getServerAuth silently reads as "no session".
 * Falls back to the public URL when unset, so local dev and tests are
 * unaffected.
 */
export function getHominemInternalApiUrl(): string {
  return process.env.HOMINEM_INTERNAL_API_URL ?? getHominemApiUrl();
}

export type HominemUser = {
  id: string;
  email?: string | null;
};

/**
 * Resolves the signed-in Hominem user for an inbound request, or null when the
 * request carries no valid session. Forwards the request's own Cookie header —
 * this is a server-only call and must never be invoked from client code.
 *
 * Fails closed: any transport error, non-2xx, or unparseable payload from the
 * Hominem API yields null (treated as "not signed in") rather than throwing,
 * so an API outage degrades RealiTea to anonymous play instead of a 500.
 */
export async function getHominemUser(request: Request): Promise<HominemUser | null> {
  try {
    const { user } = await getServerAuth(request, { apiBaseUrl: getHominemInternalApiUrl() });
    if (!user?.id) return null;
    return { id: user.id, email: user.email ?? null };
  } catch {
    return null;
  }
}

/**
 * Builds the URL that sends a player to Hominem's hosted login page and back
 * again afterwards. `returnTo` must be an absolute labs URL whose origin the
 * Hominem API trusts as LABS_URL, or the API rejects the redirect (see
 * resolveAppRedirectUrl in @ponti-studios/auth/shared/redirect-policy).
 */
export function buildHominemLoginUrl(returnTo: string): string {
  const url = new URL("/login", getHominemApiUrl());
  url.searchParams.set("next", returnTo);
  return url.toString();
}
