import type { LoaderFunctionArgs } from "react-router";

import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";
import { withWhatCors } from "~/lib/server/what-cors";
import { DEFAULT_WHAT_GAME_SLUG } from "~/lib/what/generation/catalog";
import { loadActivePublicPuzzleWithAttempt } from "~/lib/what/server/puzzle.server";
import { getActiveGames } from "~/lib/what/server/games.server";
import { resolveWhatReturnTo, resolveWhatTimeZone } from "~/lib/server/what-request";

/**
 * Today's puzzle for the `what` app — equivalent to what the old
 * games/what/route.tsx server loader did, now served as a plain JSON GET so
 * a separately-deployed frontend can fetch it directly. `tz` and `returnTo`
 * are supplied by the client since it (not this server) knows the visitor's
 * local time zone and the page it's actually on.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const timeZone = resolveWhatTimeZone(url);
  const gameSlug = url.searchParams.get("game") ?? DEFAULT_WHAT_GAME_SLUG;
  const user = await getHominemUser(request);

  const [envelope, games] = await Promise.all([
    loadActivePublicPuzzleWithAttempt(new Date(), timeZone, user, gameSlug),
    getActiveGames().catch(() => []),
  ]);

  if (!envelope) {
    return withWhatCors(
      request,
      Response.json(
        { code: "WHAT_PUZZLE_NOT_FOUND", error: "No WH?T puzzle found for today" },
        { status: 404 },
      ),
    );
  }

  const loginUrl = buildHominemLoginUrl(resolveWhatReturnTo(url));

  return withWhatCors(
    request,
    Response.json({
      ...envelope,
      games: games.map((game) => ({ slug: game.slug, name: game.name })),
      loginUrl,
      gameSlug,
    }),
  );
}
