/**
 * Hominem's redirect policy only trusts LABS_URL's own origin (see
 * docs/hominem-auth-integration.md, task 3), so the return URL must
 * round-trip through https even if the request reaches this server over
 * plain http behind Railway's proxy. Shared by every RealiTea route that
 * builds a Hominem login URL.
 */
export function resolveReturnTo(request: Request): string {
  const url = new URL(request.url);
  if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    url.protocol = "https:";
  }
  // React Router's client-side revalidation fetches a route's loader via a
  // "<path>.data" endpoint, which would otherwise leak into the login
  // redirect and send the player back to a JSON response instead of the
  // page.
  if (url.pathname.endsWith(".data")) {
    url.pathname = url.pathname.slice(0, -".data".length);
  }
  url.search = "";
  url.hash = "";
  return url.toString();
}
