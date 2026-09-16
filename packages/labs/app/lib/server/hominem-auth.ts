import { getServerAuth } from "@ponti-studios/auth/server";

import { HominemAuthEnv } from "./env";

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
 * so an API outage — or a misconfigured HOMINEM_API_URL — degrades the game
 * to anonymous play instead of a 500.
 *
 * Uses HOMINEM_INTERNAL_API_URL for this server-to-server check — in
 * production that's Hominem's Railway-private address, reaching the API
 * directly over Railway's internal network instead of the public
 * api.ponti.io hostname. That's required because Cloudflare's bot-challenge
 * in front of api.ponti.io intercepts server-to-server fetches (no real
 * browser to solve the challenge) and returns its "Just a moment..."
 * interstitial instead of proxying to the origin, which getServerAuth
 * silently reads as "no session". Falls back to HOMINEM_API_URL when unset.
 */
export async function getHominemUser(request: Request): Promise<HominemUser | null> {
  try {
    const { HOMINEM_INTERNAL_API_URL } = HominemAuthEnv.parse(process.env);
    const { user } = await getServerAuth(request, { apiBaseUrl: HOMINEM_INTERNAL_API_URL });
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
  const { HOMINEM_API_URL } = HominemAuthEnv.parse(process.env);
  const url = new URL("/login", HOMINEM_API_URL);
  url.searchParams.set("next", returnTo);
  return url.toString();
}
