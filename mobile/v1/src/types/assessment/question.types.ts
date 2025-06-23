/**
 * @file Question Type Definitions
 * @description Type definitions for question-related data structures matching the backend Question model
 * @module types/assessment/question.types
 */

import type { ExamType, EducationLevel } from "../user/user.types";

/**
 * Question types supported in the system
 */
export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

/**
 * Difficulty levels for questions
 */
export type DifficultyLevel = "easy" | "medium" | "hard";

/**
 * Question status
 */
export type QuestionStatus = "active" | "inactive" | "archived";

/**
 * Question statistics interface
 */
export interface QuestionStats {
  totalAttempts: number;
  correctAttempts: number;
  averageTimeSpent: number; // in seconds
}

/**
 * Main Question interface matching the backend model
 */
export interface Question {
  _id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation?: string;

  // Relations
  subjectId:
    | {
        _id: string;
        name: string;
        code: string;
      }
    | string;
  topicId?:
    | {
        _id: string;
        name: string;
      }
    | string;

  // Categorization
  difficulty: DifficultyLevel;
  educationLevel: EducationLevel;
  examType?: ExamType;

  // Tags and organization
  tags: string[];

  // Statistics
  stats: QuestionStats;

  // Management
  status: QuestionStatus;
  isActive: boolean;
  isPremium: boolean;

  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;

  // Virtuals
  successRate?: number;
  difficultyScore?: number;
}

/**
 * Create question data
 */
export interface CreateQuestionData {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation?: string;
  subjectId: string;
  topicId?: string;
  difficulty?: DifficultyLevel;
  educationLevel: EducationLevel;
  examType?: ExamType;
  tags?: string[];
  isPremium?: boolean;
  isActive?: boolean;
}

/**
 * Update question data
 */
export interface UpdateQuestionData {
  question?: string;
  type?: QuestionType;
  options?: string[];
  correctAnswer?: string | number | boolean;
  explanation?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: DifficultyLevel;
  educationLevel?: EducationLevel;
  examType?: ExamType;
  tags?: string[];
  isPremium?: boolean;
  isActive?: boolean;
  status?: QuestionStatus;
}

/**
 * Question filters for querying
 */
export interface QuestionFilters {
  page?: number;
  limit?: number;
  subjectId?: string;
  topicId?: string;
  type?: QuestionType;
  difficulty?: DifficultyLevel;
  educationLevel?: EducationLevel;
  examType?: ExamType;
  isActive?: boolean;
  isPremium?: boolean;
  status?: QuestionStatus;
  search?: string;
  sortBy?:
    | "question"
    | "createdAt"
    | "difficulty"
    | "stats.totalAttempts"
    | "stats.successRate";
  sortOrder?: "asc" | "desc";
}

/**
 * Question list response
 */
export interface QuestionListResponse {
  questions: Question[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Question search response
 */
export interface QuestionSearchResponse {
  questions: Question[];
  pagination: QuestionListResponse["pagination"];
  searchTerm: string;
}

/**
 * Answer check data
 */
export interface CheckAnswerData {
  userAnswer: string | number | boolean;
}

/**
 * Answer check response
 */
export interface CheckAnswerResponse {
  isCorrect: boolean;
  correctAnswer: string | number | boolean;
  explanation?: string;
}

/**
 * Question stats update data
 */
export interface UpdateQuestionStatsData {
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

/**
 * Random questions filters
 */
export interface RandomQuestionsFilters {
  count?: number;
  subjectId?: string;
  topicId?: string;
  difficulty?: DifficultyLevel;
  type?: QuestionType;
  educationLevel?: EducationLevel;
  examType?: ExamType;
  isPremium?: boolean;
}

/**
 * Question API response wrapper
 */
export interface QuestionApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: QuestionListResponse["pagination"];
}

/**
 * Bulk question operations
 */
export interface BulkQuestionCreate {
  questions: CreateQuestionData[];
}

export interface BulkQuestionUpdate {
  updates: {
    id: string;
    data: UpdateQuestionData;
  }[];
}

export interface BulkQuestionResult<T> {
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

export const QUESTION_TYPES: QuestionType[] = [
  "multiple_choice",
  "true_false",
  "short_answer",
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ["easy", "medium", "hard"];

export const QUESTION_STATUSES: QuestionStatus[] = [
  "active",
  "inactive",
  "archived",
];

// =============== TYPE GUARDS ===============

export const isValidQuestionType = (type: string): type is QuestionType => {
  return QUESTION_TYPES.includes(type as QuestionType);
};

export const isValidDifficultyLevel = (
  level: string
): level is DifficultyLevel => {
  return DIFFICULTY_LEVELS.includes(level as DifficultyLevel);
};

export const isValidQuestionStatus = (
  status: string
): status is QuestionStatus => {
  return QUESTION_STATUSES.includes(status as QuestionStatus);
};
