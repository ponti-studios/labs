/**
 * Better-Auth Server-side utilities
 * 
 * These utilities help validate sessions on the server
 * by querying the Hominem auth server at localhost:4040
 */

const AUTH_SERVER_URL = process.env.BETTER_AUTH_URL || "http://localhost:4040";

export interface UserSession {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

/**
 * Extract session token from request cookies
 */
export function extractSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  // Look for better-auth session cookie (usually starts with better-auth or contains session token)
  const sessionCookie = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("better-auth.session=") || c.trim().startsWith("auth="));

  return sessionCookie?.split("=")[1] ?? null;
}

/**
 * Validate session with the auth server
 */
export async function validateSession(token: string): Promise<UserSession | null> {
  try {
    const response = await fetch(`${AUTH_SERVER_URL}/api/auth/session`, {
      headers: {
        Cookie: `better-auth.session=${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request: Request): Promise<UserSession | null> {
  const token = extractSessionToken(request);
  if (!token) return null;

  return validateSession(token);
}

/**
 * Middleware to authenticate requests
 * Returns user payload if authenticated, null otherwise
 */
export async function authenticateRequest(request: Request): Promise<UserSession | null> {
  return getCurrentUser(request);
}

/**
 * Higher-order function for protected route handlers
 * Automatically checks authentication and passes user to handler
 */
export function withAuth<T extends { request: Request }>(
  handler: (args: T & { user: UserSession }) => Promise<Response>,
): (args: T) => Promise<Response> {
  return async (args) => {
    const user = await authenticateRequest(args.request);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return handler({ ...args, user });
  };
}
