/**
 * @file Course Content Type Definitions
 * @description Centralized type definitions for course content-related data structures matching the MongoDB course content model
 * @module types/learning/course.content.types
 */

/**
 * Course content levels available
 */
export type CourseContentLevel = "beginner" | "intermediate" | "advanced";

/**
 * Course access types
 */
export type CourseAccessType = "free" | "premium" | "subscription";

/**
 * Course formats
 */
export type CourseFormat = "text" | "video" | "audio" | "interactive";

/**
 * Course languages
 */
export type CourseLanguage = "french" | "english" | "arabic" | "portuguese";

/**
 * Course accommodations
 */
export type CourseAccommodation =
  | "large_text"
  | "high_contrast"
  | "audio_support";

/**
 * Module progress tracking structure
 */
export interface ModuleProgressTracking {
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt?: string | Date;
}

/**
 * Module unlock conditions structure
 */
export interface ModuleUnlockConditions {
  requiredModules: string[];
  minimumScore?: number;
}

/**
 * Course module structure
 */
export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  series?: string;
  lessons: string[];
  exerciseIds: string[];
  assessment?: string;
  progressTracking: ModuleProgressTracking;
  estimatedDuration?: number;
  prerequisites: string[];
  isLocked: boolean;
  unlockConditions: ModuleUnlockConditions;
}

/**
 * Course accessibility options structure
 */
export interface CourseAccessibilityOptions {
  languages: CourseLanguage[];
  formats: CourseFormat[];
  accommodations: CourseAccommodation[];
  hasAudioVersion: boolean;
  hasBrailleVersion: boolean;
  screenReaderFriendly: boolean;
}

/**
 * Course analytics structure
 */
export interface CourseAnalytics {
  enrollmentCount: number;
  completionRate: number;
  averageRating: number;
  totalViews: number;
  lastViewedAt?: string | Date;
}

/**
 * Course metadata structure
 */
export interface CourseMetadata {
  createdBy: string;
  updatedBy?: string;
  lastModified: string | Date;
  tags: string[];
  version: number;
  status: "draft" | "published" | "archived" | "under_review";
  publishedAt?: string | Date;
  lastReviewDate?: string | Date;
  reviewNotes?: string;
}

/**
 * Course progress tracking structure
 */
export interface CourseProgressTracking {
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt?: string | Date;
  averageCompletionTime: number;
}

/**
 * Complete course content interface
 */
export interface CourseContent {
  _id: string;
  examId: string[];
  subjectId: string;
  topicId: string[];
  series: string[];
  title: string;
  description: string;
  level: CourseContentLevel;
  modules: CourseModule[];
  prerequisites: string[];
  estimatedDuration: number;
  progressTracking: CourseProgressTracking;
  accessibilityOptions: CourseAccessibilityOptions;
  premiumOnly: boolean;
  accessType: CourseAccessType;
  analytics: CourseAnalytics;
  metadata: CourseMetadata;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Virtual fields
  totalModules?: number;
  completionPercentage?: number;
  isCompleted?: boolean;
  totalExercises?: number;
  averageModuleCompletion?: number;
  estimatedHours?: number;
}

/**
 * Course content creation data interface
 */
export interface CreateCourseContentData {
  examId: string[];
  subjectId: string;
  topicId: string[];
  series?: string[];
  title: string;
  description: string;
  level: CourseContentLevel;
  modules?: CourseModule[];
  prerequisites?: string[];
  estimatedDuration: number;
  accessibilityOptions?: Partial<CourseAccessibilityOptions>;
  premiumOnly?: boolean;
  accessType?: CourseAccessType;
  metadata?: Partial<CourseMetadata>;
}

/**
 * Course content update data interface
 */
export type UpdateCourseContentData = Partial<CreateCourseContentData>;

/**
 * Course content filters for API queries
 */
export interface CourseContentFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  subjectId?: string;
  examId?: string;
  topicId?: string;
  level?: CourseContentLevel;
  series?: string | string[];
  premiumOnly?: boolean;
  accessType?: CourseAccessType;
  isActive?: boolean;
  isArchived?: boolean;
}

/**
 * Course content pagination info
 */
export interface CourseContentPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Course content list response
 */
export interface CourseContentListResponse {
  courseContents: CourseContent[];
  pagination: CourseContentPagination;
}

/**
 * Course content statistics
 */
export interface CourseContentStatistics {
  totalContents: number;
  contentsByLevel: Record<CourseContentLevel, number>;
  contentsBySubject: Record<string, number>;
  premiumContents: number;
  freeContents: number;
  averageModulesPerContent: number;
}

/**
 * Progress tracking update data
 */
export interface UpdateProgressTrackingData {
  completedLessons?: number;
  lastAccessedAt?: string | Date;
  averageCompletionTime?: number;
}

/**
 * Bulk course content operations
 */
export interface BulkCourseContentCreate {
  contents: CreateCourseContentData[];
}

export interface BulkCourseContentUpdate {
  updates: {
    id: string;
    data: UpdateCourseContentData;
  }[];
}

export interface BulkCourseContentResult<T> {
  results: T[];
  errors: {
    index?: number;
    id?: string;
    data?: any;
    error: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Generic API response wrapper for course content
 */
export interface CourseContentApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: CourseContentPagination;
}
