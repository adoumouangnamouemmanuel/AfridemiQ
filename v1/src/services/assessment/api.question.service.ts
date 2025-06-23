import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../constants/url";
import type {
  Question,
  CreateQuestionData,
  UpdateQuestionData,
  QuestionFilters,
  QuestionListResponse,
  QuestionSearchResponse,
  QuestionApiResponse,
  CheckAnswerData,
  CheckAnswerResponse,
  UpdateQuestionStatsData,
  RandomQuestionsFilters,
  BulkQuestionCreate,
  BulkQuestionUpdate,
  BulkQuestionResult,
} from "../../types/assessment/question.types";

/**
 * Question API Service
 * Handles all question-related API operations following the same pattern as subject service
 */
class QuestionApiService {
  private baseUrl: string;
  private requestCache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = `${API_BASE_URL}/questions`;
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
      console.log(`🗄️ QuestionAPI - Using cached data for: ${cacheKey}`);
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
      console.error("🔑 QuestionAPI - Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Makes an authenticated API request with caching and deduplication
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<QuestionApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Check cache for GET requests
    if (!options.method || options.method === "GET") {
      const cachedData = this.getCachedData<QuestionApiResponse<T>>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Check if request is already ongoing
      const ongoingRequest = this.ongoingRequests.get(cacheKey);
      if (ongoingRequest) {
        console.log(`⏳ QuestionAPI - Waiting for ongoing request: ${url}`);
        return ongoingRequest;
      }
    }

    console.log(`🌐 QuestionAPI - Making request to: ${url}`);
    console.log(`🌐 QuestionAPI - Method: ${options.method || "GET"}`);

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
  ): Promise<QuestionApiResponse<T>> {
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

      console.log(`🌐 QuestionAPI - Headers:`, {
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

      console.log(`🌐 QuestionAPI - Response status: ${response.status}`);

      // Handle rate limiting
      if (response.status === 429) {
        console.warn(
          `🌐 QuestionAPI - Rate limited, will use cache or fallback`
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
        console.log(`🌐 QuestionAPI - Non-JSON response:`, text);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      console.log(`🌐 QuestionAPI - Response data:`, responseData);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(`🌐 QuestionAPI - Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
        });
        throw new Error(errorMessage);
      }

      // Return the parsed data
      return responseData as QuestionApiResponse<T>;
    } catch (error) {
      console.error(`🌐 QuestionAPI - Request error:`, {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Get all questions with optional filters
   */
  async getQuestions(filters?: QuestionFilters): Promise<QuestionListResponse> {
    console.log(`❓ QuestionAPI - Getting questions with filters:`, filters);

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
        questions: response.data?.questions || response.data || [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch (error) {
      console.error(`❓ QuestionAPI - Error getting questions:`, error);
      throw error;
    }
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: string): Promise<Question> {
    console.log(`🔍 QuestionAPI - Getting question by ID: ${id}`);

    try {
      const response = await this.makeRequest<any>(`/${id}`);

      if (!response.data) {
        throw new Error("No question data received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔍 QuestionAPI - Error getting question by ID:`, error);
      throw error;
    }
  }

  /**
   * Get questions by subject
   */
  async getQuestionsBySubject(
    subjectId: string,
    filters?: QuestionFilters
  ): Promise<Question[]> {
    console.log(`📋 QuestionAPI - Getting questions by subject: ${subjectId}`);

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

      return response.data?.questions || response.data || [];
    } catch (error) {
      console.error(
        `📋 QuestionAPI - Error getting questions by subject:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get questions by topic
   */
  async getQuestionsByTopic(
    topicId: string,
    filters?: QuestionFilters
  ): Promise<Question[]> {
    console.log(`📖 QuestionAPI - Getting questions by topic: ${topicId}`);

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

      return response.data?.questions || response.data || [];
    } catch (error) {
      console.error(
        `📖 QuestionAPI - Error getting questions by topic:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get random questions
   */
  async getRandomQuestions(
    filters?: RandomQuestionsFilters
  ): Promise<Question[]> {
    console.log(`🎲 QuestionAPI - Getting random questions:`, filters);

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
        ? `/random/list?${queryParams.toString()}`
        : "/random/list";
      const response = await this.makeRequest<any>(endpoint);

      return response.data?.questions || response.data || [];
    } catch (error) {
      console.error(`🎲 QuestionAPI - Error getting random questions:`, error);
      throw error;
    }
  }

  /**
   * Search questions
   */
  async searchQuestions(
    searchTerm: string,
    filters?: QuestionFilters
  ): Promise<QuestionSearchResponse> {
    console.log(`🔍 QuestionAPI - Searching questions:`, {
      searchTerm,
      filters,
    });

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
        questions: response.data?.questions || response.data || [],
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
      console.error(`🔍 QuestionAPI - Error searching questions:`, error);
      throw error;
    }
  }

  /**
   * Check answer
   */
  async checkAnswer(
    questionId: string,
    answerData: CheckAnswerData
  ): Promise<CheckAnswerResponse> {
    console.log(`✅ QuestionAPI - Checking answer for question: ${questionId}`);

    try {
      const response = await this.makeRequest<any>(`/${questionId}/check`, {
        method: "POST",
        body: JSON.stringify(answerData),
      });

      if (!response.data) {
        throw new Error("No answer check data received");
      }

      return response.data;
    } catch (error) {
      console.error(`✅ QuestionAPI - Error checking answer:`, error);
      throw error;
    }
  }

  /**
   * Update question stats
   */
  async updateQuestionStats(
    questionId: string,
    statsData: UpdateQuestionStatsData
  ): Promise<Question> {
    console.log(`📊 QuestionAPI - Updating question stats: ${questionId}`);

    try {
      const response = await this.makeRequest<any>(`/${questionId}/stats`, {
        method: "POST",
        body: JSON.stringify(statsData),
      });

      if (!response.data) {
        throw new Error("No question data received after stats update");
      }

      return response.data;
    } catch (error) {
      console.error(`📊 QuestionAPI - Error updating question stats:`, error);
      throw error;
    }
  }

  /**
   * Create a new question (admin/teacher only)
   */
  async createQuestion(questionData: CreateQuestionData): Promise<Question> {
    console.log(`➕ QuestionAPI - Creating question:`, questionData);

    try {
      const response = await this.makeRequest<any>("/", {
        method: "POST",
        body: JSON.stringify(questionData),
      });

      if (!response.data) {
        throw new Error("No question data received after creation");
      }

      return response.data;
    } catch (error) {
      console.error(`➕ QuestionAPI - Error creating question:`, error);
      throw error;
    }
  }

  /**
   * Update question (admin/teacher only)
   */
  async updateQuestion(
    id: string,
    updateData: UpdateQuestionData
  ): Promise<Question> {
    console.log(`✏️ QuestionAPI - Updating question ${id}:`, updateData);

    try {
      const response = await this.makeRequest<any>(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.data) {
        throw new Error("No question data received after update");
      }

      return response.data;
    } catch (error) {
      console.error(`✏️ QuestionAPI - Error updating question:`, error);
      throw error;
    }
  }

  /**
   * Delete question (admin/teacher only)
   */
  async deleteQuestion(id: string): Promise<void> {
    console.log(`🗑️ QuestionAPI - Deleting question: ${id}`);

    try {
      await this.makeRequest<any>(`/${id}`, {
        method: "DELETE",
      });

      console.log(`🗑️ QuestionAPI - Successfully deleted question: ${id}`);
    } catch (error) {
      console.error(`🗑️ QuestionAPI - Error deleting question:`, error);
      throw error;
    }
  }

  /**
   * Bulk create questions (admin/teacher only)
   */
  async bulkCreateQuestions(
    questionsData: BulkQuestionCreate
  ): Promise<BulkQuestionResult<Question>> {
    console.log(`🔄 QuestionAPI - Bulk creating questions:`, questionsData);

    try {
      const response = await this.makeRequest<any>("/bulk", {
        method: "POST",
        body: JSON.stringify(questionsData),
      });

      if (!response.data) {
        throw new Error("No bulk create result received");
      }

      return response.data;
    } catch (error) {
      console.error(`🔄 QuestionAPI - Error bulk creating questions:`, error);
      throw error;
    }
  }

  /**
   * Bulk update questions (admin/teacher only)
   */
  async bulkUpdateQuestions(
    updatesData: BulkQuestionUpdate
  ): Promise<BulkQuestionResult<Question>> {
    console.log(`🔄 QuestionAPI - Bulk updating questions:`, updatesData);

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
      console.error(`🔄 QuestionAPI - Error bulk updating questions:`, error);
      throw error;
    }
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    console.log(`🔧 QuestionAPI - Testing connection`);

    try {
      await this.getQuestions({ limit: 1 });
      console.log(`🔧 QuestionAPI - Connection test successful`);
      return true;
    } catch (error) {
      console.error(`🔧 QuestionAPI - Connection test failed:`, error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.requestCache.clear();
    this.ongoingRequests.clear();
    console.log("🗄️ QuestionAPI - Cache cleared");
  }
}

// Export singleton instance
export const questionApiService = new QuestionApiService();

// Export types
export type {
  Question,
  CreateQuestionData,
  UpdateQuestionData,
  QuestionFilters,
  QuestionListResponse,
  QuestionApiResponse,
};
