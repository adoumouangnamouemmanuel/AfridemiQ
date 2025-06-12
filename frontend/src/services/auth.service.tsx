import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService, AuthResponse } from "./api.service";

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
 * Enhanced authentication service for managing auth state.
 */
class AuthService {
  /**
   * Stores authentication data in AsyncStorage.
   * @param user - User data to store.
   * @param token - Access token.
   * @param refreshToken - Optional refresh token.
   * @throws Error if storage fails.
   */
  async storeAuthData(
    user: User,
    token: string,
    refreshToken?: string
  ): Promise<void> {
    try {
      const promises = [
        AsyncStorage.setItem("user", JSON.stringify(user)),
        AsyncStorage.setItem("token", token),
      ];
      if (refreshToken) {
        promises.push(AsyncStorage.setItem("refreshToken", refreshToken));
      }
      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to store auth data:", error);
      throw new Error("Unable to save authentication data");
    }
  }

  /**
   * Clears all authentication data from AsyncStorage.
   * @throws Error if clearing fails.
   */
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(["user", "token", "refreshToken"]);
    } catch (error) {
      console.error("Failed to clear auth data:", error);
      throw new Error("Unable to clear authentication data");
    }
  }

  /**
   * Retrieves stored authentication data.
   * @returns Object containing user, token, and refreshToken, or null if unavailable.
   */
  async getAuthData(): Promise<{
    user: User | null;
    token: string | null;
    refreshToken: string | null;
  }> {
    try {
      const [userString, token, refreshToken] = await AsyncStorage.multiGet([
        "user",
        "token",
        "refreshToken",
      ]);
      return {
        user: userString[1] ? JSON.parse(userString[1]) : null,
        token: token[1],
        refreshToken: refreshToken[1],
      };
    } catch (error) {
      console.error("Failed to get auth data:", error);
      return { user: null, token: null, refreshToken: null };
    }
  }

  /**
   * Transforms backend user data to frontend format.
   * @param backendUser - Raw user data from backend.
   * @returns Transformed user object.
   */
  transformUserData(backendUser: AuthResponse["user"]): User {
    return {
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
  }

  /**
   * Restores user session with token validation.
   * @returns Auth data if session is valid, else null.
   */
  async restoreSession(): Promise<{
    user: User | null;
    token: string | null;
    refreshToken: string | null;
  }> {
    try {
      const authData = await this.getAuthData();
      if (!authData.user || !authData.token || !authData.refreshToken) {
        return { user: null, token: null, refreshToken: null };
      }

      const isValid = await apiService.checkTokenValidity();
      if (!isValid) {
        const refreshed = await apiService.silentRefresh();
        if (!refreshed) {
          await this.clearAuthData();
          return { user: null, token: null, refreshToken: null };
        }
        const newToken = await AsyncStorage.getItem("token");
        return { ...authData, token: newToken };
      }

      return authData;
    } catch (error) {
      console.error("Session restoration failed:", error);
      await this.clearAuthData();
      return { user: null, token: null, refreshToken: null };
    }
  }
}

export const authService = new AuthService();
