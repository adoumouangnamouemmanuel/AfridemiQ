"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "../services/auth.service";
import { apiService } from "../services/api.service";

// User interface aligned with auth.service.tsx
interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  selectedExam?: string;
  goalDate?: Date;
  xp: number;
  level: number;
  streak: number;
  avatar?: string;
  badges: string[];
  completedTopics: string[];
  weakSubjects: string[];
  isPremium: boolean;
  role: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  handleTokenExpiration: () => Promise<void>;
  refreshUserSession: () => Promise<void>;
  gracefulLogout: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Provides user authentication state and methods.
 * @param children - Child components.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Refreshes user session by validating or refreshing token.
   */
  const refreshUserSession = React.useCallback(async () => {
    try {
      const isValid = await apiService.checkTokenValidity();
      if (!isValid) {
        const refreshed = await apiService.silentRefresh();
        if (refreshed) {
          const newToken = await AsyncStorage.getItem("token");
          if (newToken && newToken !== token) {
            setToken(newToken);
          }
        } else {
          throw new Error("Token refresh failed");
        }
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      throw new Error("Unable to refresh session");
    }
  }, [token]);

  /**
   * Loads user data on app start.
   */
  const loadUserData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const authData = await authService.restoreSession();
      if (authData.user && authData.token) {
        setUser(authData.user);
        setToken(authData.token);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles token expiration by attempting refresh.
   */
  const handleTokenExpiration = React.useCallback(async () => {
    try {
      await refreshUserSession();
    } catch (error) {
      console.error("Token expiration handling failed:", error);
      await gracefulLogout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshUserSession]);

  /**
   * Performs a graceful logout.
   */
  const gracefulLogout = React.useCallback(async () => {
    try {
      await authService.clearAuthData();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Graceful logout failed:", error);
      throw new Error("Unable to logout");
    }
  }, []);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Periodic token refresh (every 50 minutes) only when online
  useEffect(() => {
    if (user && token && navigator.onLine) {
      const refreshInterval = setInterval(() => {
        refreshUserSession().catch(console.error);
      }, 50 * 60 * 1000); // 50 minutes
      return () => clearInterval(refreshInterval);
    }
  }, [user, token, refreshUserSession]);

  const value: UserContextType = {
    user,
    token,
    isLoading,
    setUser,
    setToken,
    handleTokenExpiration,
    refreshUserSession,
    gracefulLogout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook to access user context.
 * @returns User context data and methods.
 * @throws Error if used outside UserProvider.
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
