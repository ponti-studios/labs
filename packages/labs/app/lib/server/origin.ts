/** Same-origin gate for mutating first-party routes. Missing Origin is a 403. */
export function assertSameOrigin(request: Request): Response | null {
  const origin = request.headers.get("Origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
