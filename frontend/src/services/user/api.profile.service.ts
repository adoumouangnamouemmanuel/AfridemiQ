/**
 * Profile API Service for managing user profile-related operations with the backend.
 * Provides methods for fetching, updating, and managing user profiles, preferences, and progress.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  ApiResponse,
  UserProfile,
  UpdateProfileData,
  UpdatePreferencesData,
  UpdateProgressData,
  SearchUsersResponse,
  UpdateSocialProfileData,
  Friend,
} from "../../types/user/user.types";

// Constants
/** Base URL for API requests */
const API_BASE_URL = "http://192.168.4.246:3000/api";

/**
 * Service class for handling user profile API operations.
 */
class ProfileApiService {
  /**
   * Retrieves the stored authentication token from AsyncStorage.
   * @returns {Promise<string | null>} The token or null if retrieval fails.
   */
  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Makes an authenticated API request to the backend.
   * @param endpoint - The API endpoint path (e.g., /users/profile).
   * @param options - Fetch request options (method, headers, body, etc.).
   * @returns {Promise<ApiResponse<T>>} The API response with typed data.
   * @throws {Error} If the request fails or the response is not OK.
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getStoredToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Fetches the user's profile data.
   * @returns {Promise<UserProfile>} The user's profile.
   */
  async getProfile(): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>("/users/profile");
    return response.data;
  }

  /**
   * Updates the user's profile with provided data.
   * @param profileData - Data to update the profile.
   * @returns {Promise<UserProfile>} Updated user profile.
   */
  async updateProfile(profileData: UpdateProfileData): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    return response.data;
  }

  /**
   * Updates the user's preferences.
   * @param preferencesData - Preferences to update.
   * @returns {Promise<UserProfile>} Updated user profile.
   */
  async updatePreferences(
    preferencesData: UpdatePreferencesData
  ): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>("/users/preferences", {
      method: "PUT",
      body: JSON.stringify(preferencesData),
    });
    return response.data;
  }

  /**
   * Updates a specific preference type with a new value.
   * @param type - The preference type to update.
   * @param value - The new value for the preference.
   * @returns {Promise<UserProfile>} Updated user profile.
   */
  async updatePreferenceType(type: string, value: any): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>(
      `/users/preferences/${type}`,
      {
        method: "PATCH",
        body: JSON.stringify({ value }),
      }
    );
    return response.data;
  }

  /**
   * Updates the user's progress data.
   * @param progressData - Progress data to update.
   * @returns {Promise<UserProfile>} Updated user profile.
   */
  async updateProgress(progressData: UpdateProgressData): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>("/users/progress", {
      method: "PUT",
      body: JSON.stringify(progressData),
    });
    return response.data;
  }

  /**
   * Updates the user's social profile.
   * @param socialData - Social profile data to update.
   * @returns {Promise<UserProfile>} Updated user profile.
   */
  async updateSocialProfile(
    socialData: UpdateSocialProfileData
  ): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>(
      "/users/social-profile",
      {
        method: "PUT",
        body: JSON.stringify(socialData),
      }
    );
    return response.data;
  }

  /**
   * Deletes the user's account.
   * @returns {Promise<void>} Resolves when the account is deleted.
   */
  async deleteAccount(): Promise<void> {
    await this.makeRequest("/users/profile", {
      method: "DELETE",
    });
  }

  // TODO: Implement when friends system is ready
  /**
   * Fetches the user's friends list (placeholder implementation).
   * @returns {Promise<Friend[]>} Array of friend objects (dummy data).
   */
  async getFriends(): Promise<Friend[]> {
    // TODO: Implement actual API call when friends endpoint is ready
    // const response = await this.makeRequest<any[]>('/users/friends')
    // return response.data

    // Dummy data for now
    return [
      { id: "1", name: "John Doe", avatar: undefined, level: 5, xp: 1250 },
      { id: "2", name: "Jane Smith", avatar: undefined, level: 7, xp: 2100 },
      { id: "3", name: "Mike Johnson", avatar: undefined, level: 3, xp: 750 },
    ];
  }

  // TODO: Implement when friends system is ready
  /**
   * Adds a friend to the user's friend list (placeholder implementation).
   * @param friendId - ID of the friend to add.
   * @returns {Promise<UserProfile>} Updated user profile.
   * @throws {Error} Friends system not implemented yet.
   */
  async addFriend(friendId: string): Promise<UserProfile> {
    // TODO: Implement actual API call when friends endpoint is ready
    // const response = await this.makeRequest<UserProfile>(`/users/friends/${friendId}`, {
    //   method: 'POST',
    // })
    // return response.data

    throw new Error("Friends system not implemented yet");
  }

  // TODO: Implement when friends system is ready
  /**
   * Removes a friend from the user's friend list (placeholder implementation).
   * @param friendId - ID of the friend to remove.
   * @returns {Promise<UserProfile>} Updated user profile.
   * @throws {Error} Friends system not implemented yet.
   */
  async removeFriend(friendId: string): Promise<UserProfile> {
    // TODO: Implement actual API call when friends endpoint is ready
    // const response = await this.makeRequest<UserProfile>(`/users/friends/${friendId}`, {
    //   method: 'DELETE',
    // })
    // return response.data

    throw new Error("Friends system not implemented yet");
  }

  // TODO: Implement when search system is ready
  /**
   * Searches for users based on a query (placeholder implementation).
   * @param query - Search query string.
   * @param page - Page number for pagination (default: 1).
   * @param limit - Number of results per page (default: 10).
   * @returns {Promise<SearchUsersResponse>} Search results with pagination info (dummy data).
   */
  async searchUsers(
    query: string,
    page = 1,
    limit = 10
  ): Promise<SearchUsersResponse> {
    // TODO: Implement actual API call when search endpoint is ready
    // const response = await this.makeRequest<any>(`/users/search?search=${query}&page=${page}&limit=${limit}`)
    // return response.data

    // Dummy data for now
    return {
      users: [
        { id: "1", name: "John Doe", email: "john@example.com", level: 5 },
        { id: "2", name: "Jane Smith", email: "jane@example.com", level: 7 },
      ],
      pagination: {
        total: 2,
        page: 1,
        totalPages: 1,
        hasMore: false,
      },
    };
  }
}

// Singleton instance
export const profileApiService = new ProfileApiService();

// Type exports
export type {
  UserProfile,
  UpdateProfileData,
  UpdatePreferencesData,
  UpdateProgressData,
};