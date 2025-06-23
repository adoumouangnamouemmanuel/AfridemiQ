import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../../constants/url";
import type {
  AddLessonFeedbackData,
  BulkBaseLessonResult,
} from "../../../types/learning/lessons/lesson.base.types";
import type {
  BulkMathLessonCreate,
  BulkMathLessonUpdate,
  CreateMathLessonData,
  MathLesson,
  MathLessonAnalytics,
  MathLessonApiResponse,
  MathLessonFilters,
  MathLessonListResponse,
  MathLessonStatistics,
  MathTopic,
  UpdateMathLessonData,
} from "../../../types/learning/lessons/lesson.math.types";

/**
 * Math Lesson API Service
 * Handles all math lesson-related API operations extending base lesson functionality
 */
class MathLessonApiService {
  private baseUrl: string;
  private requestCache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = `${API_BASE_URL}/lessons/math`;
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
      console.log(`🗄️ MathLessonAPI - Using cached data for: ${cacheKey}`);
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
      console.error("🔑 MathLessonAPI - Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Makes an authenticated API request with caching and deduplication
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MathLessonApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Check cache for GET requests
    if (!options.method || options.method === "GET") {
      const cachedData = this.getCachedData<MathLessonApiResponse<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Check if request is already ongoing
      const ongoingRequest = this.ongoingRequests.get(cacheKey);
      if (ongoingRequest) {
        console.log(`⏳ MathLessonAPI - Waiting for ongoing request: ${url}`);
        return ongoingRequest;
      }
    }

    console.log(`🌐 MathLessonAPI - Making request to: ${url}`);
    console.log(`🌐 MathLessonAPI - Method: ${options.method || "GET"}`);

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
  ): Promise<MathLessonApiResponse<T>> {
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

      console.log(`🌐 MathLessonAPI - Headers:`, {
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

      console.log(`🌐 MathLessonAPI - Response status: ${response.status}`);

      // Handle rate limiting
      if (response.status === 429) {
        console.warn(
          `🌐 MathLessonAPI - Rate limited, will use cache or fallback`
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
        console.log(`🌐 MathLessonAPI - Non-JSON response:`, text);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      console.log(`🌐 MathLessonAPI - Response data:`, responseData);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(`🌐 MathLessonAPI - Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
        });
        throw new Error(errorMessage);
      }

      // Return the parsed data
      return responseData as MathLessonApiResponse<T>;
    } catch (error) {
      console.error(`🌐 MathLessonAPI - Request error:`, {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Get all math lessons with optional filters
   */
  async getMathLessons(
    filters?: MathLessonFilters
  ): Promise<MathLessonListResponse> {
    console.log(
      `📚 MathLessonAPI - Getting math lessons with filters:`,
      filters
    );

    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => queryParams.append(key, String(v)));
            } else if (typeof value === "object" && value !== null) {
              // Handle nested objects like conceptCount: { min, max }
              Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                if (nestedValue !== undefined && nestedValue !== null) {
                  queryParams.append(
                    `${key}.${nestedKey}`,
                    String(nestedValue)
                  );
                }
              });
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }

      const endpoint = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";
      const response = await this.makeRequest<any>(`/${endpoint}`);

      return {
        lessons: response.data || [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch (error) {
      console.error(`📚 MathLessonAPI - Error getting math lessons:`, error);
      throw error;
    }
  }

  /**
   * Get math lesson by ID
   */
  async getMathLessonById(id: string): Promise<MathLesson> {
    console.log(`🔍 MathLessonAPI - Getting math lesson by ID: ${id}`);

    try {
      const response = await this.makeRequest<any>(`/${id}`);

      if (!response.data) {
        throw new Error("No math lesson data received");
      }

      return response.data;
    } catch (error) {
      console.error(
        `🔍 MathLessonAPI - Error getting math lesson by ID:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get math lessons by topic ID
   */
  async getMathLessonsByTopic(
    topicId: string,
    options?: MathLessonFilters
  ): Promise<MathLessonListResponse> {
    console.log(
      `📖 MathLessonAPI - Getting math lessons for topic: ${topicId}`
    );

    try {
      const queryParams = new URLSearchParams();

      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const endpoint = queryParams.toString()
        ? `/topic/${encodeURIComponent(topicId)}?${queryParams.toString()}`
        : `/topic/${encodeURIComponent(topicId)}`;
      const response = await this.makeRequest<any>(endpoint);

      return {
        lessons: response.data || [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch (error) {
      console.error(
        `📖 MathLessonAPI - Error getting math lessons by topic:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get math lessons by math topic
   */
  async getMathLessonsByMathTopic(
    mathTopic: MathTopic,
    options?: MathLessonFilters
  ): Promise<MathLessonListResponse> {
    console.log(
      `🧮 MathLessonAPI - Getting math lessons by math topic: ${mathTopic}`
    );

    try {
      const queryParams = new URLSearchParams();

      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const endpoint = queryParams.toString()
        ? `/math-topic/${encodeURIComponent(
            mathTopic
          )}?${queryParams.toString()}`
        : `/math-topic/${encodeURIComponent(mathTopic)}`;
      const response = await this.makeRequest<any>(endpoint);

      return {
        lessons: response.data || [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch (error) {
      console.error(
        `🧮 MathLessonAPI - Error getting math lessons by math topic:`,
        error
      );
      throw error;
    }
  }

  /**
   * Search math lessons
   */
  async searchMathLessons(
    searchTerm: string,
    options?: MathLessonFilters
  ): Promise<MathLessonListResponse> {
    console.log(`🔍 MathLessonAPI - Searching math lessons: ${searchTerm}`);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("q", searchTerm);

      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== "search") {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await this.makeRequest<any>(
        `/search?${queryParams.toString()}`
      );

      return {
        lessons: response.data || [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch (error) {
      console.error(`🔍 MathLessonAPI - Error searching math lessons:`, error);
      throw error;
    }
  }

  /**
   * Get math lesson statistics
   */
  async getMathLessonStatistics(): Promise<MathLessonStatistics> {
    console.log(`📊 MathLessonAPI - Getting math lesson statistics`);

    try {
      const response = await this.makeRequest<any>("/statistics");
      return (
        response.data || {
          general: {
            totalMathLessons: 0,
            avgConceptCount: 0,
            avgTheoremCount: 0,
            avgExampleCount: 0,
            lessonsWithInteractive: 0,
          },
          byMathTopic: [],
          byDifficulty: [],
        }
      );
    } catch (error) {
      console.error(
        `📊 MathLessonAPI - Error getting math lesson statistics:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get math lesson analytics
   */
  async getMathLessonAnalytics(): Promise<MathLessonAnalytics> {
    console.log(`📈 MathLessonAPI - Getting math lesson analytics`);

    try {
      const response = await this.makeRequest<any>("/analytics");
      return (
        response.data || {
          overview: {
            totalMathLessons: 0,
            avgCompletionRate: 0,
            avgRating: 0,
            totalStudents: 0,
          },
          conceptAnalytics: {
            mostDifficultConcepts: [],
            easiestConcepts: [],
            popularTopics: [],
          },
          interactiveUsage: [],
        }
      );
    } catch (error) {
      console.error(
        `📈 MathLessonAPI - Error getting math lesson analytics:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create a new math lesson (admin/teacher only)
   */
  async createMathLesson(
    lessonData: CreateMathLessonData
  ): Promise<MathLesson> {
    console.log(`➕ MathLessonAPI - Creating math lesson:`, lessonData);

    try {
      const response = await this.makeRequest<any>("/", {
        method: "POST",
        body: JSON.stringify(lessonData),
      });

      if (!response.data) {
        throw new Error("No math lesson data received after creation");
      }

      return response.data;
    } catch (error) {
      console.error(`➕ MathLessonAPI - Error creating math lesson:`, error);
      throw error;
    }
  }

  /**
   * Update math lesson (admin/teacher only)
   */
  async updateMathLesson(
    id: string,
    updateData: UpdateMathLessonData
  ): Promise<MathLesson> {
    console.log(`✏️ MathLessonAPI - Updating math lesson ${id}:`, updateData);

    try {
      const response = await this.makeRequest<any>(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.data) {
        throw new Error("No math lesson data received after update");
      }

      return response.data;
    } catch (error) {
      console.error(`✏️ MathLessonAPI - Error updating math lesson:`, error);
      throw error;
    }
  }

  /**
   * Delete math lesson (admin/teacher only)
   */
  async deleteMathLesson(id: string): Promise<void> {
    console.log(`🗑️ MathLessonAPI - Deleting math lesson: ${id}`);

    try {
      await this.makeRequest<any>(`/${id}`, {
        method: "DELETE",
      });

      console.log(`🗑️ MathLessonAPI - Successfully deleted math lesson: ${id}`);
    } catch (error) {
      console.error(`🗑️ MathLessonAPI - Error deleting math lesson:`, error);
      throw error;
    }
  }

  /**
   * Add feedback to math lesson
   */
  async addFeedback(
    id: string,
    feedbackData: AddLessonFeedbackData
  ): Promise<MathLesson> {
    console.log(
      `⭐ MathLessonAPI - Adding feedback to math lesson ${id}:`,
      feedbackData
    );

    try {
      const response = await this.makeRequest<any>(`/${id}/feedback`, {
        method: "POST",
        body: JSON.stringify(feedbackData),
      });

      if (!response.data) {
        throw new Error("No math lesson data received after adding feedback");
      }

      return response.data;
    } catch (error) {
      console.error(`⭐ MathLessonAPI - Error adding feedback:`, error);
      throw error;
    }
  }

  /**
   * Bulk create math lessons (admin/teacher only)
   */
  async bulkCreateMathLessons(
    lessonsData: BulkMathLessonCreate
  ): Promise<BulkBaseLessonResult<MathLesson>> {
    console.log(`🔄 MathLessonAPI - Bulk creating math lessons:`, lessonsData);

    try {
      const response = await this.makeRequest<any>("/bulk/create", {
        method: "POST",
        body: JSON.stringify(lessonsData),
      });

      if (!response.data) {
        throw new Error("No bulk create result received");
      }

      return response.data;
    } catch (error) {
      console.error(
        `🔄 MathLessonAPI - Error bulk creating math lessons:`,
        error
      );
      throw error;
    }
  }

  /**
   * Bulk update math lessons (admin/teacher only)
   */
  async bulkUpdateMathLessons(
    updatesData: BulkMathLessonUpdate
  ): Promise<BulkBaseLessonResult<MathLesson>> {
    console.log(`🔄 MathLessonAPI - Bulk updating math lessons:`, updatesData);

    try {
      const response = await this.makeRequest<any>("/bulk/update", {
        method: "PUT",
        body: JSON.stringify(updatesData),
      });

      if (!response.data) {
        throw new Error("No bulk update result received");
      }

      return response.data;
    } catch (error) {
      console.error(
        `🔄 MathLessonAPI - Error bulk updating math lessons:`,
        error
      );
      throw error;
    }
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    console.log(`🔧 MathLessonAPI - Testing connection`);

    try {
      await this.getMathLessonStatistics();
      console.log(`🔧 MathLessonAPI - Connection test successful`);
      return true;
    } catch (error) {
      console.error(`🔧 MathLessonAPI - Connection test failed:`, error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.requestCache.clear();
    this.ongoingRequests.clear();
    console.log("🗄️ MathLessonAPI - Cache cleared");
  }
}

// Export singleton instance
export const mathLessonApiService = new MathLessonApiService();

// Export types
export type {
  CreateMathLessonData,
  MathLesson,
  MathLessonApiResponse,
  MathLessonFilters,
  MathLessonListResponse,
  UpdateMathLessonData,
};
