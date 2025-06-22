import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../constants/url";
import type {
  Quiz,
  CreateQuizData,
  UpdateQuizData,
  QuizFilters,
  QuizListResponse,
  QuizSearchResponse,
  QuizApiResponse,
  UpdateQuizStatsData,
  PopularQuizFilters,
  QuizAnalytics,
  QuizComparison,
} from "../../types/assessment/quiz.types";

/**
 * Quiz API Service
 * Handles all quiz-related API operations following the same pattern as subject service
 */
class QuizApiService {
  private baseUrl: string;
  private requestCache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = `${API_BASE_URL}/quizzes`;
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
      console.log(`🗄️ QuizAPI - Using cached data for: ${cacheKey}`);
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
      console.error("🔑 QuizAPI - Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Makes an authenticated API request with caching and deduplication
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<QuizApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Check cache for GET requests
    if (!options.method || options.method === "GET") {
      const cachedData = this.getCachedData<QuizApiResponse<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Check if request is already ongoing
      const ongoingRequest = this.ongoingRequests.get(cacheKey);
      if (ongoingRequest) {
        console.log(`⏳ QuizAPI - Waiting for ongoing request: ${url}`);
        return ongoingRequest;
      }
    }

    console.log(`🌐 QuizAPI - Making request to: ${url}`);
    console.log(`🌐 QuizAPI - Method: ${options.method || "GET"}`);

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
  ): Promise<QuizApiResponse<T>> {
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

      console.log(`🌐 QuizAPI - Headers:`, {
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

      console.log(`🌐 QuizAPI - Response status: ${response.status}`);

      // Handle rate limiting
      if (response.status === 429) {
        console.warn(`🌐 QuizAPI - Rate limited, will use cache or fallback`);
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      // Parse response
      let responseData: any;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        console.log(`🌐 QuizAPI - Non-JSON response:`, text);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      console.log(`🌐 QuizAPI - Response data:`, responseData);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(`🌐 QuizAPI - Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
        });
        throw new Error(errorMessage);
      }

      // Return the parsed data
      return responseData as QuizApiResponse<T>;
    } catch (error) {
      console.error(`🌐 QuizAPI - Request error:`, {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Get all quizzes with optional filters
   */
  async getQuizzes(filters?: QuizFilters): Promise<QuizListResponse> {
    console.log(`🧩 QuizAPI - Getting quizzes with filters:`, filters);

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
        quizzes: response.data?.quizzes || response.data || [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch (error) {
      console.error(`🧩 QuizAPI - Error getting quizzes:`, error);
      throw error;
    }
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(id: string): Promise<Quiz> {
    console.log(`🔍 QuizAPI - Getting quiz by ID: ${id}`);

    try {
      const response = await this.makeRequest<any>(`/${id}`);

      if (!response.data) {
        throw new Error("No quiz data received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔍 QuizAPI - Error getting quiz by ID:`, error);
      throw error;
    }
  }

  /**
   * Get popular quizzes
   */
  async getPopularQuizzes(filters?: PopularQuizFilters): Promise<Quiz[]> {
    console.log(`📈 QuizAPI - Getting popular quizzes:`, filters);

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
        ? `/popular/list?${queryParams.toString()}`
        : "/popular/list";
      const response = await this.makeRequest<any>(endpoint);

      return response.data?.quizzes || response.data || [];
    } catch (error) {
      console.error(`📈 QuizAPI - Error getting popular quizzes:`, error);
      throw error;
    }
  }

  /**
   * Get quizzes by subject
   */
  async getQuizzesBySubject(
    subjectId: string,
    filters?: QuizFilters
  ): Promise<Quiz[]> {
    console.log(`📋 QuizAPI - Getting quizzes by subject: ${subjectId}`);

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
        ? `/subject/${subjectId}?${queryParams.toString()}`
        : `/subject/${subjectId}`;
      const response = await this.makeRequest<any>(endpoint);

      return response.data?.quizzes || response.data || [];
    } catch (error) {
      console.error(`📋 QuizAPI - Error getting quizzes by subject:`, error);
      throw error;
    }
  }

  /**
   * Get quizzes by topic
   */
  async getQuizzesByTopic(
    topicId: string,
    filters?: QuizFilters
  ): Promise<Quiz[]> {
    console.log(`📖 QuizAPI - Getting quizzes by topic: ${topicId}`);

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
        ? `/topic/${topicId}?${queryParams.toString()}`
        : `/topic/${topicId}`;
      const response = await this.makeRequest<any>(endpoint);

      return response.data?.quizzes || response.data || [];
    } catch (error) {
      console.error(`📖 QuizAPI - Error getting quizzes by topic:`, error);
      throw error;
    }
  }

  /**
   * Get quizzes by education level and exam type
   */
  async getQuizzesByEducationAndExam(
    educationLevel: string,
    examType: string,
    filters?: QuizFilters
  ): Promise<Quiz[]> {
    console.log(`🎓 QuizAPI - Getting quizzes by education and exam:`, {
      educationLevel,
      examType,
    });

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
        ? `/education/${educationLevel}/exam/${examType}?${queryParams.toString()}`
        : `/education/${educationLevel}/exam/${examType}`;
      const response = await this.makeRequest<any>(endpoint);

      return response.data?.quizzes || response.data || [];
    } catch (error) {
      console.error(
        `🎓 QuizAPI - Error getting quizzes by education and exam:`,
        error
      );
      throw error;
    }
  }

  /**
   * Search quizzes
   */
  async searchQuizzes(
    searchTerm: string,
    filters?: QuizFilters
  ): Promise<QuizSearchResponse> {
    console.log(`🔍 QuizAPI - Searching quizzes:`, { searchTerm, filters });

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("q", searchTerm);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await this.makeRequest<any>(
        `/search/query?${queryParams.toString()}`
      );

      return {
        quizzes: response.data?.quizzes || response.data || [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        searchTerm,
      };
    } catch (error) {
      console.error(`🔍 QuizAPI - Error searching quizzes:`, error);
      throw error;
    }
  }

  /**
   * Update quiz stats
   */
  async updateQuizStats(
    quizId: string,
    statsData: UpdateQuizStatsData
  ): Promise<Quiz> {
    console.log(`📊 QuizAPI - Updating quiz stats: ${quizId}`);

    try {
      const response = await this.makeRequest<any>(`/${quizId}/stats`, {
        method: "POST",
        body: JSON.stringify(statsData),
      });

      if (!response.data) {
        throw new Error("No quiz data received after stats update");
      }

      return response.data;
    } catch (error) {
      console.error(`📊 QuizAPI - Error updating quiz stats:`, error);
      throw error;
    }
  }

  /**
   * Create a new quiz (admin/teacher only)
   */
  async createQuiz(quizData: CreateQuizData): Promise<Quiz> {
    console.log(`➕ QuizAPI - Creating quiz:`, quizData);

    try {
      const response = await this.makeRequest<any>("/", {
        method: "POST",
        body: JSON.stringify(quizData),
      });

      if (!response.data) {
        throw new Error("No quiz data received after creation");
      }

      return response.data;
    } catch (error) {
      console.error(`➕ QuizAPI - Error creating quiz:`, error);
      throw error;
    }
  }

  /**
   * Update quiz (admin/teacher only)
   */
  async updateQuiz(id: string, updateData: UpdateQuizData): Promise<Quiz> {
    console.log(`✏️ QuizAPI - Updating quiz ${id}:`, updateData);

    try {
      const response = await this.makeRequest<any>(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.data) {
        throw new Error("No quiz data received after update");
      }

      return response.data;
    } catch (error) {
      console.error(`✏️ QuizAPI - Error updating quiz:`, error);
      throw error;
    }
  }

  /**
   * Delete quiz (admin/teacher only)
   */
  async deleteQuiz(id: string): Promise<void> {
    console.log(`🗑️ QuizAPI - Deleting quiz: ${id}`);

    try {
      await this.makeRequest<any>(`/${id}`, {
        method: "DELETE",
      });

      console.log(`🗑️ QuizAPI - Successfully deleted quiz: ${id}`);
    } catch (error) {
      console.error(`🗑️ QuizAPI - Error deleting quiz:`, error);
      throw error;
    }
  }

  /**
   * Get quiz analytics
   */
  async getQuizAnalytics(
    filters?: Record<string, any>
  ): Promise<QuizAnalytics> {
    console.log(`📊 QuizAPI - Getting quiz analytics:`, filters);

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
            totalQuizzes: 0,
            activeQuizzes: 0,
            averageScore: 0,
            totalAttempts: 0,
            passRate: 0,
          },
          byFormat: [],
          byDifficulty: [],
          topPerforming: [],
          mostPopular: [],
        }
      );
    } catch (error) {
      console.error(`📊 QuizAPI - Error getting analytics:`, error);
      throw error;
    }
  }

  /**
   * Compare quizzes
   */
  async compareQuizzes(quizIds: string[]): Promise<QuizComparison> {
    console.log(`🔄 QuizAPI - Comparing quizzes:`, quizIds);

    try {
      const response = await this.makeRequest<any>("/compare", {
        method: "POST",
        body: JSON.stringify({ ids: quizIds }),
      });

      if (!response.data) {
        throw new Error("No comparison data received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔄 QuizAPI - Error comparing quizzes:`, error);
      throw error;
    }
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    console.log(`🔧 QuizAPI - Testing connection`);

    try {
      await this.getQuizzes({ limit: 1 });
      console.log(`🔧 QuizAPI - Connection test successful`);
      return true;
    } catch (error) {
      console.error(`🔧 QuizAPI - Connection test failed:`, error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.requestCache.clear();
    this.ongoingRequests.clear();
    console.log("🗄️ QuizAPI - Cache cleared");
  }
}

// Export singleton instance
export const quizApiService = new QuizApiService();

// Export types
export type {
  Quiz,
  CreateQuizData,
  UpdateQuizData,
  QuizFilters,
  QuizListResponse,
  QuizApiResponse,
};
