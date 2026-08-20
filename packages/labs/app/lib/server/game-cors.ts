/**
 * CORS for the game app's API surface. The game app is a separate deployment
 * (own repo/origin) that calls these Labs-hosted routes directly from the
 * browser, so every response needs explicit CORS headers — same-origin
 * requests (Labs' own admin UI, if any) are unaffected since browsers only
 * enforce CORS cross-origin.
 */

const ALLOWED_ORIGINS = [
  "http://localhost:5180", // the game app's local dev server
  process.env.GAME_APP_ORIGIN, // e.g. https://game.ponti.io in production
].filter((origin): origin is string => Boolean(origin));

function resolveAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

export function gameCorsHeaders(request: Request): HeadersInit {
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
export function handleGameCorsPreflight(request: Request): Response | null {
  if (request.method !== "OPTIONS") return null;
  return new Response(null, {
    status: 204,
    headers: {
      ...gameCorsHeaders(request),
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export function withGameCors(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(gameCorsHeaders(request))) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers });
}
