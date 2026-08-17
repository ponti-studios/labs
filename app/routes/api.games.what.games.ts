import { getActiveGames } from "~/lib/what/server/games.server";

export async function loader() {
  const games = await getActiveGames();
  return Response.json({
    games: games.map((game) => ({ slug: game.slug, name: game.name })),
  });
}
