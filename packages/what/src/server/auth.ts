import { getServerAuth } from "@ponti-studios/auth/server";

import { WhatServerEnv } from "../lib/server/env";

export type GameUser = { id: string; email?: string | null };

export async function getGameUser(request: Request): Promise<GameUser | null> {
  try {
    const { user } = await getServerAuth(request, {
      apiBaseUrl:
        process.env.HOMINEM_INTERNAL_API_URL ??
        process.env.HOMINEM_API_URL ??
        "https://api.ponti.io",
    });
    return user?.id ? { id: user.id, email: user.email ?? null } : null;
  } catch {
    return null;
  }
}

export function loginUrl(request: Request, requestedReturnTo?: string): string {
  const appOrigin = new URL(WhatServerEnv.parse(process.env).WHAT_APP_URL);
  let returnTo = new URL(appOrigin);
  try {
    const candidate = new URL(requestedReturnTo ?? request.url);
    returnTo.pathname = candidate.pathname.replace(/\.data$/, "") || "/";
    const search = new URLSearchParams(candidate.search);
    search.delete("tz");
    returnTo.search = search.toString() ? `?${search.toString()}` : "";
    returnTo.hash = candidate.hash;
  } catch {
    returnTo.pathname = "/";
  }
  const url = new URL("/login", process.env.HOMINEM_API_URL ?? "https://api.ponti.io");
  url.searchParams.set("next", returnTo.toString());
  return url.toString();
}
