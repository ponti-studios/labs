import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import { getGameUser, loginUrl } from "../server/auth";
import { BRAND_NAME } from "../config/brand";
import { isDateKey } from "../lib/puzzle/date";
import { getGameBySlug } from "../lib/data/games.server";
import { loadPuzzleForSpecificDate } from "../lib/data/puzzle.server";
import { DatePage } from "../components/pages/date-page";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const topic = params.topic!;
  const dateKey = params.dateKey!;

  const game = await getGameBySlug(topic);
  if (!game || !game.active) {
    throw new Response("Unknown game", { status: 404 });
  }
  if (!isDateKey(dateKey)) {
    throw new Response("Invalid puzzle date", { status: 400 });
  }

  const user = await getGameUser(request);
  const envelope = await loadPuzzleForSpecificDate(dateKey, user, topic);
  if (!envelope) {
    throw new Response(`No ${BRAND_NAME} puzzle found for that date`, { status: 404 });
  }

  return { ...envelope, signedIn: user !== null, loginUrl: loginUrl(request), gameSlug: topic };
}

export default function DatedPuzzleRoute() {
  return <DatePage {...useLoaderData<typeof loader>()} />;
}
