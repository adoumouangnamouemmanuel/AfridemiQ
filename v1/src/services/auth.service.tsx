/**
 * @file Authentication Service
 * @description Manages authentication state, token storage, and session management
 * @module services/auth.service
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "./api.service";
import type { User, AuthResponse } from "../types/user/user.types";

/**
 * @class AuthService
 * @description Enhanced authentication service with comprehensive logging and reliability improvements
 */
class AuthService {
  /**
   * Maximum number of retry attempts for critical operations
   * @private
   * @readonly
   */
  private readonly MAX_RETRY_ATTEMPTS = 3;

  /**
   * Storage keys for authentication data
   * @private
   * @readonly
   */
  private readonly STORAGE_KEYS = {
    USER: "user",
    TOKEN: "token",
    REFRESH_TOKEN: "refreshToken",
    LAST_REFRESH: "lastTokenRefresh",
    SESSION_ID: "sessionId",
  } as const;

  /**
   * Stores authentication data with comprehensive logging
   * @param user - User object to store
   * @param token - Authentication token
   * @param refreshToken - Refresh token (optional)
   * @returns Promise that resolves when storage is complete
   * @throws {Error} When unable to save authentication data
   */
  async storeAuthData(
    user: User,
    token: string,
    refreshToken?: string
  ): Promise<void> {
    try {
      // TODO: Remove detailed logging before production
      console.log("💾 STORAGE: Storing auth data for user:", user.email);
      console.log("💾 STORAGE: Token length:", token.length);
      console.log("💾 STORAGE: Has refresh token:", !!refreshToken);

      const sessionId = Date.now().toString();
      const promises = [
        AsyncStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user)),
        AsyncStorage.setItem(this.STORAGE_KEYS.TOKEN, token),
        AsyncStorage.setItem(this.STORAGE_KEYS.SESSION_ID, sessionId),
        AsyncStorage.setItem(
          this.STORAGE_KEYS.LAST_REFRESH,
          Date.now().toString()
        ),
      ];

      if (refreshToken) {
        promises.push(
          AsyncStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        );
      }

      await Promise.all(promises);

      // TODO: Remove detailed logging before production
      console.log("✅ STORAGE: Auth data stored successfully");
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("❌ STORAGE: Failed to store auth data:", error);
      throw new Error("Unable to save authentication data");
    }
  }

  /**
   * Clears authentication data with retry logic
   * @returns Promise that resolves when data is cleared
   * @throws {Error} When unable to clear authentication data after max retries
   */
  async clearAuthData(): Promise<void> {
    let attempts = 0;

    while (attempts < this.MAX_RETRY_ATTEMPTS) {
      try {
        // TODO: Remove detailed logging before production
        console.log(`🗑️ STORAGE: Clearing auth data (attempt ${attempts + 1})`);

        await AsyncStorage.multiRemove([
          this.STORAGE_KEYS.USER,
          this.STORAGE_KEYS.TOKEN,
          this.STORAGE_KEYS.REFRESH_TOKEN,
          this.STORAGE_KEYS.LAST_REFRESH,
          this.STORAGE_KEYS.SESSION_ID,
        ]);

        // TODO: Remove detailed logging before production
        console.log("✅ STORAGE: Auth data cleared successfully");
        return;
      } catch (error) {
        attempts++;
        // TODO: Remove detailed logging before production
        console.error(
          `❌ STORAGE: Failed to clear auth data (attempt ${attempts}):`,
          error
        );

        if (attempts >= this.MAX_RETRY_ATTEMPTS) {
          throw new Error("Unable to clear authentication data");
        }

        // Wait before retry with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  /**
   * Retrieves stored authentication data with validation
   * @returns Promise resolving to authentication data or null values if not found
   */
  async getAuthData(): Promise<{
    user: User | null;
    token: string | null;
    refreshToken: string | null;
  }> {
    try {
      // TODO: Remove detailed logging before production
      console.log("📖 STORAGE: Retrieving auth data");

      const [userString, token, refreshToken, lastRefresh, sessionId] =
        await AsyncStorage.multiGet([
          this.STORAGE_KEYS.USER,
          this.STORAGE_KEYS.TOKEN,
          this.STORAGE_KEYS.REFRESH_TOKEN,
          this.STORAGE_KEYS.LAST_REFRESH,
          this.STORAGE_KEYS.SESSION_ID,
        ]);

      const user = userString[1] ? JSON.parse(userString[1]) : null;

      // TODO: Remove detailed logging before production
      console.log("📖 STORAGE: Found user:", !!user);
      console.log("📖 STORAGE: Found token:", !!token[1]);
      console.log("📖 STORAGE: Found refresh token:", !!refreshToken[1]);
      console.log("📖 STORAGE: Session ID:", sessionId[1]);
      console.log(
        "📖 STORAGE: Last refresh:",
        lastRefresh[1]
          ? new Date(Number.parseInt(lastRefresh[1])).toISOString()
          : "Never"
      );

      return {
        user,
        token: token[1],
        refreshToken: refreshToken[1],
      };
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("❌ STORAGE: Failed to get auth data:", error);
      return { user: null, token: null, refreshToken: null };
    }
  }

  /**
   * Transforms backend user data to frontend format with validation
   * @param backendUser - User data from backend API
   * @returns Transformed user object for frontend use
   */
  transformUserData(backendUser: AuthResponse["user"]): User {
    // TODO: Remove detailed logging before production
    console.log("🔄 TRANSFORM: Converting backend user data");
    console.log("🔄 TRANSFORM: Backend user ID:", backendUser._id);
    console.log("🔄 TRANSFORM: Backend user email:", backendUser.email);

    const transformedUser: User = {
      id: backendUser._id,
      name: backendUser.name,
      email: backendUser.email,
      country: backendUser.country,
      selectedExam: backendUser.progress?.selectedExam ?? "",
      goalDate: backendUser.progress?.goalDate
        ? new Date(backendUser.progress.goalDate)
        : undefined,
      xp: backendUser.progress?.xp ?? 0,
      level: backendUser.progress?.level ?? 1,
      streak: backendUser.progress?.streak?.current ?? 0,
      avatar: backendUser.avatar,
      badges: backendUser.progress?.badges ?? [],
      completedTopics: backendUser.progress?.completedTopics ?? [],
      weakSubjects: backendUser.progress?.weakSubjects ?? [],
      isPremium: backendUser.isPremium ?? false,
      role: (backendUser.role as User["role"]) ?? "student",
    };

    // TODO: Remove detailed logging before production
    console.log("✅ TRANSFORM: User data transformed successfully");
    return transformedUser;
  }

  /**
   * Restores user session with comprehensive validation and retry logic
   * @returns Promise resolving to session data or null values if restoration fails
   */
  async restoreSession(): Promise<{
    user: User | null;
    token: string | null;
    refreshToken: string | null;
  }> {
    try {
      // TODO: Remove detailed logging before production
      console.log("🔄 SESSION: Starting session restoration");

      const authData = await this.getAuthData();

      if (!authData.user || !authData.token || !authData.refreshToken) {
        // TODO: Remove detailed logging before production
        console.log("❌ SESSION: Incomplete auth data found");
        console.log("❌ SESSION: User:", !!authData.user);
        console.log("❌ SESSION: Token:", !!authData.token);
        console.log("❌ SESSION: Refresh token:", !!authData.refreshToken);
        return { user: null, token: null, refreshToken: null };
      }

      // TODO: Remove detailed logging before production
      console.log("🔍 SESSION: Validating token");

      // Check if token is still valid
      const isValid = await apiService.checkTokenValidity();

      if (!isValid) {
        // TODO: Remove detailed logging before production
        console.log("🔄 SESSION: Token invalid, attempting refresh");

        let refreshAttempts = 0;
        const maxRefreshAttempts = 3;

        while (refreshAttempts < maxRefreshAttempts) {
          try {
            // TODO: Remove detailed logging before production
            console.log(
              `🔄 SESSION: Refresh attempt ${
                refreshAttempts + 1
              }/${maxRefreshAttempts}`
            );

            const refreshed = await apiService.silentRefresh();

            if (refreshed) {
              // TODO: Remove detailed logging before production
              console.log("✅ SESSION: Token refreshed successfully");

              const newToken = await AsyncStorage.getItem(
                this.STORAGE_KEYS.TOKEN
              );
              await AsyncStorage.setItem(
                this.STORAGE_KEYS.LAST_REFRESH,
                Date.now().toString()
              );

              return { ...authData, token: newToken };
            }

            refreshAttempts++;

            if (refreshAttempts < maxRefreshAttempts) {
              // TODO: Remove detailed logging before production
              console.log(
                `⏳ SESSION: Waiting before retry attempt ${
                  refreshAttempts + 1
                }`
              );
              await new Promise((resolve) =>
                setTimeout(resolve, 2000 * refreshAttempts)
              );
            }
          } catch (refreshError) {
            refreshAttempts++;
            // TODO: Remove detailed logging before production
            console.error(
              `❌ SESSION: Refresh attempt ${refreshAttempts} failed:`,
              refreshError
            );

            if (refreshAttempts >= maxRefreshAttempts) {
              break;
            }
          }
        }

        // TODO: Remove detailed logging before production
        console.log(
          "❌ SESSION: All refresh attempts failed, clearing session"
        );
        await this.clearAuthData();
        return { user: null, token: null, refreshToken: null };
      }

      // TODO: Remove detailed logging before production
      console.log("✅ SESSION: Session restored successfully");
      return authData;
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("❌ SESSION: Session restoration failed:", error);
      await this.clearAuthData();
      return { user: null, token: null, refreshToken: null };
    }
  }

  /**
   * Checks if the user session is healthy
   * @returns Promise resolving to boolean indicating session health
   */
  async isSessionHealthy(): Promise<boolean> {
    try {
      // TODO: Remove detailed logging before production
      console.log("🏥 HEALTH: Checking session health");

      const authData = await this.getAuthData();

      if (!authData.user || !authData.token || !authData.refreshToken) {
        // TODO: Remove detailed logging before production
        console.log("❌ HEALTH: Session unhealthy - missing data");
        return false;
      }

      const isValid = await apiService.checkTokenValidity();

      // TODO: Remove detailed logging before production
      console.log("🏥 HEALTH: Token validity:", isValid);

      if (!isValid) {
        // Try refresh before declaring unhealthy
        // TODO: Remove detailed logging before production
        console.log("🔄 HEALTH: Token invalid, attempting refresh");
        const refreshed = await apiService.silentRefresh();
        if (refreshed) {
          // TODO: Remove detailed logging before production
          console.log("✅ HEALTH: Refresh successful, session healthy");
          return true;
        }
        // TODO: Remove detailed logging before production
        console.log("❌ HEALTH: Refresh failed, session unhealthy");
      }

      return isValid;
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("❌ HEALTH: Health check failed:", error);
      return false;
    }
  }

  /**
   * Forces a complete session refresh
   * @returns Promise resolving to boolean indicating refresh success
   */
  async forceSessionRefresh(): Promise<boolean> {
    try {
      // TODO: Remove detailed logging before production
      console.log("🔄 FORCE: Starting forced session refresh");

      const refreshed = await apiService.silentRefresh();

      if (refreshed) {
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.LAST_REFRESH,
          Date.now().toString()
        );
        // TODO: Remove detailed logging before production
        console.log("✅ FORCE: Forced refresh successful");
        return true;
      }

      // TODO: Remove detailed logging before production
      console.log("❌ FORCE: Forced refresh failed");
      return false;
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("❌ FORCE: Forced refresh error:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
