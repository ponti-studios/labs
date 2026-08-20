import { redirect } from "react-router";

/**
 * `/games/what` player-facing UI moved out of Labs into the standalone
 * `what` app (own repo/deploy) — see WHAT_APP_ORIGIN. Until that env var is
 * set, this falls back to the old same-origin rewrite so the redirect
 * degrades to Labs' own (now-404) path instead of guessing a domain.
 */
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const whatOrigin = process.env.WHAT_APP_ORIGIN ?? "https://what.ponti.io";
  const relativePath = url.pathname.replace(/^\/games\/realitea(?=\/|$)/, "") || "/";

  const target = new URL(relativePath, whatOrigin);
  target.search = url.search;
  return redirect(target.toString(), 308);
}

export default function WhatLegacyRedirect() {
  return null;
}
