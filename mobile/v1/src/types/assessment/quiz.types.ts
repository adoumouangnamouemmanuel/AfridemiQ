/**
 * @file Quiz Type Definitions
 * @description Type definitions for quiz-related data structures matching the backend Quiz model
 * @module types/assessment/quiz.types
 */

import type { EducationLevel, ExamType } from "../user/user.types";
import type { DifficultyLevel } from "./question.types";

/**
 * Quiz formats supported in the system
 */
export type QuizFormat = "practice" | "mock_exam" | "topic_review";

/**
 * Quiz status
 */
export type QuizStatus = "active" | "inactive" | "archived";

/**
 * Quiz statistics interface
 */
export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  passRate: number; // percentage
  averageCompletionTime: number; // in minutes
}

/**
 * Main Quiz interface matching the backend model
 */
export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  format: QuizFormat;

  // Content
  subjectId:
    | {
        _id: string;
        name: string;
        code: string;
      }
    | string;
  topicIds: (
    | {
        _id: string;
        name: string;
      }
    | string
  )[];
  questionIds: (
    | {
        _id: string;
        question: string;
      }
    | string
  )[];

  // Parameters
  timeLimit: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  maxAttempts: number;

  // Categorization
  difficulty: DifficultyLevel | "mixed";
  educationLevel: EducationLevel;
  examType?: ExamType;

  // Statistics
  stats: QuizStats;

  // Management
  status: QuizStatus;
  isActive: boolean;
  isPremium: boolean;

  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;

  // Virtuals
  estimatedDuration?: string;
  popularityScore?: number;
}

/**
 * Create quiz data
 */
export interface CreateQuizData {
  title: string;
  description?: string;
  format?: QuizFormat;
  subjectId: string;
  topicIds?: string[];
  questionIds: string[];
  timeLimit: number;
  totalQuestions?: number;
  passingScore?: number;
  maxAttempts?: number;
  difficulty?: DifficultyLevel | "mixed";
  educationLevel: EducationLevel;
  examType?: ExamType;
  isPremium?: boolean;
  isActive?: boolean;
}

/**
 * Update quiz data
 */
export interface UpdateQuizData {
  title?: string;
  description?: string;
  format?: QuizFormat;
  subjectId?: string;
  topicIds?: string[];
  questionIds?: string[];
  timeLimit?: number;
  totalQuestions?: number;
  passingScore?: number;
  maxAttempts?: number;
  difficulty?: DifficultyLevel | "mixed";
  educationLevel?: EducationLevel;
  examType?: ExamType;
  isPremium?: boolean;
  isActive?: boolean;
  status?: QuizStatus;
}

/**
 * Quiz filters for querying
 */
export interface QuizFilters {
  page?: number;
  limit?: number;
  subjectId?: string;
  topicId?: string;
  format?: QuizFormat;
  difficulty?: DifficultyLevel | "mixed";
  educationLevel?: EducationLevel;
  examType?: ExamType;
  isActive?: boolean;
  isPremium?: boolean;
  status?: QuizStatus;
  search?: string;
  sortBy?:
    | "title"
    | "createdAt"
    | "difficulty"
    | "stats.totalAttempts"
    | "stats.averageScore";
  sortOrder?: "asc" | "desc";
}

/**
 * Quiz list response
 */
export interface QuizListResponse {
  quizzes: Quiz[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Quiz search response
 */
export interface QuizSearchResponse {
  quizzes: Quiz[];
  pagination: QuizListResponse["pagination"];
  searchTerm: string;
}

/**
 * Quiz stats update data
 */
export interface UpdateQuizStatsData {
  score: number;
  completionTimeMinutes: number;
  passed: boolean;
}

/**
 * Popular quiz filters
 */
export interface PopularQuizFilters {
  limit?: number;
  period?: "day" | "week" | "month" | "all";
}

/**
 * Quiz API response wrapper
 */
export interface QuizApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: QuizListResponse["pagination"];
}

/**
 * Quiz analytics data
 */
export interface QuizAnalytics {
  overview: {
    totalQuizzes: number;
    activeQuizzes: number;
    averageScore: number;
    totalAttempts: number;
    passRate: number;
  };
  byFormat: {
    format: QuizFormat;
    count: number;
    averageScore: number;
    popularity: number;
  }[];
  byDifficulty: {
    difficulty: DifficultyLevel | "mixed";
    count: number;
    averageScore: number;
    passRate: number;
  }[];
  topPerforming: Quiz[];
  mostPopular: Quiz[];
}

/**
 * Quiz comparison data
 */
export interface QuizComparison {
  quizzes: Quiz[];
  metrics: {
    averageScore: number[];
    passRate: number[];
    averageTime: number[];
    difficulty: string[];
    popularity: number[];
  };
  summary: {
    easiest: Quiz;
    hardest: Quiz;
    mostPopular: Quiz;
    bestPerforming: Quiz;
  };
}

/**
 * Bulk quiz operations
 */
export interface BulkQuizCreate {
  quizzes: CreateQuizData[];
}

export interface BulkQuizUpdate {
  updates: {
    id: string;
    data: UpdateQuizData;
  }[];
}

export interface BulkQuizResult<T> {
  success: T[];
  errors: {
    index: number;
    error: string;
    data?: any;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// =============== CONSTANTS FOR TYPE CHECKING ===============

export const QUIZ_FORMATS: QuizFormat[] = [
  "practice",
  "mock_exam",
  "topic_review",
];

export const QUIZ_STATUSES: QuizStatus[] = ["active", "inactive", "archived"];

// =============== TYPE GUARDS ===============

export const isValidQuizFormat = (format: string): format is QuizFormat => {
  return QUIZ_FORMATS.includes(format as QuizFormat);
};

export const isValidQuizStatus = (status: string): status is QuizStatus => {
  return QUIZ_STATUSES.includes(status as QuizStatus);
};
