import type { LoaderFunctionArgs } from "react-router";

import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";
import { DEFAULT_GAME_SLUG } from "~/lib/game/generation/catalog";
import { loadPuzzleHistory } from "~/lib/game/server/history.server";
import { resolveGameReturnTo } from "~/lib/server/game-request";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const loginUrl = buildHominemLoginUrl(resolveGameReturnTo(url));
  const user = await getHominemUser(request);

  if (!user) return Response.json({ signedIn: false as const, loginUrl });

  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;
  const gameSlug = url.searchParams.get("game") ?? DEFAULT_GAME_SLUG;
  const history = await loadPuzzleHistory(user.id, { page }, gameSlug);

  return Response.json({ signedIn: true as const, loginUrl, history, gameSlug });
}
