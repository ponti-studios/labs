import type { ReactNode } from "react";
interface User {
  id: string;
  email: string;
}
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null;
  }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
}
export declare const AuthProvider: ({
  children,
}: {
  children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useAuth: () => AuthContextType;
export {};
//# sourceMappingURL=AuthProvider.d.ts.map
