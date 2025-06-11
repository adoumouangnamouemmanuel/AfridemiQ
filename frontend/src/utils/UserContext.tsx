"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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
  subjects?: string[];
  learningStyle?: string;
  isPremium: boolean;
  role: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  handleTokenExpiration: () => void;
  refreshUserSession: () => void;
  gracefulLogout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh user session - memoized to prevent recreations
  const refreshUserSession = React.useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      const { authService } = await import("../services/auth.service");
      const { apiService } = await import("../services/api.service");

      const authData = await authService.getAuthData();

      if (authData.refreshToken) {
        const response = await apiService.refreshToken({
          refreshToken: authData.refreshToken,
        });

        // Update stored token
        await AsyncStorage.setItem("token", response.token);
        setToken(response.token);

        console.log("Token refreshed successfully");
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      // Don't log out user immediately, let them continue and handle on next API call
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Load user data on app start - memoized and simplified
  const loadUserData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { authService } = await import("../services/auth.service");
      const { apiService } = await import("../services/api.service");

      const authData = await authService.getAuthData();

      if (authData.user && authData.token) {
        setUser(authData.user);
        setToken(authData.token);

        // Try to refresh token if it's close to expiring
        try {
          const isAuthenticated = await apiService.isAuthenticated();
          if (!isAuthenticated) {
            // Token might be expired, try to refresh
            console.log("Token validation failed, attempting refresh...");
            const refreshed = await apiService.silentRefresh();
            if (refreshed) {
              console.log("Token refreshed successfully on startup");
            }
          }
        } catch (error) {
          console.log(
            "Token validation failed, but keeping user logged in:",
            error
          );
          // Keep user logged in even if token validation fails
          // The API service will handle refresh automatically on next request
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies to prevent infinite loop

  // Handle token expiration gracefully
  const handleTokenExpiration = React.useCallback(async () => {
    try {
      console.log("Handling token expiration...");

      // First try to refresh the token
      await refreshUserSession();

      // If refresh fails, the user will be logged out
      // but only after they try to make an authenticated request
    } catch (error) {
      console.error("Error handling token expiration:", error);
      // Only clear auth data if refresh completely fails
      // and we're sure the user should be logged out
    }
  }, [refreshUserSession]);

  // Graceful logout that doesn't disrupt user experience
  const gracefulLogout = React.useCallback(async () => {
    try {
      const { authService } = await import("../services/auth.service");

      await authService.clearAuthData();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Error during graceful logout:", error);
    }
  }, []);

  // Load user data on app start - only once
  useEffect(() => {
    loadUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  // Set up periodic token refresh (every 50 minutes)
  useEffect(() => {
    if (user && token) {
      const refreshInterval = setInterval(() => {
        refreshUserSession();
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

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
