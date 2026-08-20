import type { LoaderFunctionArgs } from "react-router";

import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";
import { withWhatCors } from "~/lib/server/what-cors";
import { resolveWhatReturnTo } from "~/lib/server/what-request";
import { isDateKey } from "~/lib/what/core/date";
import { DEFAULT_WHAT_GAME_SLUG } from "~/lib/what/generation/catalog";
import { loadPuzzleForSpecificDate } from "~/lib/what/server/puzzle.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const dateKey = params.date;
  if (!dateKey || !isDateKey(dateKey)) {
    return withWhatCors(
      request,
      Response.json({ code: "WHAT_INVALID_DATE", error: "Invalid puzzle date" }, { status: 400 }),
    );
  }

  const url = new URL(request.url);
  const user = await getHominemUser(request);
  const gameSlug = url.searchParams.get("game") ?? DEFAULT_WHAT_GAME_SLUG;
  const envelope = await loadPuzzleForSpecificDate(dateKey, user, gameSlug);

  if (!envelope) {
    return withWhatCors(
      request,
      Response.json(
        { code: "WHAT_PUZZLE_NOT_FOUND", error: "No WH?T puzzle found for that date" },
        { status: 404 },
      ),
    );
  }

  const loginUrl = buildHominemLoginUrl(resolveWhatReturnTo(url));

  return withWhatCors(
    request,
    Response.json({ ...envelope, signedIn: user !== null, loginUrl, gameSlug }),
  );
}
