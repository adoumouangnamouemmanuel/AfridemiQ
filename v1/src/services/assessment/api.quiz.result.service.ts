import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../constants/url";
import type {
  QuizResult,
  CreateQuizResultData,
  UpdateQuizResultData,
  QuizResultFilters,
  QuizResultListResponse,
  UserQuizResultsResponse,
  BestScoreResponse,
  QuizResultApiResponse,
  QuizResultAnalytics,
} from "../../types/assessment/quiz.result.types";

/**
 * Quiz Result API Service
 * Handles all quiz result-related API operations following the same pattern as question/quiz services
 */
class QuizResultApiService {
  private baseUrl: string;
  private requestCache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (shorter for results)

  constructor() {
    this.baseUrl = `${API_BASE_URL}/quiz-results`;
  }

  /**
   * Generate cache key for request
   */
  private getCacheKey(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Get cached data if available and valid
   */
  private getCachedData<T>(cacheKey: string): T | null {
    const cached = this.requestCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log(`🗄️ QuizResultAPI - Using cached data for: ${cacheKey}`);
      return cached.data;
    }
    return null;
  }

  /**
   * Cache the response data
   */
  private setCachedData(cacheKey: string, data: any): void {
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Retrieves the stored authentication token from AsyncStorage.
   */
  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("🔑 QuizResultAPI - Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Makes an authenticated API request with caching and deduplication
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<QuizResultApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Check cache for GET requests
    if (!options.method || options.method === "GET") {
      const cachedData = this.getCachedData<QuizResultApiResponse<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Check if request is already ongoing
      const ongoingRequest = this.ongoingRequests.get(cacheKey);
      if (ongoingRequest) {
        console.log(`⏳ QuizResultAPI - Waiting for ongoing request: ${url}`);
        return ongoingRequest;
      }
    }

    console.log(`🌐 QuizResultAPI - Making request to: ${url}`);
    console.log(`🌐 QuizResultAPI - Method: ${options.method || "GET"}`);

    // Create the request promise
    const requestPromise = this.executeRequest<T>(url, options);

    // Store ongoing request for GET requests
    if (!options.method || options.method === "GET") {
      this.ongoingRequests.set(cacheKey, requestPromise);
    }

    try {
      const response = await requestPromise;

      // Cache successful GET responses
      if (!options.method || options.method === "GET") {
        this.setCachedData(cacheKey, response);
      }

      return response;
    } catch (error) {
      throw error;
    } finally {
      // Remove from ongoing requests
      this.ongoingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest<T>(
    url: string,
    options: RequestInit
  ): Promise<QuizResultApiResponse<T>> {
    try {
      // Get authentication token
      const token = await this.getStoredToken();

      // Prepare headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(`🌐 QuizResultAPI - Headers:`, {
        ...headers,
        Authorization: headers.Authorization
          ? `Bearer ${token?.substring(0, 20)}...`
          : "None",
      });

      // Make the request
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`🌐 QuizResultAPI - Response status: ${response.status}`);

      // Handle rate limiting
      if (response.status === 429) {
        console.warn(
          `🌐 QuizResultAPI - Rate limited, will use cache or fallback`
        );
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      // Parse response
      let responseData: any;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        console.log(`🌐 QuizResultAPI - Non-JSON response:`, text);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      console.log(`🌐 QuizResultAPI - Response data:`, responseData);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(`🌐 QuizResultAPI - Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
        });
        throw new Error(errorMessage);
      }

      // Return the parsed data
      return responseData as QuizResultApiResponse<T>;
    } catch (error) {
      console.error(`🌐 QuizResultAPI - Request error:`, {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Get all quiz results with optional filters
   */
  async getQuizResults(
    filters?: QuizResultFilters
  ): Promise<QuizResultListResponse> {
    console.log(
      `📊 QuizResultAPI - Getting quiz results with filters:`,
      filters
    );

    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const endpoint = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";
      const response = await this.makeRequest<any>(`/${endpoint}`);

      return {
        quizResults: response.data?.quizResults || response.data || [],
        pagination: response.data?.pagination ||
          response.pagination || {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
      };
    } catch (error) {
      console.error(`📊 QuizResultAPI - Error getting quiz results:`, error);
      throw error;
    }
  }

  /**
   * Get quiz result by ID
   */
  async getQuizResultById(id: string): Promise<QuizResult> {
    console.log(`🔍 QuizResultAPI - Getting quiz result by ID: ${id}`);

    try {
      const response = await this.makeRequest<any>(`/${id}`);

      if (!response.data?.quizResult && !response.data) {
        throw new Error("No quiz result data received");
      }

      return response.data?.quizResult || response.data;
    } catch (error) {
      console.error(
        `🔍 QuizResultAPI - Error getting quiz result by ID:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get user's quiz results
   */
  async getUserQuizResults(
    userId: string,
    filters?: QuizResultFilters
  ): Promise<UserQuizResultsResponse> {
    console.log(`👤 QuizResultAPI - Getting quiz results for user: ${userId}`);

    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const endpoint = queryParams.toString()
        ? `/user/${userId}?${queryParams.toString()}`
        : `/user/${userId}`;
      const response = await this.makeRequest<any>(endpoint);

      return {
        quizResults: response.data?.quizResults || response.data || [],
        pagination: response.data?.pagination ||
          response.pagination || {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        summary: response.data?.summary || {
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          bestScore: 0,
        },
      };
    } catch (error) {
      console.error(
        `👤 QuizResultAPI - Error getting user quiz results:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get user's best score for a quiz
   */
  async getUserBestScore(
    userId: string,
    quizId: string
  ): Promise<BestScoreResponse> {
    console.log(
      `🏆 QuizResultAPI - Getting best score for user ${userId} on quiz ${quizId}`
    );

    try {
      const response = await this.makeRequest<any>(
        `/user/${userId}/quiz/${quizId}/best`
      );

      if (!response.data?.bestScore && !response.data) {
        throw new Error("No best score data received");
      }

      return response.data?.bestScore || response.data;
    } catch (error) {
      console.error(`🏆 QuizResultAPI - Error getting user best score:`, error);
      throw error;
    }
  }

  /**
   * Get user's attempt count for a quiz
   */
  async getUserAttemptCount(userId: string, quizId: string): Promise<number> {
    console.log(
      `📈 QuizResultAPI - Getting attempt count for user ${userId} on quiz ${quizId}`
    );

    try {
      const response = await this.makeRequest<any>(
        `/user/${userId}/quiz/${quizId}/attempts`
      );

      if (response.data?.attemptCount !== undefined) {
        return response.data.attemptCount;
      } else if (typeof response.data === "number") {
        return response.data;
      }

      throw new Error("No attempt count data received");
    } catch (error) {
      console.error(
        `📈 QuizResultAPI - Error getting user attempt count:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get user's average score
   */
  async getUserAverageScore(userId: string): Promise<number> {
    console.log(`📊 QuizResultAPI - Getting average score for user: ${userId}`);

    try {
      const response = await this.makeRequest<any>(`/user/${userId}/average`);

      if (response.data?.averageScore !== undefined) {
        return response.data.averageScore;
      } else if (typeof response.data === "number") {
        return response.data;
      }

      throw new Error("No average score data received");
    } catch (error) {
      console.error(
        `📊 QuizResultAPI - Error getting user average score:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create a new quiz result
   */
  async createQuizResult(
    resultData: CreateQuizResultData
  ): Promise<QuizResult> {
    console.log(`➕ QuizResultAPI - Creating quiz result:`, resultData);

    try {
      const response = await this.makeRequest<any>("/", {
        method: "POST",
        body: JSON.stringify(resultData),
      });

      if (!response.data?.quizResult && !response.data) {
        throw new Error("No quiz result data received after creation");
      }

      // Clear user-related cache
      this.clearUserCache(resultData.userId);

      return response.data?.quizResult || response.data;
    } catch (error) {
      console.error(`➕ QuizResultAPI - Error creating quiz result:`, error);
      throw error;
    }
  }

  /**
   * Update quiz result
   */
  async updateQuizResult(
    id: string,
    updateData: UpdateQuizResultData
  ): Promise<QuizResult> {
    console.log(`✏️ QuizResultAPI - Updating quiz result ${id}:`, updateData);

    try {
      const response = await this.makeRequest<any>(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.data?.quizResult && !response.data) {
        throw new Error("No quiz result data received after update");
      }

      return response.data?.quizResult || response.data;
    } catch (error) {
      console.error(`✏️ QuizResultAPI - Error updating quiz result:`, error);
      throw error;
    }
  }

  /**
   * Delete quiz result (admin only)
   */
  async deleteQuizResult(id: string): Promise<void> {
    console.log(`🗑️ QuizResultAPI - Deleting quiz result: ${id}`);

    try {
      await this.makeRequest<any>(`/${id}`, {
        method: "DELETE",
      });

      console.log(`🗑️ QuizResultAPI - Successfully deleted quiz result: ${id}`);
    } catch (error) {
      console.error(`🗑️ QuizResultAPI - Error deleting quiz result:`, error);
      throw error;
    }
  }

  /**
   * Get quiz results analytics
   */
  async getQuizResultAnalytics(
    filters?: Record<string, any>
  ): Promise<QuizResultAnalytics> {
    console.log(`📊 QuizResultAPI - Getting quiz result analytics:`, filters);

    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const endpoint = queryParams.toString()
        ? `/analytics?${queryParams.toString()}`
        : "/analytics";
      const response = await this.makeRequest<any>(endpoint);

      return (
        response.data || {
          overview: {
            totalResults: 0,
            averageScore: 0,
            passRate: 0,
            averageCompletionTime: 0,
          },
          scoreDistribution: [],
          performanceTrends: [],
          topPerformers: [],
        }
      );
    } catch (error) {
      console.error(`📊 QuizResultAPI - Error getting analytics:`, error);
      throw error;
    }
  }

  /**
   * Clear user-specific cache
   */
  private clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];

    for (const [key] of this.requestCache) {
      if (key.includes(`/user/${userId}`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.requestCache.delete(key);
      this.ongoingRequests.delete(key);
    });

    console.log(`🗄️ QuizResultAPI - Cleared user cache for: ${userId}`);
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    console.log(`🔧 QuizResultAPI - Testing connection`);

    try {
      await this.getQuizResults({ limit: 1 });
      console.log(`🔧 QuizResultAPI - Connection test successful`);
      return true;
    } catch (error) {
      console.error(`🔧 QuizResultAPI - Connection test failed:`, error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.requestCache.clear();
    this.ongoingRequests.clear();
    console.log("🗄️ QuizResultAPI - Cache cleared");
  }
}

// Export singleton instance
export const quizResultApiService = new QuizResultApiService();

// Export types
export type {
  QuizResult,
  CreateQuizResultData,
  UpdateQuizResultData,
  QuizResultFilters,
  QuizResultListResponse,
  QuizResultApiResponse,
};
