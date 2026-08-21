import type { LoaderFunctionArgs } from "react-router";

import { BRAND_NAME } from "~/config/brand";
import { loadActivePublicPuzzleWithAttempt } from "~/lib/game/server/puzzle.server";
import { getActiveGames } from "~/lib/game/server/games.server";
import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";
import { resolveGameReturnTo, resolveGameTimeZone } from "~/lib/server/game-request";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const timeZone = resolveGameTimeZone(request);
  const gameSlug = params.topic!;
  const user = await getHominemUser(request);
  const [envelope, games] = await Promise.all([
    loadActivePublicPuzzleWithAttempt(new Date(), timeZone, user, gameSlug),
    getActiveGames().catch(() => []),
  ]);

  if (!envelope) {
    return Response.json(
      { code: "PUZZLE_NOT_FOUND", error: `No ${BRAND_NAME} puzzle found for today` },
      { status: 404 },
    );
  }

  return Response.json({
    ...envelope,
    games: games.map((game) => ({ slug: game.slug, name: game.name })),
    loginUrl: buildHominemLoginUrl(resolveGameReturnTo(url)),
    gameSlug,
  });
}
