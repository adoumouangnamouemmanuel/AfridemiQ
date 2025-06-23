/**
 * @file Curriculum Type Definitions
 * @description Centralized type definitions for curriculum-related data structures matching the MongoDB curriculum model
 * @module types/learning/curriculum.types
 */

/**
 * Education levels available in the system
 */
export type EducationLevel = "primary" | "secondary" | "tertiary";

/**
 * Status options for curriculum metadata
 */
export type CurriculumStatus = "draft" | "active" | "archived";

/**
 * Holiday structure
 */
export interface Holiday {
  name: string;
  startDate: string | Date;
  endDate: string | Date;
}

/**
 * Term structure
 */
export interface Term {
  term: number;
  startDate: string | Date;
  endDate: string | Date;
  holidays: Holiday[];
}

/**
 * Academic year structure
 */
export interface AcademicYear {
  startDate: string | Date;
  endDate: string | Date;
  terms: Term[];
}

/**
 * Subject structure for curriculum
 */
export interface CurriculumSubject {
  _id: string;
  name: string;
  color?: string; // Optional, added for frontend display
  icon?: string; // Optional, added for frontend display
  totalTopics: number;
  completedTopics: number;
  estimatedHours: number;
  progress: number;
}

/**
 * Analytics data for curriculum
 */
export interface CurriculumAnalytics {
  enrollmentCount: number;
  activeUsers: number;
  completionRate: number;
}

/**
 * Metadata for curriculum
 */
export interface CurriculumMetadata {
  version: number;
  lastModified?: string | Date;
  status: CurriculumStatus;
  approvedAt?: string | Date;
}

/**
 * Complete curriculum interface matching the MongoDB model
 */
export interface Curriculum {
  _id: string;
  country: string;
  educationLevel: EducationLevel;
  series: string[];
  subjects: CurriculumSubject[];
  academicYear: AcademicYear;
  isActive: boolean;
  metadata: CurriculumMetadata;
  createdBy?: string;
  analytics: CurriculumAnalytics;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  message: string;
  data: T;
}