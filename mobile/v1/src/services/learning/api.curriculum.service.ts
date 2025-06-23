import { API_BASE_URL } from "../../constants/url";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Curriculum } from "../../types/learning/curriculum.types";

/**
 * API Response wrapper interface
 */
interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
  code?: string;
}

/**
 * Curriculum API Service
 * Handles all curriculum-related API operations following the same pattern as your existing services
 */
class CurriculumApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/curricula`;
  }

  /**
   * Retrieves the stored authentication token from AsyncStorage.
   * @returns {Promise<string | null>} The token or null if retrieval fails.
   */
  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("🔑 CurriculumAPI - Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Makes an authenticated API request to the backend.
   * @param endpoint - The API endpoint path (e.g., /country/Tchad).
   * @param options - Fetch request options (method, headers, body, etc.).
   * @returns {Promise<ApiResponse<T>>} The API response with typed data.
   * @throws {Error} If the request fails or the response is not OK.
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    console.log(`🌐 CurriculumAPI - Making request to: ${url}`);
    console.log(`🌐 CurriculumAPI - Method: ${options.method || "GET"}`);

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

      console.log(`🌐 CurriculumAPI - Headers:`, {
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

      console.log(`🌐 CurriculumAPI - Response status: ${response.status}`);

      // Parse response
      let responseData: any;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        console.log(`🌐 CurriculumAPI - Non-JSON response:`, text);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      console.log(`🌐 CurriculumAPI - Response data:`, responseData);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(`🌐 CurriculumAPI - Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
        });
        throw new Error(errorMessage);
      }

      // Return the parsed data
      return responseData as ApiResponse<T>;
    } catch (error) {
      console.error(`🌐 CurriculumAPI - Request error:`, {
        url,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Get curriculum statistics
   */
  async getCurriculumStats(): Promise<any> {
    console.log(`📊 CurriculumAPI - Getting curriculum statistics`);

    try {
      const response = await this.makeRequest<any>("/stats");
      return response.data || response;
    } catch (error) {
      console.error(`📊 CurriculumAPI - Error getting stats:`, error);
      throw error;
    }
  }

  /**
   * Get all curricula with optional filters
   */
  async getCurricula(params?: {
    page?: number;
    limit?: number;
    country?: string;
    educationLevel?: string;
    series?: string;
    estimatedHours?: number;
    isActive?: boolean;
  }): Promise<{
    curricula: Curriculum[];
    pagination?: any;
  }> {
    console.log(`📚 CurriculumAPI - Getting curricula with params:`, params);

    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const endpoint = queryParams.toString()
        ? `?${queryParams.toString()}`
        : "";
      const response = await this.makeRequest<{
        curricula: Curriculum[];
        pagination?: any;
      }>(`/${endpoint}`);

      return response.data || { curricula: [] };
    } catch (error) {
      console.error(`📚 CurriculumAPI - Error getting curricula:`, error);
      throw error;
    }
  }

  /**
   * Get curriculum by ID
   */
  async getCurriculumById(id: string): Promise<Curriculum> {
    console.log(`🔍 CurriculumAPI - Getting curriculum by ID: ${id}`);

    try {
      const response = await this.makeRequest<Curriculum>(`/${id}`);

      if (!response.data) {
        throw new Error("No curriculum data received");
      }

      return response.data;
    } catch (error) {
      console.error(
        `🔍 CurriculumAPI - Error getting curriculum by ID:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get curricula by country - Main method used by your app
   */
  async getCurriculaByCountry(country: string): Promise<Curriculum[]> {
    console.log(
      `🌍 CurriculumAPI - Fetching curricula for country: ${country}`
    );

    try {
      const response = await this.makeRequest<Curriculum[]>(
        `/country/${encodeURIComponent(country)}`
      );

      console.log(`🌍 CurriculumAPI - Raw response:`, response);

      // Handle the response format from your backend
      let curricula: Curriculum[] = [];

      if (response.data) {
        // Your backend returns: { status: "success", data: [...] }
        curricula = Array.isArray(response.data)
          ? response.data
          : [response.data];
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        curricula = response as unknown as Curriculum[];
      } else {
        console.warn(
          `🌍 CurriculumAPI - Unexpected response format:`,
          response
        );
        curricula = [];
      }

      console.log(`🌍 CurriculumAPI - Processed curricula:`, {
        count: curricula.length,
        countries: curricula.map((c) => c.country),
        series: curricula.map((c) => c.series),
      });

      return curricula;
    } catch (error) {
      console.error(
        `🌍 CurriculumAPI - Error fetching curricula by country:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create a new curriculum (admin only)
   */
  async createCurriculum(
    curriculumData: Partial<Curriculum>
  ): Promise<Curriculum> {
    console.log(`➕ CurriculumAPI - Creating curriculum:`, curriculumData);

    try {
      const response = await this.makeRequest<Curriculum>("/", {
        method: "POST",
        body: JSON.stringify(curriculumData),
      });

      if (!response.data) {
        throw new Error("No curriculum data received after creation");
      }

      return response.data;
    } catch (error) {
      console.error(`➕ CurriculumAPI - Error creating curriculum:`, error);
      throw error;
    }
  }

  /**
   * Update curriculum (admin only)
   */
  async updateCurriculum(
    id: string,
    updateData: Partial<Curriculum>
  ): Promise<Curriculum> {
    console.log(`✏️ CurriculumAPI - Updating curriculum ${id}:`, updateData);

    try {
      const response = await this.makeRequest<Curriculum>(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.data) {
        throw new Error("No curriculum data received after update");
      }

      return response.data;
    } catch (error) {
      console.error(`✏️ CurriculumAPI - Error updating curriculum:`, error);
      throw error;
    }
  }

  /**
   * Delete curriculum (admin only)
   */
  async deleteCurriculum(id: string): Promise<void> {
    console.log(`🗑️ CurriculumAPI - Deleting curriculum: ${id}`);

    try {
      await this.makeRequest<any>(`/${id}`, {
        method: "DELETE",
      });

      console.log(`🗑️ CurriculumAPI - Successfully deleted curriculum: ${id}`);
    } catch (error) {
      console.error(`🗑️ CurriculumAPI - Error deleting curriculum:`, error);
      throw error;
    }
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    console.log(`🔧 CurriculumAPI - Testing connection`);

    try {
      await this.getCurriculumStats();
      console.log(`🔧 CurriculumAPI - Connection test successful`);
      return true;
    } catch (error) {
      console.error(`🔧 CurriculumAPI - Connection test failed:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const curriculumApiService = new CurriculumApiService();

// Export types
export type { Curriculum, ApiResponse };
