import { redirect } from "react-router";

import { requireAdminAuth } from "~/lib/server/admin-auth";
import { buildHominemLoginUrl, getHominemUser, type HominemUser } from "~/lib/server/hominem-auth";

export type RealiteaAdminActor = {
  user: HominemUser;
};

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
    return { user: user ?? { id: "local-dev", email: "dev@localhost" } };
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
    throw new Response("Admin allowlist not configured — set REALITEA_ADMIN_EMAILS", { status: 503 });
  }
  if (allowlist) {
    const email = user.email?.trim().toLowerCase();
    if (!email || !allowlist.includes(email)) {
      throw new Response("Forbidden", { status: 403 });
    }
  }

  return { user };
}
