import type { LoaderFunctionArgs } from "react-router";

import { DEFAULT_REALITEA_GAME_SLUG, loadActivePuzzleAttempt } from "~/lib/realitea/puzzle.server";
import { parseTzCookie } from "~/routes/games/realitea/tz-cookie.server";
import { getHominemUser } from "~/lib/server/hominem-auth";

/**
 * The signed-in player's server-authoritative progress on "today"'s puzzle —
 * polled by the client (React Query, refetch-on-window-focus) instead of
 * device-local storage, so a solve on one device shows up on another. See
 * docs/incidents/011-cross-device-progress-not-synced.md.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const timeZone = parseTzCookie(request.headers.get("Cookie") ?? "") ?? "UTC";
  const user = await getHominemUser(request);
  const gameSlug = new URL(request.url).searchParams.get("game") ?? DEFAULT_REALITEA_GAME_SLUG;
  const attempt = gameSlug === DEFAULT_REALITEA_GAME_SLUG
    ? await loadActivePuzzleAttempt(new Date(), timeZone, user)
    : await loadActivePuzzleAttempt(new Date(), timeZone, user, gameSlug);
  return Response.json({ attempt });
}
