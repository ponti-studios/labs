import { useLoaderData, useSearchParams, type LoaderFunctionArgs } from "react-router";

import { HistoryGuestView, HistoryPageView } from "../components/pages/history-page";
import { getGameBySlug } from "../lib/data/games.server";
import { loadPuzzleHistory } from "../lib/data/history.server";
import { getGameUser, loginUrl } from "../server/auth";

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
  const props = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();

  if (!props.signedIn) {
    return <HistoryGuestView loginUrl={props.loginUrl} />;
  }

  const setPage = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(page));
      return prev;
    });
  };

  return (
    <HistoryPageView
      history={props.history}
      gameSlug={props.gameSlug}
      mosaicCells={props.history.mosaic}
      onPageChange={setPage}
    />
  );
}
