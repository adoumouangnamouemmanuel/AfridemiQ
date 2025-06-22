/**
 * @file User Type Definitions - MVP Version
 * @description Simplified type definitions for user-related data structures matching the MVP MongoDB user model
 * @module types/user/user.types
 */

/**
 * User roles available in the system (MVP)
 */
export type UserRole = "student" | "admin";

/**
 * Countries supported in MVP (Africa-focused)
 */
export type Country =
  | "nigeria"
  | "ghana"
  | "kenya"
  | "cameroon"
  | "senegal"
  | "chad";

/**
 * Exam types supported in MVP
 */
export type ExamType = "waec" | "neco" | "jamb" | "kcse" | "bac" | "bepc";

/**
 * Education levels in MVP
 */
export interface SocialLink {
  platform: "twitter" | "linkedin" | "github"; // Extend as needed
  url: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  general: boolean;
  dailyReminderTime?: string;
  challengeNotifications: boolean;
  progressUpdates: boolean;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  notifications: NotificationPreferences;
  darkMode: boolean;
  fontSize: FontSize;
  preferredContentFormat: ContentFormat;
  enableHints: boolean;
  autoPlayAudio: boolean;
  showStepSolutions: boolean;
  leaderboardVisibility: boolean;
  allowFriendRequests: boolean;
  studyField?: string;
  targetUniversity?: string;
  studyHours?: number;
  favoriteSubjects?: string[];
  careerGoal?: string;
}

/**
 * Learning settings and preferences
 */
export interface LearningSettings {
  learningStyle: LearningStyle;
  motivation?: string;
  preferredStudySessionLength?: number;
}

/**
 * User streak information
 */
export interface UserStreak {
  current: number;
  longest: number;
  lastStudyDate?: string | Date;
}

/**
 * Progress summary statistics
 */
export interface ProgressSummary {
  completedPercentage?: number;
  remainingTopics?: number;
}

/**
 * User progress and learning data
 */
export interface UserProgress {
  selectedExam?: string;
  selectedSeries?: string;
  selectedLevel?: string;
  xp: number;
  level: number;
  streak: UserStreak;
  goalDate?: string | Date;
  totalQuizzes: number;
  averageScore: number;
  completedTopics: string[];
  weakSubjects: string[];
  badges: string[];
  achievements: string[];
  examYear?: string;
  progressSummary?: ProgressSummary;
}

/**
 * User subscription details
 */
export interface UserSubscription {
  type: SubscriptionType;
  startDate: string | Date;
  expiresAt?: string | Date;
  paymentStatus: PaymentStatus;
  trialPeriod?: TrialPeriod;
  features: string[];
  accessLevel: AccessLevel;
}

/**
 * Social profile information
 */
export interface SocialProfile {
  bio?: string;
  publicAchievements: string[];
  visibility: ProfileVisibility;
  socialLinks: SocialLink[];
}

/**
 * Complete user profile interface matching the MongoDB model
 */
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  avatar?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  country?: string;
  timeZone?: string;
  preferredLanguage?: string;
  schoolName?: string;
  gradeLevel?: string;
  parentEmail?: string;
  role: UserRole;
  lastLogin?: string | Date;
  isPremium: boolean;
  subscription: UserSubscription;
  preferences: UserPreferences;
  settings: LearningSettings;
  progress: UserProgress;
  analyticsId?: string;
  notes: string[];
  hintsUsed: string[];
  bookmarks: string[];
  friends: string[];
  blockedUsers: string[];
  tutorId?: string;
  socialProfile: SocialProfile;
  onboardingStatusId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Simplified user interface for frontend context (derived from UserProfile)
 */
export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  country?: string;
  selectedExam?: string;
  goalDate?: Date;
  xp: number;
  level: number;
  streak: number;
  avatar?: string;
  badges: string[];
  completedTopics: string[];
  weakSubjects: string[];
  isPremium: boolean;
  role: UserRole;
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
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

/**
 * Data structure for updating basic profile information
 */
export interface UpdateProfileData {
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
  gender?: string;
  dateOfBirth?: Date;
  selectedExam?: string;
  learningStyle?: string;
  bio?: string;
}

/**
 * Data structure for updating user preferences
 */
export interface UpdatePreferencesData {
  preferences: Partial<UserPreferences>;
}

/**
 * Data structure for updating user progress
 */
export interface UpdateProgressData {
  selectedExam?: string;
  selectedSeries?: string;
  selectedLevel?: string;
  xp?: number;
  level?: number;
  streak?: Partial<UserStreak>;
  goalDate?: string | Date;
  totalQuizzes?: number;
  averageScore?: number;
  completedTopics?: string[];
  weakSubjects?: string[];
  badges?: string[];
  achievements?: string[];
}

/**
 * Data structure for updating social profile
 */
export interface UpdateSocialProfileData {
  bio?: string;
  publicAchievements?: string[];
  visibility?: ProfileVisibility;
  socialLinks?: SocialLink[];
}

/**
 * User registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender?: string;
  dateOfBirth?: string | Date;
  preferredLanguage?: string;
  role?: string;
}

/**
 * User login credentials
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Refresh token data
 */
export interface RefreshTokenData {
  refreshToken: string;
}

/**
 * Search results response structure
 */
export interface SearchUsersResponse {
  users: Partial<User>[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  message: string;
  data: T;
}

/**
 * User context type for React context
 */
export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  handleTokenExpiration: () => Promise<void>;
  refreshUserSession: () => Promise<void>;
  gracefulLogout: () => Promise<void>;
  isLoading: boolean;
  isSessionHealthy: boolean;
  lastRefreshTime: Date | null;
}

/**
 * Friend object structure
 */
export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
}


// New TypeScript interfaces for modular update payloads
export interface UpdateBioData {
  bio?: string;
}

export interface UpdatePersonalInfoData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  timeZone?: string;
  preferredLanguage?: string;
  dateOfBirth?: Date;
  gender?: string;
}

export interface UpdateEducationData {
  schoolName?: string;
  gradeLevel?: string;
  parentEmail?: string;
  studyField?: string;
  studyHours?: number;
}

export interface UpdateExamPreparationData {
  selectedExam?: string;
  examYear?: number;
}

export interface UpdateSinglePreferenceData {
  key: string;
  value: any;
}