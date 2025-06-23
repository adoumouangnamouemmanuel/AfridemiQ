import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../constants/url";
import type {
  AddExamToSubjectData,
  BulkSubjectCreate,
  BulkSubjectResult,
  BulkSubjectUpdate,
  CreateSubjectData,
  RateSubjectData,
  Subject,
  SubjectAdvancedSearchResponse,
  SubjectAnalytics,
  SubjectApiResponse,
  SubjectComparison,
  SubjectExportData,
  SubjectFilters,
  SubjectListResponse,
  SubjectPerformance,
  SubjectSuggestion,
  UpdateSubjectData,
} from "../../types/learning/subject.types";

/**
 * Subject API Service
 * Handles all subject-related API operations following the same pattern as curriculum and topic services
 */
class SubjectApiService {
  private baseUrl: string;
  private requestCache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = `${API_BASE_URL}/subjects`;
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
      console.log(`🗄️ SubjectAPI - Using cached data for: ${cacheKey}`);
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
      console.error("🔑 SubjectAPI - Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Makes an authenticated API request with caching and deduplication
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<SubjectApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Check cache for GET requests
    if (!options.method || options.method === "GET") {
      const cachedData = this.getCachedData<SubjectApiResponse<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Check if request is already ongoing
      const ongoingRequest = this.ongoingRequests.get(cacheKey);
      if (ongoingRequest) {
        console.log(`⏳ SubjectAPI - Waiting for ongoing request: ${url}`);
        return ongoingRequest;
      }
    }

    console.log(`🌐 SubjectAPI - Making request to: ${url}`);
    console.log(`🌐 SubjectAPI - Method: ${options.method || "GET"}`);

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
  ): Promise<SubjectApiResponse<T>> {
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

      console.log(`🌐 SubjectAPI - Headers:`, {
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

      console.log(`🌐 SubjectAPI - Response status: ${response.status}`);

      // Handle rate limiting
      if (response.status === 429) {
        console.warn(
          `🌐 SubjectAPI - Rate limited, will use cache or fallback`
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
        console.log(`🌐 SubjectAPI - Non-JSON response:`, text);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      console.log(`🌐 SubjectAPI - Response data:`, responseData);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(`🌐 SubjectAPI - Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
        });
        throw new Error(errorMessage);
      }

      // Return the parsed data
      return responseData as SubjectApiResponse<T>;
    } catch (error) {
      console.error(`🌐 SubjectAPI - Request error:`, {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Get all subjects with optional filters
   */
  async getSubjects(filters?: SubjectFilters): Promise<SubjectListResponse> {
    console.log(`📚 SubjectAPI - Getting subjects with filters:`, filters);

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
        subjects: response.data || [],
        pagination: response.pagination || {
          current: 1,
          pages: 0,
          total: 0,
          limit: 10,
        },
      };
    } catch (error) {
      console.error(`📚 SubjectAPI - Error getting subjects:`, error);
      throw error;
    }
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(id: string): Promise<Subject> {
    console.log(`🔍 SubjectAPI - Getting subject by ID: ${id}`);

    try {
      const response = await this.makeRequest<any>(`/${id}`);

      if (!response.data) {
        throw new Error("No subject data received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔍 SubjectAPI - Error getting subject by ID:`, error);
      throw error;
    }
  }

  /**
   * Get subjects by series
   */
  async getSubjectsBySeries(
    series: string,
    options?: SubjectFilters
  ): Promise<SubjectListResponse> {
    console.log(`📋 SubjectAPI - Getting subjects by series: ${series}`);

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

      // Handle the actual backend response format
      console.log(`📋 SubjectAPI - Raw response structure:`, {
        hasData: !!response.data,
        dataType: Array.isArray(response.data) ? "array" : typeof response.data,
        dataLength: response.data?.length,
        hasPagination: !!response.pagination,
        message: response.message,
      });

      return {
        subjects: response.data || [],
        pagination: response.pagination || {
          current: 1,
          pages: 0,
          total: 0,
          limit: 10,
        },
      };
    } catch (error) {
      console.error(`📋 SubjectAPI - Error getting subjects by series:`, error);
      throw error;
    }
  }

  /**
   * Advanced search subjects
   */
  async advancedSearch(
    searchParams: Record<string, any>
  ): Promise<SubjectAdvancedSearchResponse> {
    console.log(`🔍 SubjectAPI - Advanced search:`, searchParams);

    try {
      const queryParams = new URLSearchParams();

      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await this.makeRequest<any>(
        `/search?${queryParams.toString()}`
      );

      return {
        subjects: response.data?.subjects || response.data || [],
        pagination: response.pagination || {
          current: 1,
          pages: 0,
          total: 0,
          limit: 10,
        },
        facets: response.facets || {
          categories: [],
          difficulties: [],
          series: [],
          tags: [],
        },
        searchParams: response.searchParams || {},
      };
    } catch (error) {
      console.error(`🔍 SubjectAPI - Error in advanced search:`, error);
      throw error;
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(
    query: string,
    limit = 10
  ): Promise<SubjectSuggestion[]> {
    console.log(`💡 SubjectAPI - Getting search suggestions for: ${query}`);

    try {
      const response = await this.makeRequest<any>(
        `/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      return response.data || [];
    } catch (error) {
      console.error(`💡 SubjectAPI - Error getting search suggestions:`, error);
      throw error;
    }
  }

  /**
   * Get trending subjects
   */
  async getTrendingSubjects(period = "week", limit = 10): Promise<Subject[]> {
    console.log(`📈 SubjectAPI - Getting trending subjects:`, {
      period,
      limit,
    });

    try {
      const response = await this.makeRequest<any>(
        `/trending?period=${period}&limit=${limit}`
      );

      return response.data || [];
    } catch (error) {
      console.error(`📈 SubjectAPI - Error getting trending subjects:`, error);
      throw error;
    }
  }

  /**
   * Get subject analytics
   */
  async getSubjectAnalytics(
    filters?: Record<string, any>
  ): Promise<SubjectAnalytics> {
    console.log(`📊 SubjectAPI - Getting subject analytics:`, filters);

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
            totalSubjects: 0,
            activeSubjects: 0,
            avgRating: 0,
            totalStudents: 0,
            totalExams: 0,
          },
          byCategory: [],
          byDifficulty: [],
          trending: [],
          topRated: [],
        }
      );
    } catch (error) {
      console.error(`📊 SubjectAPI - Error getting analytics:`, error);
      throw error;
    }
  }

  /**
   * Get subject performance
   */
  async getSubjectPerformance(subjectId: string): Promise<SubjectPerformance> {
    console.log(`📈 SubjectAPI - Getting subject performance: ${subjectId}`);

    try {
      const response = await this.makeRequest<any>(`/${subjectId}/performance`);

      if (!response.data) {
        throw new Error("No performance data received");
      }

      return response.data;
    } catch (error) {
      console.error(
        `📈 SubjectAPI - Error getting subject performance:`,
        error
      );
      throw error;
    }
  }

  /**
   * Compare subjects
   */
  async compareSubjects(subjectIds: string[]): Promise<SubjectComparison> {
    console.log(`🔄 SubjectAPI - Comparing subjects:`, subjectIds);

    try {
      const response = await this.makeRequest<any>("/compare", {
        method: "POST",
        body: JSON.stringify({ ids: subjectIds }),
      });

      if (!response.data) {
        throw new Error("No comparison data received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔄 SubjectAPI - Error comparing subjects:`, error);
      throw error;
    }
  }

  /**
   * Create a new subject (admin/teacher only)
   */
  async createSubject(subjectData: CreateSubjectData): Promise<Subject> {
    console.log(`➕ SubjectAPI - Creating subject:`, subjectData);

    try {
      const response = await this.makeRequest<any>("/", {
        method: "POST",
        body: JSON.stringify(subjectData),
      });

      if (!response.data) {
        throw new Error("No subject data received after creation");
      }

      return response.data;
    } catch (error) {
      console.error(`➕ SubjectAPI - Error creating subject:`, error);
      throw error;
    }
  }

  /**
   * Update subject (admin/teacher only)
   */
  async updateSubject(
    id: string,
    updateData: UpdateSubjectData
  ): Promise<Subject> {
    console.log(`✏️ SubjectAPI - Updating subject ${id}:`, updateData);

    try {
      const response = await this.makeRequest<any>(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.data) {
        throw new Error("No subject data received after update");
      }

      return response.data;
    } catch (error) {
      console.error(`✏️ SubjectAPI - Error updating subject:`, error);
      throw error;
    }
  }

  /**
   * Delete subject (admin/teacher only)
   */
  async deleteSubject(id: string): Promise<void> {
    console.log(`🗑️ SubjectAPI - Deleting subject: ${id}`);

    try {
      await this.makeRequest<any>(`/${id}`, {
        method: "DELETE",
      });

      console.log(`🗑️ SubjectAPI - Successfully deleted subject: ${id}`);
    } catch (error) {
      console.error(`🗑️ SubjectAPI - Error deleting subject:`, error);
      throw error;
    }
  }

  /**
   * Rate a subject
   */
  async rateSubject(id: string, ratingData: RateSubjectData): Promise<Subject> {
    console.log(`⭐ SubjectAPI - Rating subject ${id}:`, ratingData);

    try {
      const response = await this.makeRequest<any>(`/${id}/rate`, {
        method: "POST",
        body: JSON.stringify(ratingData),
      });

      if (!response.data) {
        throw new Error("No subject data received after rating");
      }

      return response.data;
    } catch (error) {
      console.error(`⭐ SubjectAPI - Error rating subject:`, error);
      throw error;
    }
  }

  /**
   * Add exam to subject (admin/teacher only)
   */
  async addExamToSubject(
    id: string,
    examData: AddExamToSubjectData
  ): Promise<Subject> {
    console.log(`📝 SubjectAPI - Adding exam to subject ${id}:`, examData);

    try {
      const response = await this.makeRequest<any>(`/${id}/exams`, {
        method: "POST",
        body: JSON.stringify(examData),
      });

      if (!response.data) {
        throw new Error("No subject data received after adding exam");
      }

      return response.data;
    } catch (error) {
      console.error(`📝 SubjectAPI - Error adding exam to subject:`, error);
      throw error;
    }
  }

  /**
   * Remove exam from subject (admin/teacher only)
   */
  async removeExamFromSubject(id: string, examId: string): Promise<Subject> {
    console.log(`🗑️ SubjectAPI - Removing exam ${examId} from subject ${id}`);

    try {
      const response = await this.makeRequest<any>(`/${id}/exams/${examId}`, {
        method: "DELETE",
      });

      if (!response.data) {
        throw new Error("No subject data received after removing exam");
      }

      return response.data;
    } catch (error) {
      console.error(`🗑️ SubjectAPI - Error removing exam from subject:`, error);
      throw error;
    }
  }

  /**
   * Bulk create subjects (admin/teacher only)
   */
  async bulkCreateSubjects(
    subjectsData: BulkSubjectCreate
  ): Promise<BulkSubjectResult<Subject>> {
    console.log(`🔄 SubjectAPI - Bulk creating subjects:`, subjectsData);

    try {
      const response = await this.makeRequest<any>("/bulk", {
        method: "POST",
        body: JSON.stringify(subjectsData),
      });

      if (!response.data) {
        throw new Error("No bulk create result received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔄 SubjectAPI - Error bulk creating subjects:`, error);
      throw error;
    }
  }

  /**
   * Bulk update subjects (admin/teacher only)
   */
  async bulkUpdateSubjects(
    updatesData: BulkSubjectUpdate
  ): Promise<BulkSubjectResult<Subject>> {
    console.log(`🔄 SubjectAPI - Bulk updating subjects:`, updatesData);

    try {
      const response = await this.makeRequest<any>("/bulk", {
        method: "PUT",
        body: JSON.stringify(updatesData),
      });

      if (!response.data) {
        throw new Error("No bulk update result received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔄 SubjectAPI - Error bulk updating subjects:`, error);
      throw error;
    }
  }

  /**
   * Export subjects (admin/teacher only)
   */
  async exportSubjects(
    filters?: Record<string, any>,
    format: "json" | "csv" = "json"
  ): Promise<SubjectExportData> {
    console.log(`📤 SubjectAPI - Exporting subjects:`, { filters, format });

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("format", format);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await this.makeRequest<any>(
        `/export?${queryParams.toString()}`
      );

      if (!response.data) {
        throw new Error("No export data received");
      }

      return response.data;
    } catch (error) {
      console.error(`📤 SubjectAPI - Error exporting subjects:`, error);
      throw error;
    }
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    console.log(`🔧 SubjectAPI - Testing connection`);

    try {
      await this.getSubjectAnalytics();
      console.log(`🔧 SubjectAPI - Connection test successful`);
      return true;
    } catch (error) {
      console.error(`🔧 SubjectAPI - Connection test failed:`, error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.requestCache.clear();
    this.ongoingRequests.clear();
    console.log("🗄️ SubjectAPI - Cache cleared");
  }
}

// Export singleton instance
export const subjectApiService = new SubjectApiService();

// Export types
export type {
  CreateSubjectData,
  Subject,
  SubjectAdvancedSearchResponse,
  SubjectApiResponse,
  SubjectFilters,
  SubjectListResponse,
  UpdateSubjectData,
};
