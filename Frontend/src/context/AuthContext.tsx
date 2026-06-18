import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi } from "../lib/auth";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      const response = await authApi.get("/auth/me");
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("User is not authenticated (No active session found).");
      }
      // Attempt token refresh if available
      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (storedRefreshToken) {
          const res = await authApi.post("/auth/refresh", { refreshToken: storedRefreshToken });
          if (res.data.success) {
            localStorage.setItem("accessToken", res.data.data.accessToken);
            localStorage.setItem("refreshToken", res.data.data.refreshToken);
            const meRes = await authApi.get("/auth/me");
            if (meRes.data.success) {
              setUser(meRes.data.data);
            }
          }
        }
      } catch (refreshErr) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.post("/auth/login", { email, password });
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setUser(user);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const signup = async (email: string, name: string, password: string) => {
    try {
      // Split full name into first name and last name
      const [firstName = "", ...lastNameParts] = name.trim().split(" ");
      const lastName = lastNameParts.join(" ") || ".";

      const response = await authApi.post("/auth/signup", {
        email,
        password,
        firstName,
        lastName,
      });

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setUser(user);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.post("/auth/logout");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Logout request failed (session have already been cleared).");
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
