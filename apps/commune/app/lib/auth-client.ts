import { createAuthClient } from "better-auth/react";

const AUTH_BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:4040";

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  basePath: "/api/auth",
});

// Export convenience hooks and methods
export const { signIn, signUp, signOut, useSession } = authClient;
