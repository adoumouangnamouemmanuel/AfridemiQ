/**
 * @file Topic Type Definitions
 * @description Centralized type definitions for topic-related data structures matching the MongoDB topic model
 * @module types/learning/topic.types
 */

/**
 * Difficulty levels available for topics
 */
export type TopicDifficulty = "beginner" | "intermediate" | "advanced";

/**
 * Assessment criteria for topic mastery
 */
export interface TopicAssessmentCriteria {
  minimumScore?: number;
  requiredPracticeQuestions?: number;
  masteryThreshold?: number;
}

/**
 * Subject information for topic
 */
export interface TopicSubject {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  color?: string;
  icon?: string;
}

/**
 * Complete topic interface matching the MongoDB model
 */
export interface Topic {
  _id: string;
  name: string;
  subjectId: string | TopicSubject;
  series: string[];
  description: string;
  difficulty: TopicDifficulty;
  estimatedTime: number;
  estimatedCompletionDate?: string | Date;
  relatedTopics: string[];
  hasPractice: boolean;
  hasNote: boolean;
  hasStudyMaterial: boolean;
  prerequisites: string[];
  learningObjectives: string[];
  estimatedTimeToMaster: number;
  resourceIds: string[];
  assessmentCriteria?: TopicAssessmentCriteria;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Virtual fields
  relatedTopicsCount?: number;
  prerequisitesCount?: number;
  learningObjectivesCount?: number;
}

/**
 * Topic creation data interface
 */
export interface CreateTopicData {
  name: string;
  subjectId: string;
  series?: string[];
  description: string;
  difficulty: TopicDifficulty;
  estimatedTime: number;
  estimatedCompletionDate?: string | Date;
  relatedTopics?: string[];
  hasPractice?: boolean;
  hasNote?: boolean;
  hasStudyMaterial?: boolean;
  prerequisites?: string[];
  learningObjectives?: string[];
  estimatedTimeToMaster: number;
  resourceIds?: string[];
  assessmentCriteria?: TopicAssessmentCriteria;
}

/**
 * Topic update data interface
 */
export type UpdateTopicData = Partial<CreateTopicData>;

/**
 * Topic filters for API queries
 */
export interface TopicFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  subjectId?: string;
  difficulty?: TopicDifficulty;
  series?: string | string[];
  hasPractice?: boolean;
  hasNote?: boolean;
  hasStudyMaterial?: boolean;
}

/**
 * Topic pagination info
 */
export interface TopicPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Topic list response
 */
export interface TopicListResponse {
  topics: Topic[];
  pagination: TopicPagination;
}

/**
 * Topic statistics
 */
export interface TopicStatistics {
  general: {
    totalTopics: number;
    avgEstimatedTime: number;
    avgEstimatedTimeToMaster: number;
    topicsWithPractice: number;
    topicsWithNotes: number;
    topicsWithStudyMaterial: number;
  };
  byDifficulty: {
    _id: TopicDifficulty;
    count: number;
  }[];
  bySubject: {
    _id: string;
    subjectName: string;
    count: number;
  }[];
}

/**
 * Bulk topic operations
 */
export interface BulkTopicCreate {
  topics: CreateTopicData[];
}

export interface BulkTopicUpdate {
  updates: {
    id: string;
    data: UpdateTopicData;
  }[];
}

export interface BulkTopicResult<T> {
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
 * Generic API response wrapper for topics
 */
export interface TopicApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: TopicPagination;
}
