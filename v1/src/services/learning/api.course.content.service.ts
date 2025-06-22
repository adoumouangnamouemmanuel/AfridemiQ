import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../constants/url";
import type {
  BulkCourseContentCreate,
  BulkCourseContentResult,
  CourseContent,
  CourseContentApiResponse,
  CourseContentFilters,
  CourseContentListResponse,
  CourseContentStatistics,
  CreateCourseContentData,
  UpdateCourseContentData,
  UpdateProgressTrackingData,
} from "../../types/learning/course.content.types";

/**
 * Course Content API Service
 * Handles all course content-related API operations following the same pattern as other learning services
 */
class CourseContentApiService {
  private baseUrl: string;
  private requestCache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = `${API_BASE_URL}/course-contents`;
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
      console.log(`🗄️ CourseContentAPI - Using cached data for: ${cacheKey}`);
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
      console.error("🔑 CourseContentAPI - Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Makes an authenticated API request with caching and deduplication
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CourseContentApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Check cache for GET requests
    if (!options.method || options.method === "GET") {
      const cachedData =
        this.getCachedData<CourseContentApiResponse<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Check if request is already ongoing
      const ongoingRequest = this.ongoingRequests.get(cacheKey);
      if (ongoingRequest) {
        console.log(
          `⏳ CourseContentAPI - Waiting for ongoing request: ${url}`
        );
        return ongoingRequest;
      }
    }

    console.log(`🌐 CourseContentAPI - Making request to: ${url}`);
    console.log(`🌐 CourseContentAPI - Method: ${options.method || "GET"}`);

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
  ): Promise<CourseContentApiResponse<T>> {
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

      console.log(`🌐 CourseContentAPI - Headers:`, {
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

      console.log(`🌐 CourseContentAPI - Response status: ${response.status}`);

      // Handle rate limiting
      if (response.status === 429) {
        console.warn(
          `🌐 CourseContentAPI - Rate limited, will use cache or fallback`
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
        console.log(`🌐 CourseContentAPI - Non-JSON response:`, text);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      console.log(`🌐 CourseContentAPI - Response data:`, responseData);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(`🌐 CourseContentAPI - Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
        });
        throw new Error(errorMessage);
      }

      // Return the parsed data
      return responseData as CourseContentApiResponse<T>;
    } catch (error) {
      console.error(`🌐 CourseContentAPI - Request error:`, {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Get all course contents with optional filters
   */
  async getCourseContents(
    filters?: CourseContentFilters
  ): Promise<CourseContentListResponse> {
    console.log(
      `📚 CourseContentAPI - Getting course contents with filters:`,
      filters
    );

    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => queryParams.append(key, String(v)));
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
        courseContents: response.data?.courseContents || response.data || [],
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
        `📚 CourseContentAPI - Error getting course contents:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get course content by ID
   */
  async getCourseContentById(id: string): Promise<CourseContent> {
    console.log(`🔍 CourseContentAPI - Getting course content by ID: ${id}`);

    try {
      const response = await this.makeRequest<any>(`/${id}`);

      if (!response.data) {
        throw new Error("No course content data received");
      }

      return response.data;
    } catch (error) {
      console.error(
        `🔍 CourseContentAPI - Error getting course content by ID:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get course contents by subject
   */
  async getCourseContentsBySubject(
    subjectId: string,
    options?: CourseContentFilters
  ): Promise<CourseContentListResponse> {
    console.log(
      `📖 CourseContentAPI - Getting course contents for subject: ${subjectId}`
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
        ? `/subject/${encodeURIComponent(subjectId)}?${queryParams.toString()}`
        : `/subject/${encodeURIComponent(subjectId)}`;
      const response = await this.makeRequest<any>(endpoint);

      return {
        courseContents: response.data || [],
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
        `📖 CourseContentAPI - Error getting course contents by subject:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get course contents by exam
   */
  async getCourseContentsByExam(
    examId: string,
    options?: CourseContentFilters
  ): Promise<CourseContentListResponse> {
    console.log(
      `📝 CourseContentAPI - Getting course contents for exam: ${examId}`
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
        ? `/exam/${encodeURIComponent(examId)}?${queryParams.toString()}`
        : `/exam/${encodeURIComponent(examId)}`;
      const response = await this.makeRequest<any>(endpoint);

      return {
        courseContents: response.data || [],
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
        `📝 CourseContentAPI - Error getting course contents by exam:`,
        error
      );
      throw error;
    }
  }

  /**
   * Search course contents
   */
  async searchCourseContents(
    searchTerm: string,
    options?: CourseContentFilters
  ): Promise<CourseContentListResponse> {
    console.log(
      `🔍 CourseContentAPI - Searching course contents: ${searchTerm}`
    );

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
        courseContents: response.data || [],
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
        `🔍 CourseContentAPI - Error searching course contents:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get course content statistics
   */
  async getCourseContentStatistics(): Promise<CourseContentStatistics> {
    console.log(`📊 CourseContentAPI - Getting course content statistics`);

    try {
      const response = await this.makeRequest<any>("/statistics");
      return (
        response.data || {
          totalContents: 0,
          contentsByLevel: {},
          contentsBySubject: {},
          premiumContents: 0,
          freeContents: 0,
          averageModulesPerContent: 0,
        }
      );
    } catch (error) {
      console.error(`📊 CourseContentAPI - Error getting statistics:`, error);
      throw error;
    }
  }

  /**
   * Get difficulty levels
   */
  async getDifficultyLevels(): Promise<string[]> {
    console.log(`📋 CourseContentAPI - Getting difficulty levels`);

    try {
      const response = await this.makeRequest<any>("/difficulty-levels");
      return response.data || ["beginner", "intermediate", "advanced"];
    } catch (error) {
      console.error(
        `📋 CourseContentAPI - Error getting difficulty levels:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create a new course content (admin only)
   */
  async createCourseContent(
    courseContentData: CreateCourseContentData
  ): Promise<CourseContent> {
    console.log(
      `➕ CourseContentAPI - Creating course content:`,
      courseContentData
    );

    try {
      const response = await this.makeRequest<any>("/", {
        method: "POST",
        body: JSON.stringify(courseContentData),
      });

      if (!response.data) {
        throw new Error("No course content data received after creation");
      }

      return response.data;
    } catch (error) {
      console.error(
        `➕ CourseContentAPI - Error creating course content:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update course content (admin only)
   */
  async updateCourseContent(
    id: string,
    updateData: UpdateCourseContentData
  ): Promise<CourseContent> {
    console.log(
      `✏️ CourseContentAPI - Updating course content ${id}:`,
      updateData
    );

    try {
      const response = await this.makeRequest<any>(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.data) {
        throw new Error("No course content data received after update");
      }

      return response.data;
    } catch (error) {
      console.error(
        `✏️ CourseContentAPI - Error updating course content:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete course content (admin only)
   */
  async deleteCourseContent(id: string): Promise<void> {
    console.log(`🗑️ CourseContentAPI - Deleting course content: ${id}`);

    try {
      await this.makeRequest<any>(`/${id}`, {
        method: "DELETE",
      });

      console.log(
        `🗑️ CourseContentAPI - Successfully deleted course content: ${id}`
      );
    } catch (error) {
      console.error(
        `🗑️ CourseContentAPI - Error deleting course content:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update progress tracking
   */
  async updateProgressTracking(
    id: string,
    progressData: UpdateProgressTrackingData
  ): Promise<CourseContent> {
    console.log(
      `📈 CourseContentAPI - Updating progress tracking for ${id}:`,
      progressData
    );

    try {
      const response = await this.makeRequest<any>(`/${id}/progress`, {
        method: "PUT",
        body: JSON.stringify(progressData),
      });

      if (!response.data) {
        throw new Error(
          "No course content data received after progress update"
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        `📈 CourseContentAPI - Error updating progress tracking:`,
        error
      );
      throw error;
    }
  }

  /**
   * Bulk create course contents (admin only)
   */
  async bulkCreateCourseContents(
    contentsData: BulkCourseContentCreate
  ): Promise<BulkCourseContentResult<CourseContent>> {
    console.log(
      `🔄 CourseContentAPI - Bulk creating course contents:`,
      contentsData
    );

    try {
      const response = await this.makeRequest<any>("/bulk/create", {
        method: "POST",
        body: JSON.stringify(contentsData),
      });

      if (!response.data) {
        throw new Error("No bulk create result received");
      }

      return response.data;
    } catch (error) {
      console.error(
        `🔄 CourseContentAPI - Error bulk creating course contents:`,
        error
      );
      throw error;
    }
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    console.log(`🔧 CourseContentAPI - Testing connection`);

    try {
      await this.getCourseContentStatistics();
      console.log(`🔧 CourseContentAPI - Connection test successful`);
      return true;
    } catch (error) {
      console.error(`🔧 CourseContentAPI - Connection test failed:`, error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.requestCache.clear();
    this.ongoingRequests.clear();
    console.log("🗄️ CourseContentAPI - Cache cleared");
  }
}

// Export singleton instance
export const courseContentApiService = new CourseContentApiService();

// Export types
export type {
  CourseContent,
  CourseContentApiResponse,
  CourseContentFilters,
  CourseContentListResponse,
  CreateCourseContentData,
  UpdateCourseContentData,
};
