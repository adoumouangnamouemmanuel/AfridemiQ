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
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private failedQueue: {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }[] = [];

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

  // Enhanced token refresh with queue management
  private async refreshAccessToken(): Promise<string | null> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();

    try {
      const newToken = await this.refreshPromise;

      // Process failed queue with new token
      this.processQueue(null, newToken);

      return newToken;
    } catch (error) {
      // Process failed queue with error
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async _performRefresh(): Promise<string> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Make refresh request without automatic retry
      const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Token refresh failed");
      }

      // Store the new access token
      await AsyncStorage.setItem("token", data.data.token);
      return data.data.token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear stored tokens if refresh fails
      await this.clearStoredTokens();
      throw error;
    }
  }

  // Process queued requests after token refresh
  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  // Private method to clear stored authentication data
  private async clearStoredTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(["token", "refreshToken", "user"]);
    } catch (error) {
      console.error("Error clearing stored tokens:", error);
    }
  }

  // Enhanced makeRequest with better retry logic
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getStoredToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      // Add authorization header if token exists and endpoint requires auth
      if (
        token &&
        !endpoint.includes("/login") &&
        !endpoint.includes("/register") &&
        !endpoint.includes("/refresh-token")
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
        if (this.isRefreshing) {
          // If refresh is in progress, queue this request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            return this.makeRequest(endpoint, options, retryCount + 1);
          });
        }

        try {
          console.log("Token expired, attempting refresh...");
          const newToken = await this.refreshAccessToken();

          if (newToken) {
            console.log("Token refreshed successfully, retrying request");
            return this.makeRequest(endpoint, options, retryCount + 1);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // Only throw session expired error if refresh completely fails
          // and this is a critical endpoint
          if (endpoint.includes("/profile") || endpoint.includes("/user")) {
            throw new Error("Session expired. Please login again.");
          }
          // For other endpoints, just return the original error
          throw new Error(data.message || "Request failed");
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

  // Add method to force logout when tokens are invalid
  async forceLogout(): Promise<void> {
    try {
      await this.clearStoredTokens();
    } catch (error) {
      console.error("Error during force logout:", error);
    }
  }

  // Check token validity without throwing errors
  async checkTokenValidity(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) return false;

      // Make a lightweight request to check token validity
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.status !== 401;
    } catch {
      return false;
    }
  }

  // Silent token refresh (doesn't throw errors)
  async silentRefresh(): Promise<boolean> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem("token", data.data.token);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export type { AuthResponse, LoginData, RefreshTokenData, RegisterData };
