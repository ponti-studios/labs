import {
  createContext,
  redirect,
  type MiddlewareFunction,
  type RouterContextProvider,
} from "react-router";

import { requireAdminAuth } from "~/lib/server/admin-auth";
import { buildHominemLoginUrl, getHominemUser } from "~/lib/server/hominem-auth";

export type RealiteaAdminActor = {
  userId: string;
};

export const realiteaAdminActorContext = createContext<RealiteaAdminActor>();

function allowlistRequired() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.RAILWAY_ENVIRONMENT);
}

function parseAllowlist(): string[] | null {
  const raw = process.env.REALITEA_ADMIN_EMAILS;
  if (raw === undefined || raw.trim() === "") return null;
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}

function isLocalDev() {
  return process.env.NODE_ENV === "development" && !process.env.RAILWAY_ENVIRONMENT;
}

export async function requireRealiteaAdmin(
  request: Request,
  kind: "loader" | "action",
): Promise<RealiteaAdminActor> {
  if (isLocalDev()) {
    const user = await getHominemUser(request);
    return { userId: user?.id ?? "local-dev" };
  }

  const denied = requireAdminAuth(request);
  if (denied) throw denied;

  const user = await getHominemUser(request);
  const loginUrl = buildHominemLoginUrl(request.url);
  if (!user) {
    if (kind === "loader") throw redirect(loginUrl);
    throw Response.json({ error: "auth-required", loginUrl }, { status: 401 });
  }

  const allowlist = parseAllowlist();
  if (allowlistRequired() && allowlist === null) {
    throw new Response("Admin allowlist not configured — set REALITEA_ADMIN_EMAILS", {
      status: 503,
    });
  }
  if (allowlist) {
    const email = user.email?.trim().toLowerCase();
    if (!email || !allowlist.includes(email)) {
      throw new Response("Forbidden", { status: 403 });
    }
  }

  return { userId: user.id };
}

function requestKind(request: Request): "loader" | "action" {
  return request.method === "GET" || request.method === "HEAD" ? "loader" : "action";
}

/** Parent-route middleware: runs before child loaders/actions and short-circuits on deny. */
export const requireRealiteaAdminMiddleware: MiddlewareFunction = async ({ request, context }) => {
  const actor = await requireRealiteaAdmin(request, requestKind(request));
  context.set(realiteaAdminActorContext, actor);
};

export function getRealiteaAdminActor(
  context: Readonly<RouterContextProvider>,
): RealiteaAdminActor {
  return context.get(realiteaAdminActorContext);
}
