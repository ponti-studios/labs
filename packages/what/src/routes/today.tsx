import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import { getWhatUser, loginUrl } from "../server/auth";
import { getActiveGames, getGameBySlug } from "../lib/what/server/games.server";
import { loadActivePublicPuzzleWithAttempt } from "../lib/what/server/puzzle.server";
import { TodayPage } from "../pages/today-page";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const topic = params.topic!;
  const game = await getGameBySlug(topic);
  if (!game || !game.active) {
    throw new Response("Unknown game", { status: 404 });
  }

  const url = new URL(request.url);
  const timeZone = url.searchParams.get("tz") ?? "UTC";
  const user = await getWhatUser(request);

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
