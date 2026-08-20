import type { LoaderFunctionArgs } from "react-router";

import { getHominemUser } from "~/lib/server/hominem-auth";
import { withGameCors } from "~/lib/server/game-cors";
import { resolveGameTimeZone } from "~/lib/server/game-request";
import { DEFAULT_GAME_SLUG } from "~/lib/game/generation/catalog";
import { loadActivePuzzleAttempt } from "~/lib/game/server/puzzle.server";

/**
 * The signed-in player's server-authoritative progress on "today"'s puzzle,
 * stored server-side instead of device-local storage so a solve on one
 * device shows up on another. `tz` is the caller's IANA time zone (the
 * client already knows this via Intl — no cookie round-trip needed).
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const timeZone = resolveGameTimeZone(url);
  const user = await getHominemUser(request);
  const gameSlug = url.searchParams.get("game") ?? DEFAULT_GAME_SLUG;
  const attempt = await loadActivePuzzleAttempt(new Date(), timeZone, user, gameSlug);
  return withGameCors(request, Response.json({ attempt }));
}
