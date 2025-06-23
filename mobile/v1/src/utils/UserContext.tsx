"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { authService } from "../services/auth.service";
import { apiService } from "../services/api.service";
import type { User, UserContextType } from "../types/user/user.types";

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Enhanced user provider with stable interval management.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionHealthy, setIsSessionHealthy] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Use refs to maintain stable references for intervals
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userRef = useRef<User | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Update refs when state changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  /**
   * Refreshes user session with comprehensive error handling.
   */
  const refreshUserSession = useCallback(async () => {
    try {
      // TODO: Remove detailed logging before production
      console.log("🔄 CONTEXT: Starting session refresh");

      const isValid = await apiService.checkTokenValidity();

      if (!isValid) {
        // TODO: Remove detailed logging before production
        console.log("🔄 CONTEXT: Token invalid, attempting refresh");

        const refreshed = await apiService.silentRefresh();

        if (refreshed) {
          const newToken = await AsyncStorage.getItem("token");
          if (newToken && newToken !== tokenRef.current) {
            setToken(newToken);
          }
          setLastRefreshTime(new Date());
          // TODO: Remove detailed logging before production
          console.log("✅ CONTEXT: Token updated successfully");
          setIsSessionHealthy(true);
        } else {
          throw new Error("Token refresh failed");
        }
      } else {
        setIsSessionHealthy(true);
        // TODO: Remove detailed logging before production
        console.log("✅ CONTEXT: Session is healthy");
      }
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("❌ CONTEXT: Session refresh failed:", error);
      setIsSessionHealthy(false);
      throw new Error("Unable to refresh session");
    }
  }, []);

  /**
   * Loads user data with retry logic.
   */
  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Remove detailed logging before production
      console.log("📖 CONTEXT: Loading user data");

      const authData = await authService.restoreSession();

      if (authData.user && authData.token) {
        // FIXED: Check if user already has 'id' field, if not transform it
        let transformedUser = authData.user;

        // If the user object has _id but no id, transform it
        if (!authData.user.id && (authData.user as any)._id) {
          console.log("🔄 CONTEXT: Transforming user data from _id to id");
          transformedUser = authService.transformUserData(authData.user as any);
        }

        setUser(transformedUser);
        setToken(authData.token);
        setIsSessionHealthy(true);

        // TODO: Remove detailed logging before production
        console.log("✅ CONTEXT: User data loaded successfully");
        console.log("✅ CONTEXT: User ID:", transformedUser.id);
        console.log("✅ CONTEXT: User email:", transformedUser.email);
      } else {
        // TODO: Remove detailed logging before production
        console.log("❌ CONTEXT: No valid session found");
        setIsSessionHealthy(false);
      }
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("❌ CONTEXT: Error loading user data:", error);
      setIsSessionHealthy(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles token expiration with multiple retry attempts.
   */
  const handleTokenExpiration = useCallback(async () => {
    try {
      // TODO: Remove detailed logging before production
      console.log("⚠️ CONTEXT: Handling token expiration");

      // Try multiple refresh attempts
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          await refreshUserSession();
          // TODO: Remove detailed logging before production
          console.log("✅ CONTEXT: Token expiration handled successfully");
          return;
        } catch (error) {
          attempts++;
          // TODO: Remove detailed logging before production
          console.error(
            `❌ CONTEXT: Refresh attempt ${attempts} failed:`,
            error
          );

          if (attempts < maxAttempts) {
            // Wait before retry with exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, attempts))
            );
          }
        }
      }

      // All attempts failed
      // TODO: Remove detailed logging before production
      console.log("❌ CONTEXT: All refresh attempts failed, logging out");
      await gracefulLogout();
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("❌ CONTEXT: Token expiration handling failed:", error);
      await gracefulLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshUserSession]);

  /**
   * Performs a graceful logout with cleanup.
   */
  const gracefulLogout = useCallback(async () => {
    try {
      // TODO: Remove detailed logging before production
      console.log("👋 CONTEXT: Starting graceful logout");

      // Clear interval before logout
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }

      await authService.clearAuthData();
      setUser(null);
      setToken(null);
      setIsSessionHealthy(false);
      setLastRefreshTime(null);

      // TODO: Remove detailed logging before production
      console.log("✅ CONTEXT: Graceful logout completed");
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("❌ CONTEXT: Graceful logout failed:", error);

      // Force clear even if there's an error
      setUser(null);
      setToken(null);
      setIsSessionHealthy(false);
      setLastRefreshTime(null);

      throw new Error("Unable to logout");
    }
  }, []);

  /**
   * Sets up stable session monitoring intervals.
   */
  const setupSessionMonitoring = useCallback(() => {
    // Clear existing interval
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
    }

    // TODO: Remove detailed logging before production
    console.log(
      "🔧 CONTEXT: Setting up combined session monitoring interval (5min)"
    );

    // Combined session health check and refresh every 5 minutes
    // For 10-minute token expiry during testing
    sessionCheckIntervalRef.current = setInterval(
      async () => {
        // Check if we still have a user and token
        if (!userRef.current || !tokenRef.current) {
          // TODO: Remove detailed logging before production
          console.log("⏭️ CONTEXT: No user/token, skipping health check");
          return;
        }

        try {
          // TODO: Remove detailed logging before production
          console.log("⏰ CONTEXT: Periodic session health check");

          const healthy = await authService.isSessionHealthy();
          setIsSessionHealthy(healthy);

          if (!healthy) {
            // TODO: Remove detailed logging before production
            console.log("⚠️ CONTEXT: Session unhealthy, attempting refresh");
            await refreshUserSession();
          } else {
            // TODO: Remove detailed logging before production
            console.log("✅ CONTEXT: Session is healthy, no refresh needed");
          }
        } catch (error) {
          // TODO: Remove detailed logging before production
          console.error("❌ CONTEXT: Session health check failed:", error);
          setIsSessionHealthy(false);
        }
      },
      5 * 60 * 1000 // 5 minutes
    );

    // TODO: Remove detailed logging before production
    console.log("✅ CONTEXT: Session monitoring interval established");
  }, [refreshUserSession]);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Set up session monitoring when user logs in (only once)
  useEffect(() => {
    if (user && token && !sessionCheckIntervalRef.current) {
      setupSessionMonitoring();
    } else if (!user || !token) {
      // Clear interval when user logs out
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
      // TODO: Remove detailed logging before production
      console.log("🛑 CONTEXT: Cleared session monitoring interval");
    }

    // Cleanup on unmount
    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token, setupSessionMonitoring]); // Only depend on user and token existence

  /**
   * Updates user progress after quiz completion
   */
  const updateUserProgress = useCallback(
    async (quizResult: {
      score: number;
      totalQuestions: number;
      correctAnswers: number;
    }) => {
      try {
        console.log("📊 CONTEXT: Updating user progress after quiz completion");

        if (!user) {
          console.warn("⚠️ CONTEXT: No user found, cannot update progress");
          return;
        }

        // Calculate new progress
        const currentProgress = user.progress;
        const newTotalQuizzes = currentProgress.totalQuizzesTaken + 1;
        const newTotalQuestions =
          currentProgress.totalQuestionsAnswered + quizResult.totalQuestions;

        // Calculate new average score
        const totalPreviousScore =
          currentProgress.averageScore * currentProgress.totalQuizzesTaken;
        const newAverageScore = Math.round(
          (totalPreviousScore + quizResult.score) / newTotalQuizzes
        );

        const updatedProgress = {
          totalQuizzesTaken: newTotalQuizzes,
          totalQuestionsAnswered: newTotalQuestions,
          averageScore: newAverageScore,
        };

        // Update user object
        const updatedUser = {
          ...user,
          progress: updatedProgress,
        };

        // Update state
        setUser(updatedUser);

        // Update stored user data
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

        console.log("✅ CONTEXT: User progress updated successfully", {
          oldProgress: currentProgress,
          newProgress: updatedProgress,
        });
      } catch (error) {
        console.error("❌ CONTEXT: Failed to update user progress:", error);
      }
    },
    [user]
  );

  const value: UserContextType = {
    user,
    token,
    isLoading,
    isSessionHealthy,
    lastRefreshTime,
    setUser,
    setToken,
    handleTokenExpiration,
    refreshUserSession,
    gracefulLogout,
    updateUserProgress,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook to access enhanced user context.
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
