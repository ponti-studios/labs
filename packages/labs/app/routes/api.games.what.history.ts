import type { LoaderFunctionArgs } from "react-router";

import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";
import { withWhatCors } from "~/lib/server/what-cors";
import { resolveWhatReturnTo } from "~/lib/server/what-request";
import { DEFAULT_WHAT_GAME_SLUG } from "~/lib/what/generation/catalog";
import { loadPuzzleHistory } from "~/lib/what/server/history.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const loginUrl = buildHominemLoginUrl(resolveWhatReturnTo(url));
  const user = await getHominemUser(request);

  if (!user) {
    return withWhatCors(request, Response.json({ signedIn: false as const, loginUrl }));
  }

  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;
  const gameSlug = url.searchParams.get("game") ?? DEFAULT_WHAT_GAME_SLUG;

  const history = await loadPuzzleHistory(user.id, { page }, gameSlug);

  return withWhatCors(
    request,
    Response.json({ signedIn: true as const, loginUrl, history, gameSlug }),
  );
}
