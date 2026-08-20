export function assertSameOrigin(request: Request): Response | null {
  const origin = request.headers.get("Origin");
  return !origin || origin !== new URL(request.url).origin
    ? Response.json({ error: "Forbidden" }, { status: 403 })
    : null;
}
