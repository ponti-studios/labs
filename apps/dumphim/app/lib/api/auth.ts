/**
 * Authentication Middleware & Utilities
 * Centralized auth handling for API routes
 * 
 * NOTE: Now uses better-auth via Hominem auth server at localhost:4040
 */

export { 
  getCurrentUser, 
  authenticateRequest, 
  withAuth, 
  type UserSession 
} from "~/lib/auth-server";
