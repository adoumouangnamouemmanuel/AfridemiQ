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
      // TODO: Remove all console.log statements before production deployment
      console.log("🔑 TOKEN: Attempting to get stored token");
      const token = await AsyncStorage.getItem("token");
      console.log(
        "🔑 TOKEN:",
        token ? `Found token: ${token.substring(0, 20)}...` : "No token found"
      );
      return token;
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

      // TODO: Remove all console.log statements before production deployment
      console.log("🔄 REFRESH: Starting token refresh process");
      console.log(
        "🔄 REFRESH: Current refresh token:",
        refreshToken ? `${refreshToken.substring(0, 20)}...` : "None"
      );

      const response = await this.makeRequest<{ token: string }>(
        "/users/refresh-token",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        }
      );

      // Store the new access token
      await AsyncStorage.setItem("token", response.data.token);

      // TODO: Remove all console.log statements before production deployment
      console.log("✅ REFRESH: Token refresh successful");

      return response.data.token;
    } catch (error) {
      // TODO: Remove all console.log statements before production deployment
      console.error("❌ REFRESH: Token refresh failed:", error);

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
    options: RequestInit & { requiresAuth?: boolean } = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const maxRetries = 3;

    try {
      // TODO: Remove detailed logging before production
      console.log(
        `🌐 API: Making request to ${endpoint}, retry: ${retryCount}`
      );

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

      if (
        response.status === 401 &&
        options.requiresAuth &&
        retryCount < maxRetries
      ) {
        // TODO: Remove detailed logging before production
        console.log("🔄 AUTH: Token expired, attempting refresh...");

        try {
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            // TODO: Remove detailed logging before production
            console.log(
              "✅ AUTH: Token refreshed successfully, retrying request"
            );
            return this.makeRequest(endpoint, options, retryCount + 1);
          }
        } catch (refreshError) {
          // TODO: Remove detailed logging before production
          console.error("❌ AUTH: Token refresh failed:", refreshError);

          // Don't throw immediately - try one more time with silent refresh
          if (retryCount === 0) {
            const silentRefresh = await this.silentRefresh();
            if (silentRefresh) {
              return this.makeRequest(endpoint, options, retryCount + 1);
            }
          }

          throw new ApiError(
            "Session expired. Please login again.",
            response.status,
            endpoint
          );
        }
      }

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error(`❌ API: Request failed for ${endpoint}:`, error);
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

  // Check if the current token is valid
  async checkTokenValidity(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        // TODO: Remove detailed logging before production
        console.log("🔍 TOKEN_CHECK: No token found");
        return false;
      }

      // TODO: Remove detailed logging before production
      console.log("🔍 TOKEN_CHECK: Validating token...");

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const isValid = response.status !== 401;

      // TODO: Remove detailed logging before production
      console.log(`🔍 TOKEN_CHECK: Token is ${isValid ? "valid" : "invalid"}`);

      return isValid;
    } catch (error) {
      // TODO: Remove detailed logging before production
      console.error("❌ TOKEN_CHECK: Token validation failed:", error);
      return false;
    }
  }

  // Silent refresh token
  async silentRefresh(): Promise<boolean> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await this.makeRequest<{
        refreshToken: any;
        token: string;
      }>("/users/refresh-token", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });

      await AsyncStorage.setItem("token", response.data.token);
      if (response.data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
      }
      return true;
    } catch (error) {
      console.error("Silent token refresh failed:", error);
      return false;
    }
  }
}

class ApiError extends Error {
  status: number;
  endpoint: string;

  constructor(message: string, status: number, endpoint: string) {
    super(message);
    this.status = status;
    this.endpoint = endpoint;
    this.name = "ApiError";
  }
}

export const apiService = new ApiService();
export type { AuthResponse, RegisterData, LoginData, RefreshTokenData };
