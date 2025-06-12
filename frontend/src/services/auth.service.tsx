import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService, type AuthResponse } from "./api.service";

// User interface aligned with api.service.tsx
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

/**
 * Enhanced authentication service with comprehensive logging and reliability improvements.
 */
class AuthService {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly STORAGE_KEYS = {
    USER: "user",
    TOKEN: "token",
    REFRESH_TOKEN: "refreshToken",
    LAST_REFRESH: "lastTokenRefresh",
    SESSION_ID: "sessionId",
  };

  /**
   * Stores authentication data with comprehensive logging.
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
   * Clears authentication data with retry logic.
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

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  /**
   * Retrieves stored authentication data with validation.
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
   * Transforms backend user data to frontend format.
   */
  transformUserData(backendUser: AuthResponse["user"]): User {
    // TODO: Remove detailed logging before production
    console.log("🔄 TRANSFORM: Converting backend user data");
    console.log("🔄 TRANSFORM: Backend user ID:", backendUser._id);
    console.log("🔄 TRANSFORM: Backend user email:", backendUser.email);

    const transformedUser = {
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
      role: backendUser.role ?? "user",
    };

    // TODO: Remove detailed logging before production
    console.log("✅ TRANSFORM: User data transformed successfully");
    return transformedUser;
  }

  /**
   * Restores user session with comprehensive validation and retry logic.
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
   * Checks if the user session is healthy.
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
        //TODO: Remove detailed logging before production
        console.log("🔄 HEALTH: Token invalid, attempting refresh");
        const refreshed = await apiService.silentRefresh();
        if (refreshed) {
          //TODO: Remove detailed logging before production
          console.log("✅ HEALTH: Refresh successful, session healthy");
          return true;
        }
        //TODO: Remove detailed logging before production
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
   * Forces a complete session refresh.
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
export type { User };
