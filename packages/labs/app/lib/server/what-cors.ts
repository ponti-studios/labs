/**
 * CORS for the `what` app's API surface. `what` is a separate deployment
 * (own repo/origin) that calls these Labs-hosted routes directly from the
 * browser, so every response needs explicit CORS headers — same-origin
 * requests (Labs' own admin UI, if any) are unaffected since browsers only
 * enforce CORS cross-origin.
 */

const ALLOWED_ORIGINS = [
  "http://localhost:5180", // `what`'s local dev server
  process.env.WHAT_APP_ORIGIN, // e.g. https://what.ponti.io in production
].filter((origin): origin is string => Boolean(origin));

function resolveAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

export function whatCorsHeaders(request: Request): HeadersInit {
  const origin = resolveAllowedOrigin(request);
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

/** Call first in every loader/action on this surface; returns a response for
 *  preflight OPTIONS requests, or null to continue handling normally. */
export function handleWhatCorsPreflight(request: Request): Response | null {
  if (request.method !== "OPTIONS") return null;
  return new Response(null, {
    status: 204,
    headers: {
      ...whatCorsHeaders(request),
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export function withWhatCors(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(whatCorsHeaders(request))) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers });
}
