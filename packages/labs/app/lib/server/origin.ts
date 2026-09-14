function firstForwardedValue(request: Request, name: string): string | null {
  const value = request.headers.get(name);
  if (!value) return null;
  const first = value
    .split(",")
    .map((entry) => entry.trim())
    .find((entry) => entry.length > 0);
  return first ? first.toLowerCase() : null;
}

/**
 * CSRF guard for mutating first-party routes on resource routes (e.g. the
 * `api.gen.*` actions, which have no component export). React Router's built-in
 * origin check only runs for UI-route submissions (data + document requests);
 * it explicitly does not apply to resource routes, so routes that are mutated
 * via raw `fetch` need their own guard.
 *
 * A browser POST must carry an `Origin` header whose scheme+host match the
 * origin it was sent to. Behind a TLS-terminating reverse proxy (Railway,
 * Cloudflare) the origin server sees plain HTTP, so the scheme inside
 * `request.url` differs from the `https://` Origin the browser actually sent.
 * Rebuild the externally visible origin from the `x-forwarded-proto` /
 * `x-forwarded-host` headers the proxy appended before comparing. Those are
 * browser-forbidden headers, so a page cannot spoof them; missing Origin or a
 * sister-origin request is still a 403.
 */
export function assertSameOrigin(request: Request): Response | null {
  const origin = request.headers.get("Origin");
  if (!origin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const scheme = firstForwardedValue(request, "x-forwarded-proto") ?? url.protocol.slice(0, -1);
  const host = firstForwardedValue(request, "x-forwarded-host") ?? url.host;
  return origin === `${scheme}://${host}`
    ? null
    : Response.json({ error: "Forbidden" }, { status: 403 });
}
