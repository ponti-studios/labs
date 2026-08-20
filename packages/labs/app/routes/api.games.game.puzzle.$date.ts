import type { LoaderFunctionArgs } from "react-router";

import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";
import { BRAND_NAME } from "~/config/brand";
import { withGameCors } from "~/lib/server/game-cors";
import { resolveGameReturnTo } from "~/lib/server/game-request";
import { isDateKey } from "~/lib/game/core/date";
import { DEFAULT_GAME_SLUG } from "~/lib/game/generation/catalog";
import { loadPuzzleForSpecificDate } from "~/lib/game/server/puzzle.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const dateKey = params.date;
  if (!dateKey || !isDateKey(dateKey)) {
    return withGameCors(
      request,
      Response.json({ code: "INVALID_DATE", error: "Invalid puzzle date" }, { status: 400 }),
    );
  }

  const url = new URL(request.url);
  const user = await getHominemUser(request);
  const gameSlug = url.searchParams.get("game") ?? DEFAULT_GAME_SLUG;
  const envelope = await loadPuzzleForSpecificDate(dateKey, user, gameSlug);

  if (!envelope) {
    return withGameCors(
      request,
      Response.json(
        { code: "PUZZLE_NOT_FOUND", error: `No ${BRAND_NAME} puzzle found for that date` },
        { status: 404 },
      ),
    );
  }

  const loginUrl = buildHominemLoginUrl(resolveGameReturnTo(url));

  return withGameCors(
    request,
    Response.json({ ...envelope, signedIn: user !== null, loginUrl, gameSlug }),
  );
}
