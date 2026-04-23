/**
 * Better-Auth API Route Handler
 *
 * This route proxies all auth requests to the Hominem auth server
 * running at localhost:4040. The client-side better-auth client
 * makes requests to /api/auth/* which are forwarded to the auth server.
 */

const AUTH_SERVER_URL = process.env.BETTER_AUTH_URL || "http://localhost:4040";

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { [key: string]: string | undefined };
}) {
  const path = params["*"] || "";
  const targetUrl = new URL(`/api/auth/${path}`, AUTH_SERVER_URL);

  // Copy query parameters
  const url = new URL(request.url);
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  // Forward the request to the auth server
  const headers = new Headers(request.headers);
  headers.set("host", new URL(AUTH_SERVER_URL).host);

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });

    // Create response with CORS headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Credentials", "true");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Auth proxy error:", error);
    return new Response(JSON.stringify({ error: "Auth service unavailable" }), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

// Support all HTTP methods
export const loader = action;
