import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import { getGameUser, loginUrl } from "../server/auth";
import { getGameBySlug } from "../lib/data/games.server";
import { loadPuzzleHistory } from "../lib/data/history.server";
import { HistoryPage } from "../components/pages/history-page";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const topic = params.topic!;
  const game = await getGameBySlug(topic);
  if (!game || !game.active) {
    throw new Response("Unknown game", { status: 404 });
  }

  const url = new URL(request.url);
  const login = loginUrl(request);
  const user = await getGameUser(request);

  if (!user) {
    return { signedIn: false as const, loginUrl: login, gameSlug: topic };
  }

  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;

  const history = await loadPuzzleHistory(user.id, { page }, topic);

  return { signedIn: true as const, loginUrl: login, gameSlug: topic, history };
}

export default function HistoryRoute() {
  return <HistoryPage {...useLoaderData<typeof loader>()} />;
}
