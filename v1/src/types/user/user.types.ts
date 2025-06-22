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
export type EducationLevel = "junior_secondary" | "senior_secondary" // SSS/Lycée (Ages 15-18);

/**
 * Languages supported in MVP
 */
export type Language = "english" | "french";

/**
 * Gender options in MVP
 */
export type Gender = "male" | "female" | "prefer_not_to_say";

/**
 * User progress tracking (simplified for MVP)
 */
export interface UserProgress {
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  averageScore: number;
}

/**
 * Complete user profile interface matching the MVP MongoDB model
 */
export interface UserProfile {
  _id: string;
  name: string;
  email: string;

  // Africa-specific onboarding fields
  country?: Country;
  examType?: ExamType;
  educationLevel?: EducationLevel;

  // Optional personal information
  dateOfBirth?: string | Date;
  gender?: Gender;
  phoneNumber?: string;

  // Onboarding status
  onboardingCompleted: boolean;

  // Basic preferences
  preferredLanguage: Language;

  // Simplified progress tracking
  progress: UserProgress;

  // User management
  role: UserRole;
  isPremium: boolean;
  isActive: boolean;
  lastLogin?: string | Date;

  // Timestamps
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
  country?: Country;
  examType?: ExamType;
  educationLevel?: EducationLevel;
  preferredLanguage: Language;
  onboardingCompleted: boolean;
  progress: UserProgress;
  isPremium: boolean;
  role: UserRole;
  dateOfBirth?: Date;
  gender?: Gender;
  phoneNumber?: string;
}

/**
 * Authentication response from backend (MVP)
 */
export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    country?: string;
    examType?: string;
    educationLevel?: string;
    preferredLanguage: string;
    onboardingCompleted: boolean;
    progress: {
      totalQuizzesTaken: number;
      totalQuestionsAnswered: number;
      averageScore: number;
    };
    isPremium: boolean;
    role: string;
    dateOfBirth?: string;
    gender?: string;
    phoneNumber?: string;
  };
  token: string;
  refreshToken?: string;
}

/**
 * User registration data (MVP)
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * User login credentials
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Onboarding data (Africa-specific, required after registration)
 */
export interface OnboardingData {
  country: Country;
  examType: ExamType;
  educationLevel: EducationLevel;
  preferredLanguage: Language;
}

/**
 * Basic profile update data (MVP)
 */
export interface UpdateProfileData {
  name?: string;
  phoneNumber?: string;
  preferredLanguage?: Language;
}

/**
 * Personal information update data
 */
export interface UpdatePersonalInfoData {
  name?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  phoneNumber?: string;
}

/**
 * Password management schemas
 */
export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
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