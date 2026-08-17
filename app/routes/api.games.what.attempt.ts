import type { LoaderFunctionArgs } from "react-router";

import { DEFAULT_WHAT_GAME_SLUG } from "~/lib/what/generation/catalog";
import { loadActivePuzzleAttempt } from "~/lib/what/server/puzzle.server";
import { parseTzCookie } from "~/routes/games/what/tz-cookie.server";
import { getHominemUser } from "~/lib/server/hominem-auth";

/**
 * The signed-in player's server-authoritative progress on "today"'s puzzle,
 * stored server-side instead of device-local storage so a solve on one
 * device shows up on another. The main game route now gets this from its
 * own loader (revalidated on window focus) rather than polling this
 * endpoint — see games/what/route.tsx.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const timeZone = parseTzCookie(request.headers.get("Cookie") ?? "") ?? "UTC";
  const user = await getHominemUser(request);
  const gameSlug = new URL(request.url).searchParams.get("game") ?? DEFAULT_WHAT_GAME_SLUG;
  const attempt = await loadActivePuzzleAttempt(new Date(), timeZone, user, gameSlug);
  return Response.json({ attempt });
}
