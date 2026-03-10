/**
 * Authentication Middleware & Utilities
 * Centralized auth handling for API routes
 */
import { type UserJWTPayload } from "~/lib/auth/jwt";
export interface AuthenticatedRequest {
  request: Request;
  user: UserJWTPayload;
}
/**
 * Extract JWT token from request cookies
 */
export declare function extractAuthToken(request: Request): string | null;
/**
 * Middleware to authenticate requests
 * Returns user payload if authenticated, null otherwise
 */
export declare function authenticateRequest(request: Request): Promise<UserJWTPayload | null>;
/**
 * Higher-order function for protected route handlers
 * Automatically checks authentication and passes user to handler
 */
export declare function withAuth<T>(
  handler: (args: { request: Request; user: UserJWTPayload }) => Promise<Response>,
): (args: { request: Request }) => Promise<Response>;
/**
 * Get current user from request (optional auth)
 * Returns user if authenticated, null otherwise (doesn't reject)
 */
export declare function getCurrentUser(request: Request): Promise<UserJWTPayload | null>;
//# sourceMappingURL=auth.d.ts.map
