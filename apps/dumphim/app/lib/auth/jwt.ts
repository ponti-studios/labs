import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const secret = new TextEncoder().encode(JWT_SECRET);

export interface UserJWTPayload {
  userId: string;
  email: string;
}

export async function createJWT(payload: UserJWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<UserJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string): string {
  return `auth=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
}

export function clearAuthCookie(): string {
  return `auth=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}
