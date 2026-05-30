import type { LoaderFunctionArgs } from "react-router";
import { getRandomDailyTarotCard } from "~/lib/tarot-cards";
import { getLocalDateKey, isDateKey } from "~/lib/tarot-daily";
import { buildDailyTarotResult } from "~/lib/server/tarot-reading";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const requestedDate = url.searchParams.get("date");
  const dateKey = requestedDate && isDateKey(requestedDate) ? requestedDate : getLocalDateKey();

  try {
    const card = getRandomDailyTarotCard();
    const result = await buildDailyTarotResult(card, dateKey);

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to draw daily tarot card",
      },
      { status: 500 },
    );
  }
}
