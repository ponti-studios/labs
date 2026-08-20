import { getServerAuth } from "@ponti-studios/auth/server";

export type WhatUser = { id: string; email?: string | null };

export async function getWhatUser(request: Request): Promise<WhatUser | null> {
  try {
    const { user } = await getServerAuth(request, {
      apiBaseUrl:
        process.env.HOMINEM_INTERNAL_API_URL ?? process.env.HOMINEM_API_URL ?? "https://api.ponti.io",
    });
    return user?.id ? { id: user.id, email: user.email ?? null } : null;
  } catch {
    return null;
  }
}

export function loginUrl(request: Request, requestedReturnTo?: string): string {
  const appOrigin = new URL(process.env.WHAT_URL ?? new URL(request.url).origin);
  let returnTo = new URL(appOrigin);
  try {
    const candidate = new URL(requestedReturnTo ?? request.url);
    returnTo.pathname = candidate.pathname;
    returnTo.search = candidate.search;
    returnTo.hash = candidate.hash;
  } catch {
    returnTo.pathname = "/";
  }
  const url = new URL("/login", process.env.HOMINEM_API_URL ?? "https://api.ponti.io");
  url.searchParams.set("next", returnTo.toString());
  return url.toString();
}
