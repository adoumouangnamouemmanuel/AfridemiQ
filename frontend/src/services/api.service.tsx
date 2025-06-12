import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.223.246:3000/api"; // Hardcoded for dev mode

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

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiService {
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private failedQueue: {
    resolve: (token: string) => void;
    reject: (error: ApiError) => void;
  }[] = [];

  /**
   * Retrieves the stored access token from AsyncStorage.
   * @returns The stored token or null if not found or on error.
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
   * Retrieves the stored refresh token from AsyncStorage.
   * @returns The stored refresh token or null if not found or on error.
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
   * Clears all stored authentication data from AsyncStorage.
   */
  private async clearStoredTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(["token", "refreshToken", "user"]);
    } catch (error) {
      console.error("Error clearing stored tokens:", error);
    }
  }

  /**
   * Refreshes the access token and manages queued requests.
   * @returns The new access token or null if refresh fails.
   * @throws ApiError if refresh fails.
   */
  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();

    try {
      const newToken = await this.refreshPromise;
      this.processQueue(null, newToken);
      return newToken;
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(
              "Token refresh failed",
              undefined,
              "/users/refresh-token"
            );
      this.processQueue(apiError, null);
      throw apiError;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Performs the actual token refresh request.
   * @returns The new access token.
   * @throws ApiError if the refresh request fails.
   */
  private async _performRefresh(): Promise<string> {
    const refreshToken = await this.getStoredRefreshToken();
    if (!refreshToken) {
      throw new ApiError(
        "No refresh token available",
        undefined,
        "/users/refresh-token"
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || "Token refresh failed",
          response.status,
          "/users/refresh-token"
        );
      }

      await AsyncStorage.setItem("token", data.data.token);
      return data.data.token;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Token refresh failed:", error);
      await this.clearStoredTokens();
      throw error instanceof ApiError
        ? error
        : new ApiError(
            "Network error during token refresh",
            undefined,
            "/users/refresh-token"
          );
    }
  }

  /**
   * Processes queued requests after a token refresh.
   * @param error The error to reject queued requests with, if any.
   * @param token The new token to resolve queued requests with, if successful.
   */
  private processQueue(error: ApiError | null, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  /**
   * Makes an API request with token handling and retry logic.
   * @param endpoint The API endpoint to call.
   * @param options Fetch options, including a requiresAuth flag.
   * @param retryCount Number of retries (default: 0).
   * @returns The API response data.
   * @throws ApiError if the request fails.
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { requiresAuth?: boolean } = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = true, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const token = requiresAuth ? await this.getStoredToken() : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((fetchOptions.headers as Record<string, string>) || {}),
      };

      if (token && requiresAuth) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (
        !data ||
        typeof data !== "object" ||
        !("message" in data && "data" in data)
      ) {
        throw new ApiError(
          "Invalid response format",
          response.status,
          endpoint
        );
      }

      if (response.status === 401 && requiresAuth && retryCount === 0) {
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({
              resolve: () =>
                resolve(this.makeRequest(endpoint, options, retryCount + 1)),
              reject,
            });
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
          const isCriticalEndpoint =
            endpoint.includes("/profile") || endpoint.includes("/user");
          throw new ApiError(
            isCriticalEndpoint
              ? "Session expired. Please login again."
              : data.message || "Request failed",
            response.status,
            endpoint
          );
        }
      }

      if (!response.ok) {
        throw new ApiError(
          data.message || "Something went wrong",
          response.status,
          endpoint
        );
      }

      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error instanceof ApiError
        ? error
        : new ApiError("Network error occurred", undefined, endpoint);
    }
  }

  /**
   * Registers a new user.
   * @param userData The registration data.
   * @returns The authentication response.
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
      requiresAuth: false,
    });
    return response.data;
  }

  /**
   * Logs in a user.
   * @param credentials The login credentials.
   * @returns The authentication response.
   */
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      requiresAuth: false,
    });
    return response.data;
  }

  /**
   * Logs out the current user.
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
   * Checks if the user is authenticated (valid tokens exist).
   * @returns True if authenticated, false otherwise.
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      const refreshToken = await this.getStoredRefreshToken();
      if (!token || !refreshToken) return false;
      return await this.checkTokenValidity();
    } catch {
      return false;
    }
  }

  /**
   * Retrieves the current user data from storage.
   * @returns The user data or null if not found.
   */
  async getCurrentUser(): Promise<AuthResponse["user"] | null> {
    try {
      const userString = await AsyncStorage.getItem("user");
      return userString
        ? (JSON.parse(userString) as AuthResponse["user"])
        : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Forces a logout by clearing tokens.
   */
  async forceLogout(): Promise<void> {
    await this.clearStoredTokens();
  }

  /**
   * Checks if the access token is valid.
   * @returns True if valid, false otherwise.
   */
  async checkTokenValidity(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) return false;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.status !== 401;
    } catch {
      return false;
    }
  }

  /**
   * Silently refreshes the access token.
   * @returns True if successful, false otherwise.
   */
  async silentRefresh(): Promise<boolean> {
    try {
      const newToken = await this.refreshAccessToken();
      return !!newToken;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export type { AuthResponse, LoginData, RefreshTokenData, RegisterData };
