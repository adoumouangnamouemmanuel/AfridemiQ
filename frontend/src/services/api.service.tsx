import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.223.246:3000/api"; // Change to your backend URL

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    country: string;
    progress: {
      selectedExam: string;
      goalDate: string;
      xp: number;
      level: number;
      streak: {
        current: number;
        longest: number;
        lastStudyDate?: string;
      };
      badges: string[];
      completedTopics: string[];
      weakSubjects: string[];
    };
    avatar?: string;
    isPremium: boolean;
    role: string;
  };
  token: string;
  refreshToken?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RefreshTokenData {
  refreshToken: string;
}

class ApiService {
  // Private method to get stored token
  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("Error getting stored token:", error);
      return null;
    }
  }

  // Private method to get stored refresh token
  private async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("refreshToken");
    } catch (error) {
      console.error("Error getting stored refresh token:", error);
      return null;
    }
  }

  // Private method to handle token refresh
  private async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await this.makeRequest<{ token: string }>(
        "/users/refresh-token",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        }
      );

      // Store the new access token
      await AsyncStorage.setItem("token", response.data.token);
      return response.data.token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear stored tokens if refresh fails
      await this.clearStoredTokens();
      throw error;
    }
  }

  // Private method to clear stored authentication data
  private async clearStoredTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(["token", "refreshToken", "user"]);
    } catch (error) {
      console.error("Error clearing stored tokens:", error);
    }
  }

  // Enhanced makeRequest method with automatic token refresh
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      // Get token for authenticated requests
      const token = await this.getStoredToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      // Add authorization header if token exists and endpoint requires auth
      if (
        token &&
        !endpoint.includes("/login") &&
        !endpoint.includes("/register")
      ) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token expiration (401 Unauthorized)
      if (response.status === 401 && retryCount === 0) {
        try {
          // Attempt to refresh the token
          await this.refreshAccessToken();
          // Retry the original request with new token
          return this.makeRequest(endpoint, options, retryCount + 1);
        } catch {
          // If refresh fails, redirect to login
          throw new Error("Session expired. Please login again.");
        }
      }

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

  // Register a new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.data;
  }

  // Login user
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response.data;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await this.makeRequest("/users/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Always clear local storage
      await this.clearStoredTokens();
    }
  }

  // Refresh access token
  async refreshToken(
    refreshTokenData: RefreshTokenData
  ): Promise<{ token: string }> {
    const response = await this.makeRequest<{ token: string }>(
      "/users/refresh-token",
      {
        method: "POST",
        body: JSON.stringify(refreshTokenData),
      }
    );
    return response.data;
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      const refreshToken = await this.getStoredRefreshToken();
      return !!(token && refreshToken);
    } catch {
      return false;
    }
  }

  // Get current user data from storage
  async getCurrentUser(): Promise<any | null> {
    try {
      const userString = await AsyncStorage.getItem("user");
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }
}

export const apiService = new ApiService();
export type { AuthResponse, RegisterData, LoginData, RefreshTokenData };
