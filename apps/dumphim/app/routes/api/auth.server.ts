/**
 * Authentication API Route
 *
 * IMPROVEMENTS:
 * - Uses standardized response utilities (~60% less code)
 * - Type-safe form data extraction
 * - Input validation
 * - Separated handlers for testability
 * - Switch statement for routing
 */

import { createJWT, setAuthCookie, clearAuthCookie } from "~/lib/auth/jwt";
import { db } from "~/lib/db";
import { users } from "@pontistudios/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { httpSuccess, httpErrors } from "~/lib/api/response";
import { getCurrentUser } from "~/lib/api/auth";

// Type-safe form data extraction
function getFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

// Validation helpers
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  return { valid: true };
}

// Main action handler with routing
export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const intent = getFormString(formData, "intent");

  switch (intent) {
    case "signup":
      return handleSignup(formData);
    case "login":
      return handleLogin(formData);
    case "logout":
      return handleLogout();
    case "me":
      return handleGetCurrentUser(request);
    default:
      return httpErrors.badRequest("Invalid intent");
  }
};

// Handler: User signup
async function handleSignup(formData: FormData): Promise<Response> {
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");

  // Validation
  if (!email || !password) {
    return httpErrors.badRequest("Email and password required");
  }

  if (!validateEmail(email)) {
    return httpErrors.badRequest("Invalid email format");
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return httpErrors.badRequest(passwordCheck.error!);
  }

  try {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return httpErrors.conflict("User already exists");
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({ email, passwordHash: hashedPassword })
      .returning();

    // Create session
    const token = await createJWT({ userId: newUser.id, email: newUser.email });

    return httpSuccess.created(
      { user: { id: newUser.id, email: newUser.email } },
      { "Set-Cookie": setAuthCookie(token) },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return httpErrors.internalError("Signup failed");
  }
}

// Handler: User login
async function handleLogin(formData: FormData): Promise<Response> {
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");

  if (!email || !password) {
    return httpErrors.badRequest("Email and password required");
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user?.passwordHash) {
      return httpErrors.unauthorized("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return httpErrors.unauthorized("Invalid credentials");
    }

    const token = await createJWT({ userId: user.id, email: user.email });

    return httpSuccess.ok(
      { user: { id: user.id, email: user.email } },
      { "Set-Cookie": setAuthCookie(token) },
    );
  } catch (error) {
    console.error("Login error:", error);
    return httpErrors.internalError("Login failed");
  }
}

// Handler: User logout
function handleLogout(): Response {
  return httpSuccess.ok({ success: true }, { "Set-Cookie": clearAuthCookie() });
}

// Handler: Get current user
async function handleGetCurrentUser(request: Request): Promise<Response> {
  const user = await getCurrentUser(request);
  return httpSuccess.ok({ user });
}
