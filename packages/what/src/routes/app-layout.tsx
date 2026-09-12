import {
  isRouteErrorResponse,
  Link,
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";

import { WhatNavigation } from "~/components/layout/what-navigation";
import { canAccessGameAdmin } from "~/lib/admin/auth";
import { getActiveGames } from "~/lib/data/games.server";
import { getGameUser, loginUrl } from "~/server/auth";

import type { Route } from "./+types/app-layout";

export async function loader({ request }: LoaderFunctionArgs) {
  const [user, games] = await Promise.all([
    getGameUser(request).catch(() => null),
    getActiveGames().catch(() => []),
  ]);

  return {
    games: games.map(({ slug, name }) => ({ slug, name })),
    signedIn: user !== null,
    canAccessAdmin: canAccessGameAdmin(user),
    loginUrl: loginUrl(request),
  };
}

export default function AppLayout() {
  const navigation = useLoaderData<typeof loader>();

  return (
    <>
      <WhatNavigation {...navigation} />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const navigation = useLoaderData<typeof loader>();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message = isRouteErrorResponse(error)
    ? typeof error.data === "string"
      ? error.data
      : error.statusText
    : "An unexpected error occurred.";

  return (
    <>
      <WhatNavigation {...navigation} />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-3 p-8 text-center">
        <p className="text-2xl font-semibold">{status}</p>
        <p className="text-muted-foreground text-sm">{message}</p>
        <Link className="text-accent-text text-sm underline underline-offset-4" to="/">
          Back home
        </Link>
      </main>
    </>
  );
}
