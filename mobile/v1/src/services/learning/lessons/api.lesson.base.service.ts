import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../../constants/url";
import type {
  AddLessonFeedbackData,
  BaseLesson,
  BaseLessonApiResponse,
  BaseLessonFilters,
  BaseLessonListResponse,
  BaseLessonStatistics,
  BulkBaseLessonCreate,
  BulkBaseLessonResult,
  BulkBaseLessonUpdate,
  CreateBaseLessonData,
  UpdateBaseLessonData,
} from "../../../types/learning/lessons/lesson.base.types";

/**
 * Base Lesson API Service
 * Handles all base lesson-related API operations
 */
class BaseLessonApiService {
  private baseUrl: string;
  private requestCache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = `${API_BASE_URL}/lessons`;
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
      console.log(`🗄️ BaseLessonAPI - Using cached data for: ${cacheKey}`);
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
      console.error("🔑 BaseLessonAPI - Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Makes an authenticated API request with caching and deduplication
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BaseLessonApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Check cache for GET requests
    if (!options.method || options.method === "GET") {
      const cachedData = this.getCachedData<BaseLessonApiResponse<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Check if request is already ongoing
      const ongoingRequest = this.ongoingRequests.get(cacheKey);
      if (ongoingRequest) {
        console.log(`⏳ BaseLessonAPI - Waiting for ongoing request: ${url}`);
        return ongoingRequest;
      }
    }

    console.log(`🌐 BaseLessonAPI - Making request to: ${url}`);
    console.log(`🌐 BaseLessonAPI - Method: ${options.method || "GET"}`);

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
  ): Promise<BaseLessonApiResponse<T>> {
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

      console.log(`🌐 BaseLessonAPI - Headers:`, {
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

      console.log(`🌐 BaseLessonAPI - Response status: ${response.status}`);

      // Handle rate limiting
      if (response.status === 429) {
        console.warn(
          `🌐 BaseLessonAPI - Rate limited, will use cache or fallback`
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
        console.log(`🌐 BaseLessonAPI - Non-JSON response:`, text);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      console.log(`🌐 BaseLessonAPI - Response data:`, responseData);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(`🌐 BaseLessonAPI - Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
        });
        throw new Error(errorMessage);
      }

      // Return the parsed data
      return responseData as BaseLessonApiResponse<T>;
    } catch (error) {
      console.error(`🌐 BaseLessonAPI - Request error:`, {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Get all lessons with optional filters
   */
  async getLessons(
    filters?: BaseLessonFilters
  ): Promise<BaseLessonListResponse> {
    console.log(`📚 BaseLessonAPI - Getting lessons with filters:`, filters);

    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => queryParams.append(key, String(v)));
            } else if (typeof value === "object" && value !== null) {
              // Handle nested objects like duration: { min, max }
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
      console.error(`📚 BaseLessonAPI - Error getting lessons:`, error);
      throw error;
    }
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(id: string): Promise<BaseLesson> {
    console.log(`🔍 BaseLessonAPI - Getting lesson by ID: ${id}`);

    try {
      const response = await this.makeRequest<any>(`/${id}`);

      if (!response.data) {
        throw new Error("No lesson data received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔍 BaseLessonAPI - Error getting lesson by ID:`, error);
      throw error;
    }
  }

  /**
   * Get lessons by topic ID
   */
  async getLessonsByTopic(
    topicId: string,
    options?: BaseLessonFilters
  ): Promise<BaseLessonListResponse> {
    console.log(`📖 BaseLessonAPI - Getting lessons for topic: ${topicId}`);

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
        `📖 BaseLessonAPI - Error getting lessons by topic:`,
        error
      );
      throw error;
    }
  }

  /**
   * Search lessons
   */
  async searchLessons(
    searchTerm: string,
    options?: BaseLessonFilters
  ): Promise<BaseLessonListResponse> {
    console.log(`🔍 BaseLessonAPI - Searching lessons: ${searchTerm}`);

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
      console.error(`🔍 BaseLessonAPI - Error searching lessons:`, error);
      throw error;
    }
  }

  /**
   * Get lesson statistics
   */
  async getLessonStatistics(): Promise<BaseLessonStatistics> {
    console.log(`📊 BaseLessonAPI - Getting lesson statistics`);

    try {
      const response = await this.makeRequest<any>("/statistics");
      return (
        response.data || {
          general: {
            totalLessons: 0,
            avgDuration: 0,
            avgCompletionRate: 0,
            lessonsWithPractice: 0,
            premiumLessons: 0,
            offlineLessons: 0,
          },
          byInteractivity: [],
          byTopic: [],
        }
      );
    } catch (error) {
      console.error(`📊 BaseLessonAPI - Error getting statistics:`, error);
      throw error;
    }
  }

  /**
   * Create a new lesson (admin/teacher only)
   */
  async createLesson(lessonData: CreateBaseLessonData): Promise<BaseLesson> {
    console.log(`➕ BaseLessonAPI - Creating lesson:`, lessonData);

    try {
      const response = await this.makeRequest<any>("/", {
        method: "POST",
        body: JSON.stringify(lessonData),
      });

      if (!response.data) {
        throw new Error("No lesson data received after creation");
      }

      return response.data;
    } catch (error) {
      console.error(`➕ BaseLessonAPI - Error creating lesson:`, error);
      throw error;
    }
  }

  /**
   * Update lesson (admin/teacher only)
   */
  async updateLesson(
    id: string,
    updateData: UpdateBaseLessonData
  ): Promise<BaseLesson> {
    console.log(`✏️ BaseLessonAPI - Updating lesson ${id}:`, updateData);

    try {
      const response = await this.makeRequest<any>(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.data) {
        throw new Error("No lesson data received after update");
      }

      return response.data;
    } catch (error) {
      console.error(`✏️ BaseLessonAPI - Error updating lesson:`, error);
      throw error;
    }
  }

  /**
   * Delete lesson (admin/teacher only)
   */
  async deleteLesson(id: string): Promise<void> {
    console.log(`🗑️ BaseLessonAPI - Deleting lesson: ${id}`);

    try {
      await this.makeRequest<any>(`/${id}`, {
        method: "DELETE",
      });

      console.log(`🗑️ BaseLessonAPI - Successfully deleted lesson: ${id}`);
    } catch (error) {
      console.error(`🗑️ BaseLessonAPI - Error deleting lesson:`, error);
      throw error;
    }
  }

  /**
   * Add feedback to lesson
   */
  async addFeedback(
    id: string,
    feedbackData: AddLessonFeedbackData
  ): Promise<BaseLesson> {
    console.log(
      `⭐ BaseLessonAPI - Adding feedback to lesson ${id}:`,
      feedbackData
    );

    try {
      const response = await this.makeRequest<any>(`/${id}/feedback`, {
        method: "POST",
        body: JSON.stringify(feedbackData),
      });

      if (!response.data) {
        throw new Error("No lesson data received after adding feedback");
      }

      return response.data;
    } catch (error) {
      console.error(`⭐ BaseLessonAPI - Error adding feedback:`, error);
      throw error;
    }
  }

  /**
   * Bulk create lessons (admin/teacher only)
   */
  async bulkCreateLessons(
    lessonsData: BulkBaseLessonCreate
  ): Promise<BulkBaseLessonResult<BaseLesson>> {
    console.log(`🔄 BaseLessonAPI - Bulk creating lessons:`, lessonsData);

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
      console.error(`🔄 BaseLessonAPI - Error bulk creating lessons:`, error);
      throw error;
    }
  }

  /**
   * Bulk update lessons (admin/teacher only)
   */
  async bulkUpdateLessons(
    updatesData: BulkBaseLessonUpdate
  ): Promise<BulkBaseLessonResult<BaseLesson>> {
    console.log(`🔄 BaseLessonAPI - Bulk updating lessons:`, updatesData);

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
      console.error(`🔄 BaseLessonAPI - Error bulk updating lessons:`, error);
      throw error;
    }
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    console.log(`🔧 BaseLessonAPI - Testing connection`);

    try {
      await this.getLessonStatistics();
      console.log(`🔧 BaseLessonAPI - Connection test successful`);
      return true;
    } catch (error) {
      console.error(`🔧 BaseLessonAPI - Connection test failed:`, error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.requestCache.clear();
    this.ongoingRequests.clear();
    console.log("🗄️ BaseLessonAPI - Cache cleared");
  }
}

// Export singleton instance
export const baseLessonApiService = new BaseLessonApiService();

// Export types
export type {
  AddLessonFeedbackData,
  BaseLesson,
  BaseLessonApiResponse,
  BaseLessonFilters,
  BaseLessonListResponse,
  CreateBaseLessonData,
  UpdateBaseLessonData,
};
