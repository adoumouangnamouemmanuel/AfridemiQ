/**
 * API Service for handling authentication-related operations with the backend.
 * Manages user registration, login, logout, token refresh, and authentication status.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  ApiResponse,
  AuthResponse,
  RegisterData,
  LoginData,
  RefreshTokenData,
} from "../types/user/user.types";

/**
 * API base URL
 * @constant
 */
const API_BASE_URL = "http://192.168.65.246:3000/api"; // Change to your backend URL

/**
 * Request queue item
 */
interface QueuedApiRequest {
  endpoint: string;
  options: RequestInit & { requiresAuth?: boolean };
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  retryCount: number;
  maxRetries: number;
}

/**
 * Custom API error with additional metadata
 */
class ApiError extends Error {
  status: number;
  endpoint: string;

  /**
   * Creates an instance of ApiError.
   * @param message - Error message.
   * @param status - HTTP status code.
   * @param endpoint - API endpoint that caused the error.
   */
  constructor(message: string, status: number, endpoint: string) {
    super(message);
    this.status = status;
    this.endpoint = endpoint;
    this.name = "ApiError";
  }
}

/**
 * Service class for handling authentication API operations.
 */
class ApiService {
  /**
   * Queue of requests to be processed when online
   * @private
   */
  private requestQueue: QueuedApiRequest[] = [];

  /**
   * Flag indicating if we're currently processing the queue
   * @private
   */
  private isProcessingQueue = false;

  /**
   * Retrieves the stored access token from AsyncStorage.
   * @returns {Promise<string | null>} The access token or null if retrieval fails.
   */
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

  /**
   * Retrieves the stored refresh token from AsyncStorage.
   * @returns {Promise<string | null>} The refresh token or null if retrieval fails.
   */
  private async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("refreshToken");
    } catch (error) {
      console.error("Error getting stored refresh token:", error);
      return null;
    }
  }

  /**
   * Refreshes the access token using the stored refresh token.
   * @returns {Promise<string | null>} The new access token or null if refresh fails.
   * @throws {Error} If no refresh token is available or refresh fails.
   */
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

      await AsyncStorage.setItem("token", response.data.token);

      // TODO: Remove all console.log statements before production deployment
      console.log("✅ REFRESH: Token refresh successful");

      return response.data.token;
    } catch (error) {
      // TODO: Remove all console.log statements before production deployment
      console.error("❌ REFRESH: Token refresh failed:", error);

      console.error("Token refresh failed:", error);
      await this.clearStoredTokens();
      throw error;
    }
  }

  /**
   * Clears stored tokens and user data from AsyncStorage.
   * @returns {Promise<void>} Resolves when tokens are cleared.
   */
  private async clearStoredTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(["token", "refreshToken", "user"]);
    } catch (error) {
      console.error("Error clearing stored tokens:", error);
    }
  }

  /**
   * Process queued requests when online
   * @private
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    // TODO: Remove detailed logging before production
    console.log(
      `🌐 API: Processing request queue (${this.requestQueue.length} items)`
    );

    // Process oldest requests first (FIFO)
    const queue = [...this.requestQueue];
    this.requestQueue = [];

    for (const request of queue) {
      try {
        // TODO: Remove detailed logging before production
        console.log(`🌐 API: Executing queued request to ${request.endpoint}`);

        const response = await this.makeRequest(
          request.endpoint,
          request.options,
          request.retryCount
        );

        request.resolve(response);

        // TODO: Remove detailed logging before production
        console.log(
          `🌐 API: Queued request to ${request.endpoint} completed successfully`
        );
      } catch (error) {
        // TODO: Remove detailed logging before production
        console.error(
          `🌐 API: Error executing queued request to ${request.endpoint}:`,
          error
        );

        request.retryCount++;

        if (request.retryCount < request.maxRetries) {
          // Requeue with incremented retry count
          this.requestQueue.push(request);
        } else {
          request.reject(error);
        }
      }
    }

    this.isProcessingQueue = false;

    // Check if more requests were added while processing
    if (this.requestQueue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Makes an authenticated API request with automatic token refresh.
   * @param endpoint - The API endpoint path (e.g., /users/profile).
   * @param options - Fetch request options with optional requiresAuth flag.
   * @param retryCount - Number of retry attempts (default: 0).
   * @returns {Promise<ApiResponse<T>>} The API response with typed data.
   * @throws {ApiError | Error} If the request or token refresh fails.
   */
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

      const token = await this.getStoredToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

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

  /**
   * Registers a new user with the provided data.
   * @param userData - User registration data.
   * @returns {Promise<AuthResponse>} The authentication response with user data and tokens.
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.data;
  }

  /**
   * Logs in a user with the provided credentials.
   * @param credentials - User login credentials.
   * @returns {Promise<AuthResponse>} The authentication response with user data and tokens.
   */
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response.data;
  }

  /**
   * Logs out the current user and clears stored tokens.
   * @returns {Promise<void>} Resolves when logout is complete.
   */
  async logout(): Promise<void> {
    try {
      await this.makeRequest("/users/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      await this.clearStoredTokens();
    }
  }

  /**
   * Refreshes the access token using a provided refresh token.
   * @param refreshTokenData - Refresh token data.
   * @returns {Promise<{ token: string }>} The new access token.
   */
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

  /**
   * Checks if the user is authenticated by verifying stored tokens.
   * @returns {Promise<boolean>} True if both access and refresh tokens exist, false otherwise.
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      const refreshToken = await this.getStoredRefreshToken();
      return !!(token && refreshToken);
    } catch {
      return false;
    }
  }

  /**
   * Retrieves the current user data from AsyncStorage.
   * @returns {Promise<any | null>} The stored user data or null if not found.
   */
  async getCurrentUser(): Promise<any | null> {
    try {
      const userString = await AsyncStorage.getItem("user");
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Checks if the current access token is valid by making a profile request.
   * @returns {Promise<boolean>} True if the token is valid, false otherwise.
   */
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

  /**
   * Silently refreshes the access token using the stored refresh token.
   * @returns {Promise<boolean>} True if refresh is successful, false otherwise.
   */
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

  /**
   * Get pending request count
   * @returns Number of pending requests
   */
  getPendingRequestCount(): number {
    return this.requestQueue.length;
  }
}

// Singleton instance
export const apiService = new ApiService();
export type { AuthResponse, RegisterData, LoginData, RefreshTokenData };
