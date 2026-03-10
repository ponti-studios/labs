/**
 * Authentication Middleware & Utilities
 * Centralized auth handling for API routes
 */

import { verifyJWT, type UserJWTPayload } from "~/lib/auth/jwt";
import { errorResponse } from "./response";

export interface AuthenticatedRequest {
  request: Request;
  user: UserJWTPayload;
}

/**
 * Extract JWT token from request cookies
 */
export function extractAuthToken(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const authCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("auth="));

  return authCookie?.split("=")[1] ?? null;
}

/**
 * Middleware to authenticate requests
 * Returns user payload if authenticated, null otherwise
 */
export async function authenticateRequest(request: Request): Promise<UserJWTPayload | null> {
  const token = extractAuthToken(request);
  if (!token) return null;

  return verifyJWT(token);
}

/**
 * Higher-order function for protected route handlers
 * Automatically checks authentication and passes user to handler
 */
export function withAuth(
  handler: (args: { request: Request; user: UserJWTPayload }) => Promise<Response>,
): (args: { request: Request }) => Promise<Response> {
  return async ({ request }) => {
    const user = await authenticateRequest(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    return handler({ request, user });
  };
}

/**
 * Get current user from request (optional auth)
 * Returns user if authenticated, null otherwise (doesn't reject)
 */
export async function getCurrentUser(request: Request): Promise<UserJWTPayload | null> {
  return authenticateRequest(request);
}
