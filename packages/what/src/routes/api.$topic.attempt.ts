import type { LoaderFunctionArgs } from "react-router";

import { getHominemUser } from "~/lib/server/hominem-auth";
import { loadActivePuzzleAttempt } from "~/lib/game/server/puzzle.server";
import { resolveGameTimeZone } from "~/lib/server/game-request";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const timeZone = resolveGameTimeZone(request);
  const user = await getHominemUser(request);
  const gameSlug = params.topic!;
  const attempt = await loadActivePuzzleAttempt(new Date(), timeZone, user, gameSlug);
  return Response.json({ attempt });
}
