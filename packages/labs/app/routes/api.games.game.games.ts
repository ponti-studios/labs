import type { LoaderFunctionArgs } from "react-router";

import { withGameCors } from "~/lib/server/game-cors";
import { getActiveGames } from "~/lib/game/server/games.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const games = await getActiveGames();
  return withGameCors(
    request,
    Response.json({
      games: games.map((game) => ({ slug: game.slug, name: game.name })),
    }),
  );
}
