import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.223.246:3000/api"; // Change to your backend URL

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  country: string;
  avatar?: string;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  schoolName?: string;
  gradeLevel?: string;
  role: string;
  isPremium: boolean;
  preferences: {
    notifications: {
      general: boolean;
      dailyReminderTime?: string;
      challengeNotifications: boolean;
      progressUpdates: boolean;
    };
    darkMode: boolean;
    fontSize: string;
    preferredContentFormat: string;
    enableHints: boolean;
    autoPlayAudio: boolean;
    showStepSolutions: boolean;
    leaderboardVisibility: boolean;
    allowFriendRequests: boolean;
    multilingualSupport: string[];
  };
  progress: {
    selectedExam: string;
    selectedSeries?: string;
    selectedLevel?: string;
    xp: number;
    level: number;
    streak: {
      current: number;
      longest: number;
      lastStudyDate?: string;
    };
    goalDate?: string;
    totalQuizzes: number;
    averageScore: number;
    completedTopics: string[];
    weakSubjects: string[];
    badges: string[];
    achievements: string[];
  };
  socialProfile: {
    bio?: string;
    publicAchievements: string[];
    visibility: string;
    socialLinks: {
      platform: string;
      url: string;
    }[];
  };
  subscription: {
    type: string;
    startDate: string;
    expiresAt?: string;
    paymentStatus: string;
    accessLevel: string;
  };
  friends: string[];
  blockedUsers: string[];
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  timeZone?: string;
  preferredLanguage?: string;
  schoolName?: string;
  gradeLevel?: string;
  parentEmail?: string;
  avatar?: string;
}

interface UpdatePreferencesData {
  preferences: {
    notifications?: {
      general?: boolean;
      dailyReminderTime?: string;
      challengeNotifications?: boolean;
      progressUpdates?: boolean;
    };
    darkMode?: boolean;
    fontSize?: string;
    preferredContentFormat?: string;
    enableHints?: boolean;
    autoPlayAudio?: boolean;
    showStepSolutions?: boolean;
    leaderboardVisibility?: boolean;
    allowFriendRequests?: boolean;
    multilingualSupport?: string[];
  };
}

interface UpdateProgressData {
  selectedExam?: string;
  selectedSeries?: string;
  selectedLevel?: string;
  xp?: number;
  level?: number;
  streak?: {
    current?: number;
    longest?: number;
    lastStudyDate?: string;
  };
  goalDate?: string;
  totalQuizzes?: number;
  averageScore?: number;
  completedTopics?: string[];
  weakSubjects?: string[];
  badges?: string[];
  achievements?: string[];
}

class ProfileApiService {
  // Private method to get stored token
  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("Error getting stored token:", error);
      return null;
    }
  }

  // Private method to make authenticated requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getStoredToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
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

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>("/users/profile");
    return response.data;
  }

  // Update user profile
  async updateProfile(profileData: UpdateProfileData): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    return response.data;
  }

  // Update user preferences
  async updatePreferences(
    preferencesData: UpdatePreferencesData
  ): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>("/users/preferences", {
      method: "PUT",
      body: JSON.stringify(preferencesData),
    });
    return response.data;
  }

  // Update specific preference type
  async updatePreferenceType(type: string, value: any): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>(
      `/users/preferences/${type}`,
      {
        method: "PATCH",
        body: JSON.stringify({ value }),
      }
    );
    return response.data;
  }

  // Update user progress
  async updateProgress(progressData: UpdateProgressData): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>("/users/progress", {
      method: "PUT",
      body: JSON.stringify(progressData),
    });
    return response.data;
  }

  // Update social profile
  async updateSocialProfile(socialData: {
    bio?: string;
    publicAchievements?: string[];
    visibility?: string;
    socialLinks?: { platform: string; url: string }[];
  }): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>(
      "/users/social-profile",
      {
        method: "PUT",
        body: JSON.stringify(socialData),
      }
    );
    return response.data;
  }

  // Delete user account
  async deleteAccount(): Promise<void> {
    await this.makeRequest("/users/profile", {
      method: "DELETE",
    });
  }

  // TODO: Implement when friends system is ready
  // Get user friends
  async getFriends(): Promise<any[]> {
    // TODO: Implement actual API call when friends endpoint is ready
    // const response = await this.makeRequest<any[]>("/users/friends")
    // return response.data

    // Dummy data for now
    return [
      { id: "1", name: "John Doe", avatar: null, level: 5, xp: 1250 },
      { id: "2", name: "Jane Smith", avatar: null, level: 7, xp: 2100 },
      { id: "3", name: "Mike Johnson", avatar: null, level: 3, xp: 750 },
    ];
  }

  // TODO: Implement when friends system is ready
  // Add friend
  async addFriend(friendId: string): Promise<UserProfile> {
    // TODO: Implement actual API call when friends endpoint is ready
    // const response = await this.makeRequest<UserProfile>(`/users/friends/${friendId}`, {
    //   method: "POST",
    // })
    // return response.data

    throw new Error("Friends system not implemented yet");
  }

  // TODO: Implement when friends system is ready
  // Remove friend
  async removeFriend(friendId: string): Promise<UserProfile> {
    // TODO: Implement actual API call when friends endpoint is ready
    // const response = await this.makeRequest<UserProfile>(`/users/friends/${friendId}`, {
    //   method: "DELETE",
    // })
    // return response.data

    throw new Error("Friends system not implemented yet");
  }

  // TODO: Implement when search system is ready
  // Search users
  async searchUsers(
    query: string,
    page = 1,
    limit = 10
  ): Promise<{
    users: any[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    // TODO: Implement actual API call when search endpoint is ready
    // const response = await this.makeRequest<any>(`/users/search?search=${query}&page=${page}&limit=${limit}`)
    // return response.data

    // Dummy data for now
    return {
      users: [
        { id: "1", name: "John Doe", email: "john@example.com", level: 5 },
        { id: "2", name: "Jane Smith", email: "jane@example.com", level: 7 },
      ],
      pagination: {
        total: 2,
        page: 1,
        totalPages: 1,
        hasMore: false,
      },
    };
  }
}

export const profileApiService = new ProfileApiService();
export type {
  UserProfile,
  UpdateProfileData,
  UpdatePreferencesData,
  UpdateProgressData,
};