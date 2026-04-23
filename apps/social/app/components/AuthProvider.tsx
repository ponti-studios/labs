import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { signIn, signUp, signOut, useSession } from "~/lib/auth-client";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image || undefined,
      }
    : null;

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        return { error: new Error(result.error.message || "Login failed") };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const handleSignUp = async (email: string, password: string, name?: string) => {
    try {
      const result = await signUp.email({
        email,
        password,
        name: name || email.split("@")[0],
      });

      if (result.error) {
        return { error: new Error(result.error.message || "Signup failed") };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    isLoading: isPending,
    signInWithPassword,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
