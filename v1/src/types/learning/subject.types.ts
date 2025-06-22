/**
 * @file Subject Type Definitions
 * @description Centralized type definitions for subject-related data structures matching the MongoDB subject model
 * @module types/learning/subject.types
 */

/**
 * Subject categories available in the system
 */
export type SubjectCategory =
  | "sciences"
  | "litterature"
  | "mathematiques"
  | "langues"
  | "social"
  | "arts"
  | "technique";

/**
 * Subject difficulty levels
 */
export type SubjectDifficulty = "facile" | "moyen" | "difficile";

/**
 * Subject status options
 */
export type SubjectStatus = "active" | "inactive" | "archived" | "pending";

/**
 * Rating distribution structure
 */
export interface RatingDistribution {
  five: number;
  four: number;
  three: number;
  two: number;
  one: number;
}

/**
 * Subject rating structure
 */
export interface SubjectRating {
  average: number;
  count: number;
  distribution: RatingDistribution;
}

/**
 * Subject statistics structure
 */
export interface SubjectStatistics {
  totalStudents: number;
  totalExams: number;
  averageScore: number;
  completionRate: number;
  totalQuestions: number;
  totalResources: number;
  lastUpdated: string | Date;
}

/**
 * Subject metadata structure
 */
export interface SubjectMetadata {
  createdBy: string;
  updatedBy?: string;
  version: number;
  lastModified: string | Date;
  reviewNotes?: string;
  isVerified: boolean;
}

/**
 * Complete subject interface matching the MongoDB model
 */
export interface Subject {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  longDescription?: string;
  category: SubjectCategory;
  subcategory?: string;
  difficulty: SubjectDifficulty;
  examIds: string[];
  series: string[];
  estimatedHours?: number;
  tags: string[];
  keywords: string[];
  popularity: number;
  rating: SubjectRating;
  statistics: SubjectStatistics;
  isActive: boolean;
  status: SubjectStatus;
  isPremium: boolean;
  metadata: SubjectMetadata;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Virtual fields
  examCount?: number;
  formattedSeries?: string;
  isPopular?: boolean;
  difficultyLevel?: number;
  completionPercentage?: number;
  engagementScore?: number;
}

/**
 * Subject creation data interface
 */
export interface CreateSubjectData {
  name: string;
  icon: string;
  color: string;
  description: string;
  longDescription?: string;
  category: SubjectCategory;
  subcategory?: string;
  difficulty?: SubjectDifficulty;
  examIds?: string[];
  series?: string[];
  estimatedHours?: number;
  tags?: string[];
  keywords?: string[];
  isPremium?: boolean;
}

/**
 * Subject update data interface
 */
export type UpdateSubjectData = Partial<CreateSubjectData>;

/**
 * Subject filters for API queries
 */
export interface SubjectFilters {
  page?: number;
  limit?: number;
  series?: string | string[];
  category?: SubjectCategory;
  difficulty?: SubjectDifficulty;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  tags?: string | string[];
  isPremium?: boolean;
  minRating?: number;
  minPopularity?: number;
}

/**
 * Subject pagination info
 */
export interface SubjectPagination {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

/**
 * Subject list response
 */
export interface SubjectListResponse {
  subjects: Subject[];
  pagination: SubjectPagination;
}

/**
 * Subject search facets
 */
export interface SubjectSearchFacets {
  categories: {
    category: SubjectCategory;
    count: number;
  }[];
  difficulties: {
    difficulty: SubjectDifficulty;
    count: number;
  }[];
  series: {
    series: string;
    count: number;
  }[];
  tags: {
    tag: string;
    count: number;
  }[];
}

/**
 * Advanced search response
 */
export interface SubjectAdvancedSearchResponse {
  subjects: Subject[];
  pagination: SubjectPagination;
  facets: SubjectSearchFacets;
  searchParams: Record<string, any>;
}

/**
 * Subject suggestions
 */
export interface SubjectSuggestion {
  _id: string;
  name: string;
  category: SubjectCategory;
  icon: string;
  color: string;
  popularity: number;
}

/**
 * Subject analytics data
 */
export interface SubjectAnalytics {
  overview: {
    totalSubjects: number;
    activeSubjects: number;
    avgRating: number;
    totalStudents: number;
    totalExams: number;
  };
  byCategory: {
    _id: SubjectCategory;
    count: number;
    avgRating: number;
    totalStudents: number;
  }[];
  byDifficulty: {
    _id: SubjectDifficulty;
    count: number;
    avgCompletionRate: number;
  }[];
  trending: Subject[];
  topRated: Subject[];
}

/**
 * Subject performance data
 */
export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  metrics: {
    totalStudents: number;
    averageScore: number;
    completionRate: number;
    engagementScore: number;
    ratingTrend: {
      date: string;
      rating: number;
    }[];
    popularityTrend: {
      date: string;
      popularity: number;
    }[];
  };
  comparisons: {
    categoryAverage: number;
    difficultyAverage: number;
    overallAverage: number;
  };
}

/**
 * Subject comparison data
 */
export interface SubjectComparison {
  subjects: {
    subject: Subject;
    metrics: {
      students: number;
      rating: number;
      completion: number;
      engagement: number;
    };
  }[];
  comparison: {
    bestPerforming: string;
    categories: string[];
    insights: string[];
  };
}

/**
 * Bulk subject operations
 */
export interface BulkSubjectCreate {
  subjects: CreateSubjectData[];
}

export interface BulkSubjectUpdate {
  updates: {
    id: string;
    data: UpdateSubjectData;
  }[];
}

export interface BulkSubjectResult<T> {
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
 * Subject export data
 */
export interface SubjectExportData {
  data: any[];
  headers?: string[];
  count: number;
  format: "json" | "csv";
}

/**
 * Rate subject data
 */
export interface RateSubjectData {
  rating: number; // 1-5
}

/**
 * Add exam to subject data
 */
export interface AddExamToSubjectData {
  examId: string;
}

/**
 * Generic API response wrapper for subjects
 */
export interface SubjectApiResponse<T> {
  message: string;
  data?: T;
  pagination?: SubjectPagination;
  facets?: SubjectSearchFacets;
  searchParams?: Record<string, any>;
}
