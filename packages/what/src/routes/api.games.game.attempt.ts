import type { LoaderFunctionArgs } from "react-router";

import { getHominemUser } from "~/lib/server/hominem-auth";
import { DEFAULT_GAME_SLUG } from "~/lib/game/generation/catalog";
import { loadActivePuzzleAttempt } from "~/lib/game/server/puzzle.server";
import { resolveGameTimeZone } from "~/lib/server/game-request";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const timeZone = resolveGameTimeZone(request);
  const user = await getHominemUser(request);
  const gameSlug = url.searchParams.get("game") ?? DEFAULT_GAME_SLUG;
  const attempt = await loadActivePuzzleAttempt(new Date(), timeZone, user, gameSlug);
  return Response.json({ attempt });
}
