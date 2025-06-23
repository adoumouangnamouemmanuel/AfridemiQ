/**
 * @file Math Lesson Type Definitions
 * @description Centralized type definitions for math lesson-related data structures extending base lesson types
 * @module types/learning/lessons/lesson.math.types
 */

import type {
  BaseLesson,
  BaseLessonApiResponse,
  BaseLessonFilters,
  BaseLessonPagination,
  CreateBaseLessonData,
} from "./lesson.base.types";

/**
 * Math topics available
 */
export type MathTopic = "algebra" | "geometry" | "calculus" | "statistics";

/**
 * Difficulty levels for math concepts
 */
export type MathDifficultyLevel = "beginner" | "intermediate" | "advanced";

/**
 * Interactive element types for math lessons
 */
export type MathInteractiveElementType =
  | "geogebra"
  | "desmos"
  | "video"
  | "quiz";

/**
 * Math lesson introduction structure
 */
export interface MathLessonIntroduction {
  text: string;
  videoUrl?: string;
  transcript?: string;
  accessibility: {
    hasSubtitles: boolean;
    hasAudioDescription: boolean;
  };
  learningGoals?: string[];
  prerequisites?: string[];
}

/**
 * Math concept formula structure
 */
export interface MathConceptFormula {
  formula: string;
  useCase: string;
  derivationSteps: string[];
}

/**
 * Math concept example structure
 */
export interface MathConceptExample {
  expression: string;
  explanation: string;
  steps: string[];
}

/**
 * Math concept visual aid structure
 */
export interface MathConceptVisualAid {
  mediaType: "image" | "audio" | "video";
  url: string;
  altText: string;
}

/**
 * Math concept structure
 */
export interface MathConcept {
  name: string;
  definition: string;
  topic: MathTopic;
  explanation: string;
  difficultyLevel: MathDifficultyLevel;
  examples: MathConceptExample[];
  formulas: MathConceptFormula[];
  visualAid?: MathConceptVisualAid;
  conceptQuizId?: string;
}

/**
 * Math theorem diagram structure
 */
export interface MathTheoremDiagram {
  mediaType: "image" | "audio" | "video";
  url: string;
  altText: string;
}

/**
 * Math theorem structure
 */
export interface MathTheorem {
  title: string;
  statement: string;
  proof: string[];
  diagram?: MathTheoremDiagram;
  applications: string[];
}

/**
 * Math worked example structure
 */
export interface MathWorkedExample {
  problem: string;
  solutionSteps: string[];
  answer: string;
  difficultyLevel: MathDifficultyLevel;
}

/**
 * Math practice exercise structure
 */
export interface MathPracticeExercise {
  exerciseId: string;
  type: "practice" | "quiz" | "assignment" | "exam";
  description: string;
  difficultyLevel: MathDifficultyLevel;
}

/**
 * Math interactive element structure
 */
export interface MathInteractiveElement {
  elementType: MathInteractiveElementType;
  url: string;
  instructions: string;
  offlineAvailable: boolean;
}

/**
 * Math lesson summary structure
 */
export interface MathLessonSummary {
  keyTakeaways: string[];
  suggestedNextTopics: string[];
}

/**
 * Math lesson gamification structure
 */
export interface MathLessonGamification {
  badges: string[];
  points: number;
}

/**
 * Math lesson progress tracking structure
 */
export interface MathLessonProgressTracking {
  completedBy: string[];
  completionRate: number;
  totalAttempts: number;
  totalCompletions: number;
  averageCompletionTime: number;
  averageScore: number;
  totalStudyTime: number;
  difficultyRating: number;
  averageHintsUsed: number;
  lastUpdated: Date;
  trending: boolean;
  difficulty: string;
}

/**
 * Math lesson accessibility options structure
 */
export interface MathLessonAccessibilityOptions {
  hasBraille: boolean;
  hasSignLanguage: boolean;
  languages: string[];
  screenReaderFriendly?: boolean;
}

/**
 * Complete math lesson interface extending base lesson
 */
export interface MathLesson extends BaseLesson {
  subjectType: "math";
  introduction: MathLessonIntroduction;
  concepts: MathConcept[];
  theorems: MathTheorem[];
  workedExamples: MathWorkedExample[];
  practiceExercises: MathPracticeExercise[];
  interactiveElements: MathInteractiveElement[];
  summary: MathLessonSummary;
  prerequisites: string[];
  learningObjectives: string[];
  gamification: MathLessonGamification;
  progressTracking: MathLessonProgressTracking;
  accessibilityOptions: MathLessonAccessibilityOptions;
}

/**
 * Math lesson creation data interface
 */
export interface CreateMathLessonData extends CreateBaseLessonData {
  subjectType: "math";
  introduction: MathLessonIntroduction;
  concepts: MathConcept[];
  theorems?: MathTheorem[];
  workedExamples?: MathWorkedExample[];
  practiceExercises: MathPracticeExercise[];
  interactiveElements?: MathInteractiveElement[];
  summary?: MathLessonSummary;
  prerequisites?: string[];
  learningObjectives?: string[];
  gamification?: MathLessonGamification;
  accessibilityOptions?: MathLessonAccessibilityOptions;
}

/**
 * Math lesson update data interface
 */
export type UpdateMathLessonData = Partial<CreateMathLessonData>;

/**
 * Math lesson specific filters extending base filters
 */
export interface MathLessonFilters extends BaseLessonFilters {
  mathTopic?: MathTopic;
  difficultyLevel?: MathDifficultyLevel;
  hasTheorems?: boolean;
  hasInteractiveElements?: boolean;
  conceptCount?: {
    min?: number;
    max?: number;
  };
}

/**
 * Math lesson list response
 */
export interface MathLessonListResponse {
  lessons: MathLesson[];
  pagination: BaseLessonPagination;
}

/**
 * Math lesson statistics
 */
export interface MathLessonStatistics {
  general: {
    totalMathLessons: number;
    avgConceptCount: number;
    avgTheoremCount: number;
    avgExampleCount: number;
    lessonsWithInteractive: number;
  };
  byMathTopic: {
    _id: MathTopic;
    count: number;
  }[];
  byDifficulty: {
    _id: MathDifficultyLevel;
    count: number;
  }[];
}

/**
 * Math concept search filters
 */
export interface MathConceptFilters {
  topic?: MathTopic;
  difficultyLevel?: MathDifficultyLevel;
  hasFormulas?: boolean;
  hasExamples?: boolean;
  search?: string;
}

/**
 * Math lesson analytics
 */
export interface MathLessonAnalytics {
  overview: {
    totalMathLessons: number;
    avgCompletionRate: number;
    avgRating: number;
    totalStudents: number;
  };
  conceptAnalytics: {
    mostDifficultConcepts: string[];
    easiestConcepts: string[];
    popularTopics: MathTopic[];
  };
  interactiveUsage: {
    elementType: MathInteractiveElementType;
    usageCount: number;
  }[];
}

/**
 * Bulk math lesson operations
 */
export interface BulkMathLessonCreate {
  lessons: CreateMathLessonData[];
}

export interface BulkMathLessonUpdate {
  updates: {
    id: string;
    data: UpdateMathLessonData;
  }[];
}

/**
 * Generic API response wrapper for math lessons
 */
export type MathLessonApiResponse<T> = BaseLessonApiResponse<T>;
