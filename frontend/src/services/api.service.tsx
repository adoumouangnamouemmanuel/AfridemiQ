const API_BASE_URL = "http://192.168.223.246:3000/api"; // Change to your backend URL

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

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.data;
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export type { AuthResponse, RegisterData, LoginData };