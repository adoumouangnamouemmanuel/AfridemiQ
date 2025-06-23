import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../constants/url";
import type {
  BulkTopicCreate,
  BulkTopicResult,
  BulkTopicUpdate,
  CreateTopicData,
  Topic,
  TopicApiResponse,
  TopicDifficulty,
  TopicFilters,
  TopicListResponse,
  TopicStatistics,
  UpdateTopicData,
} from "../../types/learning/topic.types";

/**
 * Topic API Service
 * Handles all topic-related API operations following the same pattern as curriculum service
 */
class TopicApiService {
  private baseUrl: string;
  private requestCache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = `${API_BASE_URL}/topics`;
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
      console.log(`🗄️ TopicAPI - Using cached data for: ${cacheKey}`);
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
   * @returns {Promise<string | null>} The token or null if retrieval fails.
   */
  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("🔑 TopicAPI - Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Makes an authenticated API request with caching and deduplication
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<TopicApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Check cache for GET requests
    if (!options.method || options.method === "GET") {
      const cachedData = this.getCachedData<TopicApiResponse<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Check if request is already ongoing
      const ongoingRequest = this.ongoingRequests.get(cacheKey);
      if (ongoingRequest) {
        console.log(`⏳ TopicAPI - Waiting for ongoing request: ${url}`);
        return ongoingRequest;
      }
    }

    console.log(`🌐 TopicAPI - Making request to: ${url}`);
    console.log(`🌐 TopicAPI - Method: ${options.method || "GET"}`);

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
      console.error(`🌐 TopicAPI - Request failed:`, error);
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
  ): Promise<TopicApiResponse<T>> {
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

      console.log(`🌐 TopicAPI - Headers:`, {
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

      console.log(`🌐 TopicAPI - Response status: ${response.status}`);

      // Handle rate limiting
      if (response.status === 429) {
        console.warn(`🌐 TopicAPI - Rate limited, will use cache or fallback`);
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      // Parse response
      let responseData: any;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        console.log(`🌐 TopicAPI - Non-JSON response:`, text);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      console.log(`🌐 TopicAPI - Response data:`, responseData);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(`🌐 TopicAPI - Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
        });
        throw new Error(errorMessage);
      }

      // Return the parsed data
      return responseData as TopicApiResponse<T>;
    } catch (error) {
      console.error(`🌐 TopicAPI - Request error:`, {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Get all topics with optional filters
   */
  async getTopics(filters?: TopicFilters): Promise<TopicListResponse> {
    console.log(`📚 TopicAPI - Getting topics with filters:`, filters);

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

      // Handle the actual backend response format
      return {
        topics: response.data || [],
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
      console.error(`📚 TopicAPI - Error getting topics:`, error);
      throw error;
    }
  }

  /**
   * Get topic by ID
   */
  async getTopicById(id: string): Promise<Topic> {
    console.log(`🔍 TopicAPI - Getting topic by ID: ${id}`);

    try {
      const response = await this.makeRequest<any>(`/${id}`);

      if (!response.data) {
        throw new Error("No topic data received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔍 TopicAPI - Error getting topic by ID:`, error);
      throw error;
    }
  }

  /**
   * Get topics by subject ID
   */
  async getTopicsBySubject(
    subjectId: string,
    options?: TopicFilters
  ): Promise<TopicListResponse> {
    console.log(`📖 TopicAPI - Getting topics for subject: ${subjectId}`);

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

      // Handle the actual backend response format
      console.log(`📖 TopicAPI - Raw response structure:`, {
        hasData: !!response.data,
        dataType: Array.isArray(response.data) ? "array" : typeof response.data,
        dataLength: response.data?.length,
        hasPagination: !!response.pagination,
        success: response.success,
      });

      return {
        topics: response.data || [],
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
      console.error(`📖 TopicAPI - Error getting topics by subject:`, error);
      throw error;
    }
  }

  /**
   * Get topics by difficulty
   */
  async getTopicsByDifficulty(
    difficulty: TopicDifficulty,
    options?: TopicFilters
  ): Promise<TopicListResponse> {
    console.log(`⚡ TopicAPI - Getting topics by difficulty: ${difficulty}`);

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
        ? `/difficulty/${encodeURIComponent(
            difficulty
          )}?${queryParams.toString()}`
        : `/difficulty/${encodeURIComponent(difficulty)}`;
      const response = await this.makeRequest<any>(endpoint);

      return {
        topics: response.data || [],
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
      console.error(`⚡ TopicAPI - Error getting topics by difficulty:`, error);
      throw error;
    }
  }

  /**
   * Get topics by series
   */
  async getTopicsBySeries(
    series: string,
    options?: TopicFilters
  ): Promise<TopicListResponse> {
    console.log(`📋 TopicAPI - Getting topics by series: ${series}`);

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
        ? `/series/${encodeURIComponent(series)}?${queryParams.toString()}`
        : `/series/${encodeURIComponent(series)}`;
      const response = await this.makeRequest<any>(endpoint);

      return {
        topics: response.data || [],
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
      console.error(`📋 TopicAPI - Error getting topics by series:`, error);
      throw error;
    }
  }

  /**
   * Search topics
   */
  async searchTopics(
    searchTerm: string,
    options?: TopicFilters
  ): Promise<TopicListResponse> {
    console.log(`🔍 TopicAPI - Searching topics: ${searchTerm}`);

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
        topics: response.data || [],
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
      console.error(`🔍 TopicAPI - Error searching topics:`, error);
      throw error;
    }
  }

  /**
   * Get topic statistics
   */
  async getTopicStatistics(): Promise<TopicStatistics> {
    console.log(`📊 TopicAPI - Getting topic statistics`);

    try {
      const response = await this.makeRequest<any>("/statistics");
      return (
        response.data || {
          general: {
            totalTopics: 0,
            avgEstimatedTime: 0,
            avgEstimatedTimeToMaster: 0,
            topicsWithPractice: 0,
            topicsWithNotes: 0,
            topicsWithStudyMaterial: 0,
          },
          byDifficulty: [],
          bySubject: [],
        }
      );
    } catch (error) {
      console.error(`📊 TopicAPI - Error getting statistics:`, error);
      throw error;
    }
  }

  /**
   * Get difficulty levels
   */
  async getDifficultyLevels(): Promise<TopicDifficulty[]> {
    console.log(`📋 TopicAPI - Getting difficulty levels`);

    try {
      const response = await this.makeRequest<any>("/difficulty-levels");
      return response.data || ["beginner", "intermediate", "advanced"];
    } catch (error) {
      console.error(`📋 TopicAPI - Error getting difficulty levels:`, error);
      throw error;
    }
  }

  /**
   * Create a new topic (admin only)
   */
  async createTopic(topicData: CreateTopicData): Promise<Topic> {
    console.log(`➕ TopicAPI - Creating topic:`, topicData);

    try {
      const response = await this.makeRequest<any>("/", {
        method: "POST",
        body: JSON.stringify(topicData),
      });

      if (!response.data) {
        throw new Error("No topic data received after creation");
      }

      return response.data;
    } catch (error) {
      console.error(`➕ TopicAPI - Error creating topic:`, error);
      throw error;
    }
  }

  /**
   * Update topic (admin only)
   */
  async updateTopic(id: string, updateData: UpdateTopicData): Promise<Topic> {
    console.log(`✏️ TopicAPI - Updating topic ${id}:`, updateData);

    try {
      const response = await this.makeRequest<any>(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.data) {
        throw new Error("No topic data received after update");
      }

      return response.data;
    } catch (error) {
      console.error(`✏️ TopicAPI - Error updating topic:`, error);
      throw error;
    }
  }

  /**
   * Delete topic (admin only)
   */
  async deleteTopic(id: string): Promise<void> {
    console.log(`🗑️ TopicAPI - Deleting topic: ${id}`);

    try {
      await this.makeRequest<any>(`/${id}`, {
        method: "DELETE",
      });

      console.log(`🗑️ TopicAPI - Successfully deleted topic: ${id}`);
    } catch (error) {
      console.error(`🗑️ TopicAPI - Error deleting topic:`, error);
      throw error;
    }
  }

  /**
   * Bulk create topics (admin only)
   */
  async bulkCreateTopics(
    topicsData: BulkTopicCreate
  ): Promise<BulkTopicResult<Topic>> {
    console.log(`🔄 TopicAPI - Bulk creating topics:`, topicsData);

    try {
      const response = await this.makeRequest<any>("/bulk/create", {
        method: "POST",
        body: JSON.stringify(topicsData),
      });

      if (!response.data) {
        throw new Error("No bulk create result received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔄 TopicAPI - Error bulk creating topics:`, error);
      throw error;
    }
  }

  /**
   * Bulk update topics (admin only)
   */
  async bulkUpdateTopics(
    updatesData: BulkTopicUpdate
  ): Promise<BulkTopicResult<Topic>> {
    console.log(`🔄 TopicAPI - Bulk updating topics:`, updatesData);

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
      console.error(`🔄 TopicAPI - Error bulk updating topics:`, error);
      throw error;
    }
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    console.log(`🔧 TopicAPI - Testing connection`);

    try {
      await this.getTopicStatistics();
      console.log(`🔧 TopicAPI - Connection test successful`);
      return true;
    } catch (error) {
      console.error(`🔧 TopicAPI - Connection test failed:`, error);
      return false;
    }
  }

  /**
   * Clear cache (useful for development or when needed)
   */
  clearCache(): void {
    this.requestCache.clear();
    this.ongoingRequests.clear();
    console.log("🗄️ TopicAPI - Cache cleared");
  }
}

// Export singleton instance
export const topicApiService = new TopicApiService();

// Export types
export type {
  CreateTopicData,
  Topic,
  TopicApiResponse,
  TopicFilters,
  TopicListResponse,
  TopicStatistics,
  UpdateTopicData,
};
