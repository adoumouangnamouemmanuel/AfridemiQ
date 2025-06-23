/**
 * @file Base Lesson Type Definitions
 * @description Centralized type definitions for base lesson-related data structures matching the MongoDB lesson model
 * @module types/learning/lessons/lesson.base.types
 */

/**
 * Interactivity levels available for lessons
 */
export type LessonInteractivityLevel = "low" | "medium" | "high";

/**
 * Lesson feedback structure
 */
export interface LessonFeedback {
  userId: string;
  rating: number;
  comment?: string;
  isHelpful?: boolean;
  createdAt: string | Date;
}

/**
 * Lesson progress tracking structure
 */
export interface LessonProgressTracking {
  totalAttempts: number;
  totalCompletions: number;
  averageCompletionTime: number;
  completionRate: number;
  averageScore: number;
  totalStudyTime: number;
  completedBy: string[];
  difficultyRating: number;
  averageHintsUsed: number;
}

/**
 * Lesson metadata structure
 */
export interface LessonMetadata {
  createdBy: string;
  updatedBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Topic information for lesson
 */
export interface LessonTopic {
  _id: string;
  name: string;
  description?: string;
  difficulty?: string;
  subjectId?: string;
}

/**
 * Resource information for lesson
 */
export interface LessonResource {
  _id: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
}

/**
 * Exercise information for lesson
 */
export interface LessonExercise {
  _id: string;
  title: string;
  type: string;
  description?: string;
  difficulty?: string;
}

/**
 * User information for lesson metadata
 */
export interface LessonUser {
  _id: string;
  name: string;
  email?: string;
}

/**
 * Complete base lesson interface matching the MongoDB model
 */
export interface BaseLesson {
  _id: string;
  topicId: string | LessonTopic;
  title: string;
  series: string[];
  overview: string;
  objectives: string[];
  keyPoints: string[];
  duration: number;
  resourceIds: string[] | LessonResource[];
  exerciseIds: string[] | LessonExercise[];
  interactivityLevel: LessonInteractivityLevel;
  offlineAvailable: boolean;
  premiumOnly: boolean;
  metadata: LessonMetadata;
  progressTracking: LessonProgressTracking;
  feedback: LessonFeedback[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Base lesson creation data interface
 */
export interface CreateBaseLessonData {
  topicId: string;
  title: string;
  series?: string[];
  overview: string;
  objectives?: string[];
  keyPoints?: string[];
  duration: number;
  resourceIds?: string[];
  exerciseIds?: string[];
  interactivityLevel?: LessonInteractivityLevel;
  offlineAvailable?: boolean;
  premiumOnly?: boolean;
}

/**
 * Base lesson update data interface
 */
export type UpdateBaseLessonData = Partial<CreateBaseLessonData>;

/**
 * Base lesson filters for API queries
 */
export interface BaseLessonFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  topicId?: string;
  series?: string | string[];
  interactivityLevel?: LessonInteractivityLevel;
  offlineAvailable?: boolean;
  premiumOnly?: boolean;
  duration?: {
    min?: number;
    max?: number;
  };
}

/**
 * Base lesson pagination info
 */
export interface BaseLessonPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Base lesson list response
 */
export interface BaseLessonListResponse {
  lessons: BaseLesson[];
  pagination: BaseLessonPagination;
}

/**
 * Base lesson statistics
 */
export interface BaseLessonStatistics {
  general: {
    totalLessons: number;
    avgDuration: number;
    avgCompletionRate: number;
    lessonsWithPractice: number;
    premiumLessons: number;
    offlineLessons: number;
  };
  byInteractivity: {
    _id: LessonInteractivityLevel;
    count: number;
  }[];
  byTopic: {
    _id: string;
    topicName: string;
    count: number;
  }[];
}

/**
 * Add feedback data
 */
export interface AddLessonFeedbackData {
  rating: number;
  comment?: string;
  isHelpful?: boolean;
}

/**
 * Bulk lesson operations
 */
export interface BulkBaseLessonCreate {
  lessons: CreateBaseLessonData[];
}

export interface BulkBaseLessonUpdate {
  updates: {
    id: string;
    data: UpdateBaseLessonData;
  }[];
}

export interface BulkBaseLessonResult<T> {
  success: T[];
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
 * Generic API response wrapper for base lessons
 */
export interface BaseLessonApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: BaseLessonPagination;
}
