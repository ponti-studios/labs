import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import { getActiveGames, getGameBySlug } from "../lib/game/server/games.server";
import { loadActivePublicPuzzleWithAttempt } from "../lib/game/server/puzzle.server";
import { readTimeZoneCookie } from "../lib/player-game/timezone";
import { TodayPage } from "../pages/today-page";
import { getGameUser, loginUrl } from "../server/auth";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const topic = params.topic!;
  const game = await getGameBySlug(topic);
  if (!game || !game.active) {
    throw new Response("Unknown game", { status: 404 });
  }

  const timeZone = readTimeZoneCookie(request.headers.get("Cookie")) ?? "UTC";
  const user = await getGameUser(request);

  const [envelope, games] = await Promise.all([
    loadActivePublicPuzzleWithAttempt(new Date(), timeZone, user, topic),
    getActiveGames().catch(() => []),
  ]);

  const login = loginUrl(request);
  const topicList = games.map((g) => ({ slug: g.slug, name: g.name }));

  if (!envelope) {
    return { puzzle: null, loginUrl: login, gameSlug: topic, games: topicList };
  }

  return { ...envelope, loginUrl: login, gameSlug: topic, games: topicList };
}

export default function TodayRoute() {
  return <TodayPage {...useLoaderData<typeof loader>()} />;
}
