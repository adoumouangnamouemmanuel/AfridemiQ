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
 * User search parameters (MVP)
 */
export interface SearchUsersParams {
  search?: string;
  page?: number;
  limit?: number;
  country?: Country;
  examType?: ExamType;
  educationLevel?: EducationLevel;
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
 * Onboarding check data
 */
export interface CheckOnboardingData {
  userId: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * User context type for React context (MVP)
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
 * Form data for registration (matches your RegisterScreen)
 */
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Validation states for forms
 */
export interface ValidationState {
  isValid: boolean;
  error?: string;
}

/**
 * Password strength indicator
 */
export interface PasswordStrength {
  text: "Weak" | "Good" | "Strong";
  color: string;
}

/**
 * User stats for progress tracking
 */
export interface UserStats {
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  accuracy: number;
}

/**
 * User preferences (minimal for MVP)
 */
export interface UserPreferences {
  language: Language;
  notifications: boolean;
}

// =============== CONSTANTS FOR TYPE CHECKING ===============

export const COUNTRIES: Country[] = [
  "nigeria",
  "ghana",
  "kenya",
  "cameroon",
  "senegal",
  "chad",
];
export const EXAM_TYPES: ExamType[] = [
  "waec",
  "neco",
  "jamb",
  "kcse",
  "bac",
  "bepc",
];
export const EDUCATION_LEVELS: EducationLevel[] = [
  "junior_secondary",
  "senior_secondary",
];
export const LANGUAGES: Language[] = ["english", "french"];
export const GENDERS: Gender[] = ["male", "female", "prefer_not_to_say"];
export const USER_ROLES: UserRole[] = ["student", "admin"];

// =============== TYPE GUARDS ===============

export const isValidCountry = (country: string): country is Country => {
  return COUNTRIES.includes(country as Country);
};

export const isValidExamType = (examType: string): examType is ExamType => {
  return EXAM_TYPES.includes(examType as ExamType);
};

export const isValidEducationLevel = (
  level: string
): level is EducationLevel => {
  return EDUCATION_LEVELS.includes(level as EducationLevel);
};

export const isValidLanguage = (language: string): language is Language => {
  return LANGUAGES.includes(language as Language);
};

export const isValidGender = (gender: string): gender is Gender => {
  return GENDERS.includes(gender as Gender);
};

export const isValidUserRole = (role: string): role is UserRole => {
  return USER_ROLES.includes(role as UserRole);
};
