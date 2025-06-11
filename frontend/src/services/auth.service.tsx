import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "./api.service";

// Enhanced authentication service for managing auth state
class AuthService {
  // Store authentication data
  async storeAuthData(
    user: any,
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
      console.error("Error storing auth data:", error);
      throw new Error("Failed to store authentication data");
    }
  }

  // Clear all authentication data
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(["user", "token", "refreshToken"]);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  }

  // Get stored authentication data
  async getAuthData(): Promise<{
    user: any | null;
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
      console.error("Error getting auth data:", error);
      return { user: null, token: null, refreshToken: null };
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { token, refreshToken } = await this.getAuthData();
    return !!(token && refreshToken);
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call API logout
      await apiService.logout();
    } catch (error) {
      console.error("API logout failed:", error);
    } finally {
      // Always clear local data
      await this.clearAuthData();
    }
  }

  // Transform backend user data to frontend format
  transformUserData(backendUser: any): any {
    return {
      id: backendUser._id,
      name: backendUser.name,
      email: backendUser.email,
      country: backendUser.country,
      selectedExam: backendUser.progress?.selectedExam || "",
      goalDate: backendUser.progress?.goalDate
        ? new Date(backendUser.progress.goalDate)
        : undefined,
      xp: backendUser.progress?.xp || 0,
      level: backendUser.progress?.level || 1,
      streak: backendUser.progress?.streak?.current || 0,
      avatar: backendUser.avatar,
      badges: backendUser.progress?.badges || [],
      completedTopics: backendUser.progress?.completedTopics || [],
      weakSubjects: backendUser.progress?.weakSubjects || [],
      isPremium: backendUser.isPremium || false,
      role: backendUser.role || "user",
    };
  }
}

export const authService = new AuthService();