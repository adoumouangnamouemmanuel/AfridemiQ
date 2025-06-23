/**
 * @file Quiz Result Type Definitions
 * @description Type definitions for quiz result-related data structures matching the backend QuizResult model
 * @module types/assessment/quizResult.types
 */

/**
 * Submission methods for quiz results
 */
export type SubmissionMethod = "submitted" | "time_expired" | "auto_submit";

/**
 * Performance levels based on score
 */
export type PerformanceLevel =
  | "excellent"
  | "très_bien"
  | "bien"
  | "passable"
  | "insuffisant";

/**
 * Answer interface for detailed tracking
 */
export interface QuizAnswer {
  questionId:
    | string
    | {
        _id: string;
        question: string;
        type: string;
        difficulty: string;
      };
  selectedAnswer: string | number | boolean;
  correctAnswer: string | number | boolean;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

/**
 * Main Quiz Result interface matching the backend model
 */
export interface QuizResult {
  _id: string;

  // Relations
  userId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
  quizId:
    | string
    | {
        _id: string;
        title: string;
        format: string;
        difficulty: string;
        passingScore: number;
      };

  // Results
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;

  // Time tracking
  totalTimeSpent: number; // in seconds
  startedAt: string | Date;
  completedAt: string | Date;

  // Detailed answers
  answers: QuizAnswer[];

  // Status and metadata
  isPassed: boolean;
  attemptNumber: number;
  submissionMethod: SubmissionMethod;

  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;

  // Virtuals
  completionTime?: string; // "5m 30s" format
  accuracy?: number; // percentage
  averageTimePerQuestion?: number; // seconds
  performance?: PerformanceLevel;
}

/**
 * Answer interface for quiz creation (simplified)
 */
export interface CreateQuizAnswer {
    questionId: string;
    selectedAnswer: string | number | boolean;
    correctAnswer: string | number | boolean;
    isCorrect: boolean;
    timeSpent: number;
  }
  
  /**
   * Create quiz result data (fixed)
   */
  export interface CreateQuizResultData {
    userId: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    totalTimeSpent: number;
    startedAt: string | Date;
    completedAt: string | Date;
    answers: CreateQuizAnswer[]; // Fixed: Use simple interface
    isPassed: boolean;
    attemptNumber?: number;
    submissionMethod?: SubmissionMethod;
  }

/**
 * Update quiz result data
 */
export interface UpdateQuizResultData {
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  totalTimeSpent?: number;
  startedAt?: string | Date;
  completedAt?: string | Date;
  answers?: Omit<QuizAnswer, "questionId"> & { questionId: string }[];
  isPassed?: boolean;
  attemptNumber?: number;
  submissionMethod?: SubmissionMethod;
}

/**
 * Quiz result filters for querying
 */
export interface QuizResultFilters {
  page?: number;
  limit?: number;
  userId?: string;
  quizId?: string;
  isPassed?: boolean;
  minScore?: number;
  maxScore?: number;
  sortBy?: "score" | "createdAt" | "totalTimeSpent" | "accuracy";
  sortOrder?: "asc" | "desc";
}

/**
 * Quiz result list response
 */
export interface QuizResultListResponse {
  quizResults: QuizResult[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * User quiz results response
 */
export interface UserQuizResultsResponse {
  quizResults: QuizResult[];
  pagination: QuizResultListResponse["pagination"];
  summary: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    bestScore: number;
  };
}

/**
 * Best score response
 */
export interface BestScoreResponse {
  score: number;
  isPassed: boolean;
  createdAt: string | Date;
}

/**
 * User statistics response
 */
export interface UserStatsResponse {
  averageScore: number;
  totalAttempts: number;
  passedQuizzes: number;
  failedQuizzes: number;
  totalTimeSpent: number;
  favoriteSubjects: string[];
  improvementTrend: number; // percentage change
}

/**
 * Quiz result API response wrapper
 */
export interface QuizResultApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: QuizResultListResponse["pagination"];
}

/**
 * Quiz result analytics
 */
export interface QuizResultAnalytics {
  overview: {
    totalResults: number;
    averageScore: number;
    passRate: number;
    averageCompletionTime: number;
  };
  scoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  performanceTrends: {
    date: string;
    averageScore: number;
    attempts: number;
  }[];
  topPerformers: {
    userId: string;
    userName: string;
    averageScore: number;
    totalAttempts: number;
  }[];
}

// =============== CONSTANTS FOR TYPE CHECKING ===============

export const SUBMISSION_METHODS: SubmissionMethod[] = [
  "submitted",
  "time_expired",
  "auto_submit",
];

export const PERFORMANCE_LEVELS: PerformanceLevel[] = [
  "excellent",
  "très_bien",
  "bien",
  "passable",
  "insuffisant",
];

// =============== TYPE GUARDS ===============

export const isValidSubmissionMethod = (
  method: string
): method is SubmissionMethod => {
  return SUBMISSION_METHODS.includes(method as SubmissionMethod);
};

export const isValidPerformanceLevel = (
  level: string
): level is PerformanceLevel => {
  return PERFORMANCE_LEVELS.includes(level as PerformanceLevel);
};

// =============== UTILITY FUNCTIONS ===============

/**
 * Calculate performance level based on score
 */
export const getPerformanceLevel = (score: number): PerformanceLevel => {
  if (score >= 90) return "excellent";
  if (score >= 80) return "très_bien";
  if (score >= 70) return "bien";
  if (score >= 60) return "passable";
  return "insuffisant";
};

/**
 * Format completion time from seconds
 */
export const formatCompletionTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Calculate accuracy percentage
 */
export const calculateAccuracy = (
  correctAnswers: number,
  totalQuestions: number
): number => {
  return Math.round((correctAnswers / totalQuestions) * 100);
};
