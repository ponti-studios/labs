export interface UserJWTPayload {
  userId: string;
  email: string;
}
export declare function createJWT(payload: UserJWTPayload): Promise<string>;
export declare function verifyJWT(token: string): Promise<UserJWTPayload | null>;
export declare function setAuthCookie(token: string): string;
export declare function clearAuthCookie(): string;
//# sourceMappingURL=jwt.d.ts.map
