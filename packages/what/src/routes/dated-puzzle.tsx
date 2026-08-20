import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import { getWhatUser, loginUrl } from "../server/auth";
import { isDateKey } from "../lib/player-what/date";
import { getGameBySlug } from "../lib/what/server/games.server";
import { loadPuzzleForSpecificDate } from "../lib/what/server/puzzle.server";
import { DatePage } from "../pages/date-page";

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

  const user = await getWhatUser(request);
  const envelope = await loadPuzzleForSpecificDate(dateKey, user, topic);
  if (!envelope) {
    throw new Response("No WH?T puzzle found for that date", { status: 404 });
  }

  return { ...envelope, signedIn: user !== null, loginUrl: loginUrl(request), gameSlug: topic };
}

export default function DatedPuzzleRoute() {
  return <DatePage {...useLoaderData<typeof loader>()} />;
}
