import { timingSafeEqual } from "node:crypto";

const REALM = "WH?T Admin";
function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function requireAdminAuth(request: Request): Response | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return new Response("Admin access not configured — set ADMIN_SECRET", { status: 503 });
  const auth = request.headers.get("Authorization") ?? "";
  const split = auth.indexOf(" ");
  const credentials = split === -1 ? "" : auth.slice(split + 1);
  if ((split === -1 ? auth : auth.slice(0, split)) !== "Basic" || !credentials) {
    return new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": `Basic realm="${REALM}"` } });
  }
  const decoded = Buffer.from(credentials, "base64").toString("utf8");
  const colon = decoded.indexOf(":");
  if (!equal(colon === -1 ? decoded : decoded.slice(colon + 1), secret)) {
    return new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": `Basic realm="${REALM}"` } });
  }
  return null;
}
