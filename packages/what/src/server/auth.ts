import { getServerAuth } from "@ponti-studios/auth/server";

import { WhatServerEnv } from "../lib/infrastructure/env";

export type GameUser = { id: string; email?: string | null };

const DEFAULT_HOMINEM_API_URL = "https://api.lvh.me";

export async function getGameUser(request: Request): Promise<GameUser | null> {
  try {
    const { user } = await getServerAuth(request, {
      apiBaseUrl: getHominemApiUrl({ allowInternal: true }),
    });
    return user?.id ? { id: user.id, email: user.email ?? null } : null;
  } catch {
    return null;
  }
}

export function loginUrl(request: Request, requestedReturnTo?: string): string {
  const { PORTLESS_URL, WHAT_APP_URL } = WhatServerEnv.parse(process.env);
  const requestOrigin = new URL(request.url);
  const appOrigin = isLoopbackHostname(requestOrigin.hostname)
    ? requestOrigin
    : new URL(PORTLESS_URL ?? WHAT_APP_URL);
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

  const url = new URL("/login", getHominemApiUrl());
  url.searchParams.set("next", returnTo.toString());
  return url.toString();
}

function getHominemApiUrl(options: { allowInternal?: boolean } = {}): string {
  const configured = options.allowInternal
    ? (process.env.HOMINEM_INTERNAL_API_URL ?? process.env.HOMINEM_API_URL)
    : process.env.HOMINEM_API_URL;

  if (
    process.env.NODE_ENV === "development" &&
    configured &&
    isLoopbackHostname(new URL(configured).hostname)
  ) {
    return DEFAULT_HOMINEM_API_URL;
  }

  return configured ?? DEFAULT_HOMINEM_API_URL;
}

function isLoopbackHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}
