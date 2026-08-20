import type { LoaderFunctionArgs } from "react-router";

import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";
import { BRAND_NAME } from "~/config/brand";
import { withGameCors } from "~/lib/server/game-cors";
import { DEFAULT_GAME_SLUG } from "~/lib/game/generation/catalog";
import { loadActivePublicPuzzleWithAttempt } from "~/lib/game/server/puzzle.server";
import { getActiveGames } from "~/lib/game/server/games.server";
import { resolveGameReturnTo, resolveGameTimeZone } from "~/lib/server/game-request";

/**
 * Today's puzzle for the standalone game app — equivalent to what the old
 * games/game/route.tsx server loader did, now served as a plain JSON GET so
 * a separately-deployed frontend can fetch it directly. `tz` and `returnTo`
 * are supplied by the client since it (not this server) knows the visitor's
 * local time zone and the page it's actually on.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const timeZone = resolveGameTimeZone(url);
  const gameSlug = url.searchParams.get("game") ?? DEFAULT_GAME_SLUG;
  const user = await getHominemUser(request);

  const [envelope, games] = await Promise.all([
    loadActivePublicPuzzleWithAttempt(new Date(), timeZone, user, gameSlug),
    getActiveGames().catch(() => []),
  ]);

  if (!envelope) {
    return withGameCors(
      request,
      Response.json(
        { code: "PUZZLE_NOT_FOUND", error: `No ${BRAND_NAME} puzzle found for today` },
        { status: 404 },
      ),
    );
  }

  const loginUrl = buildHominemLoginUrl(resolveGameReturnTo(url));

  return withGameCors(
    request,
    Response.json({
      ...envelope,
      games: games.map((game) => ({ slug: game.slug, name: game.name })),
      loginUrl,
      gameSlug,
    }),
  );
}
