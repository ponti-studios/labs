import { redirect } from "react-router";

/**
 * `/games/game` player-facing UI moved out of Labs into the standalone
 * game app (own repo/deploy) — see GAME_APP_ORIGIN. Until that env var is
 * set, this falls back to the old same-origin rewrite so the redirect
 * degrades to Labs' own (now-404) path instead of guessing a domain.
 */
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const gameOrigin = process.env.GAME_APP_ORIGIN ?? "https://game.ponti.io";
  const relativePath = url.pathname.replace(/^\/games\/realitea(?=\/|$)/, "") || "/";

  const target = new URL(relativePath, gameOrigin);
  target.search = url.search;
  return redirect(target.toString(), 308);
}

export default function GameLegacyRedirect() {
  return null;
}
