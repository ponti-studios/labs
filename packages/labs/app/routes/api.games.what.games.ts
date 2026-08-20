import type { LoaderFunctionArgs } from "react-router";

import { withWhatCors } from "~/lib/server/what-cors";
import { getActiveGames } from "~/lib/what/server/games.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const games = await getActiveGames();
  return withWhatCors(
    request,
    Response.json({
      games: games.map((game) => ({ slug: game.slug, name: game.name })),
    }),
  );
}
