import { redirect } from "react-router";

/**
 * `/games/what` player-facing UI moved out of Labs into the standalone
 * `what` app (own repo/deploy) — see WHAT_APP_ORIGIN. Until that env var is
 * set, this falls back to the old same-origin rewrite so the redirect
 * degrades to Labs' own (now-404) path instead of guessing a domain.
 */
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/games\/realitea(?=\/|$)/, "/games/what");

  const whatOrigin = process.env.WHAT_APP_ORIGIN;
  if (whatOrigin) {
    const target = new URL(path.replace(/^\/games\/what/, ""), whatOrigin);
    target.search = url.search;
    return redirect(target.toString(), 308);
  }

  url.pathname = path;
  return redirect(url.toString(), 308);
}

export default function WhatLegacyRedirect() {
  return null;
}
