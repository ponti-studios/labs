import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append("intent", "login");
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch("/api/auth", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: new Error(data.error || "Login failed") };
      }

      const data = await response.json();
      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append("intent", "signup");
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch("/api/auth", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: new Error(data.error || "Signup failed") };
      }

      const data = await response.json();
      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      const formData = new FormData();
      formData.append("intent", "logout");

      await fetch("/api/auth", {
        method: "POST",
        body: formData,
      });

      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    isLoading,
    signInWithPassword,
    signUp,
    signOut,
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
