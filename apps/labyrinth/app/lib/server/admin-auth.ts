import { timingSafeEqual } from "node:crypto";

const REALM = "RealiTea Admin";

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run the comparison to avoid length-based timing leak
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Returns a 401 Response if the request lacks valid Basic Auth credentials,
 * or null if the request is authorized.
 *
 * Set ADMIN_SECRET in the environment. If unset the route is unreachable
 * (fails closed rather than open).
 *
 * Usage in a loader:
 *   const denied = requireAdminAuth(request);
 *   if (denied) return denied;
 */
export function requireAdminAuth(request: Request): Response | null {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return new Response("Admin access not configured — set ADMIN_SECRET", { status: 503 });
  }

  const auth = request.headers.get("Authorization") ?? "";
  const spaceIdx = auth.indexOf(" ");
  const scheme = spaceIdx === -1 ? auth : auth.slice(0, spaceIdx);
  const credentials = spaceIdx === -1 ? "" : auth.slice(spaceIdx + 1);

  if (scheme !== "Basic" || !credentials) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": `Basic realm="${REALM}"` },
    });
  }

  const decoded = Buffer.from(credentials, "base64").toString("utf-8");
  const colonIdx = decoded.indexOf(":");
  const password = colonIdx === -1 ? decoded : decoded.slice(colonIdx + 1);

  if (!constantTimeEqual(password, adminSecret)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": `Basic realm="${REALM}"` },
    });
  }

  return null;
}
