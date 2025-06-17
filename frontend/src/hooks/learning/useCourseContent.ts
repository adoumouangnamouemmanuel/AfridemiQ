import { useCallback, useEffect, useRef, useState } from "react";
import { courseContentApiService } from "../../services/learning/api.course.content.service";
import type {
  CourseContent,
  CourseContentFilters,
  CourseContentListResponse,
  CourseContentStatistics,
  CreateCourseContentData,
  UpdateCourseContentData,
  UpdateProgressTrackingData,
} from "../../types/learning/course.content.types";

interface UseCourseContentResult {
  courseContent: CourseContent | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseCourseContentsResult {
  courseContents: CourseContent[];
  pagination: CourseContentListResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseCourseContentStatisticsResult {
  statistics: CourseContentStatistics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single course content by ID
 */
export const useCourseContent = (
  courseContentId?: string
): UseCourseContentResult => {
  const [courseContent, setCourseContent] = useState<CourseContent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useCourseContent Hook - Initialized with:", {
    courseContentId,
  });

  const fetchCourseContent = useCallback(async () => {
    if (!courseContentId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useCourseContent Hook - Fetching course content:",
        courseContentId
      );

      const data = await courseContentApiService.getCourseContentById(
        courseContentId
      );
      setCourseContent(data);

      console.log(
        "🔗 useCourseContent Hook - Successfully loaded course content:",
        data.title
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch course content";
      setError(errorMessage);
      console.error("🔗 useCourseContent Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [courseContentId]);

  useEffect(() => {
    fetchCourseContent();
  }, [fetchCourseContent]);

  return {
    courseContent,
    isLoading,
    error,
    refetch: fetchCourseContent,
  };
};

/**
 * Hook for fetching multiple course contents with filters
 */
export const useCourseContents = (
  filters?: CourseContentFilters
): UseCourseContentsResult => {
  const [courseContents, setCourseContents] = useState<CourseContent[]>([]);
  const [pagination, setPagination] = useState<
    CourseContentListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useCourseContents Hook - Initialized with filters:", filters);

  const fetchCourseContents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useCourseContents Hook - Fetching course contents with filters:",
        filters
      );

      const data = await courseContentApiService.getCourseContents(filters);
      setCourseContents(data.courseContents);
      setPagination(data.pagination);

      console.log(
        "🔗 useCourseContents Hook - Successfully loaded course contents:",
        data.courseContents.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch course contents";
      setError(errorMessage);
      console.error("🔗 useCourseContents Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourseContents();
  }, [fetchCourseContents]);

  return {
    courseContents,
    pagination,
    isLoading,
    error,
    refetch: fetchCourseContents,
  };
};

/**
 * Hook for fetching course contents by subject
 */
export const useCourseContentsBySubject = (
  subjectId: string,
  options?: CourseContentFilters
): UseCourseContentsResult => {
  const [courseContents, setCourseContents] = useState<CourseContent[]>([]);
  const [pagination, setPagination] = useState<
    CourseContentListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track previous values and prevent unnecessary re-renders
  const previousSubjectIdRef = useRef<string | null>(null);
  const previousOptionsRef = useRef<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log("🔗 useCourseContentsBySubject Hook - Initialized with:", {
    subjectId,
    options,
  });

  const fetchCourseContentsBySubject = useCallback(async () => {
    // FIX: Better validation for subjectId
    if (!subjectId || subjectId.trim() === "") {
      console.log(
        "🔗 useCourseContentsBySubject Hook - No valid subjectId provided, skipping fetch"
      );
      setIsLoading(false);
      setCourseContents([]);
      setPagination(null);
      setError(null);
      return;
    }

    // Serialize options for comparison
    const optionsString = JSON.stringify(options || {});

    // Check if we need to fetch (subject or options changed)
    if (
      previousSubjectIdRef.current === subjectId &&
      previousOptionsRef.current === optionsString
    ) {
      console.log(
        "🔗 useCourseContentsBySubject Hook - Skipping fetch, no changes detected"
      );
      return;
    }

    // Clear any pending timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Update refs
    previousSubjectIdRef.current = subjectId;
    previousOptionsRef.current = optionsString;

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useCourseContentsBySubject Hook - Fetching course contents for subject:",
        subjectId
      );

      const data = await courseContentApiService.getCourseContentsBySubject(
        subjectId,
        options
      );
      setCourseContents(data.courseContents);
      setPagination(data.pagination);

      console.log(
        "🔗 useCourseContentsBySubject Hook - Successfully loaded course contents:",
        data.courseContents.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch course contents by subject";
      setError(errorMessage);
      console.error(
        "🔗 useCourseContentsBySubject Hook - Error:",
        errorMessage
      );

      // Reset refs on error so we can retry
      previousSubjectIdRef.current = null;
      previousOptionsRef.current = null;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - we manage dependencies manually

  // Extract complex expression to separate variable for static analysis
  const serializedOptions = JSON.stringify(options || {});

  useEffect(() => {
    // FIX: Only set timeout if we have a valid subjectId
    if (!subjectId || subjectId.trim() === "") {
      setIsLoading(false);
      setCourseContents([]);
      setPagination(null);
      setError(null);
      return;
    }

    // Debounce the fetch to prevent rapid successive calls
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchCourseContentsBySubject();
    }, 100); // 100ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [subjectId, serializedOptions, fetchCourseContentsBySubject]);

  return {
    courseContents,
    pagination,
    isLoading,
    error,
    refetch: fetchCourseContentsBySubject,
  };
};

/**
 * Hook for fetching course contents by exam
 */
export const useCourseContentsByExam = (
  examId: string,
  options?: CourseContentFilters
): UseCourseContentsResult => {
  const [courseContents, setCourseContents] = useState<CourseContent[]>([]);
  const [pagination, setPagination] = useState<
    CourseContentListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useCourseContentsByExam Hook - Initialized with:", {
    examId,
    options,
  });

  const fetchCourseContentsByExam = useCallback(async () => {
    if (!examId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useCourseContentsByExam Hook - Fetching course contents for exam:",
        examId
      );

      const data = await courseContentApiService.getCourseContentsByExam(
        examId,
        options
      );
      setCourseContents(data.courseContents);
      setPagination(data.pagination);

      console.log(
        "🔗 useCourseContentsByExam Hook - Successfully loaded course contents:",
        data.courseContents.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch course contents by exam";
      setError(errorMessage);
      console.error("🔗 useCourseContentsByExam Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [examId, options]);

  useEffect(() => {
    fetchCourseContentsByExam();
  }, [fetchCourseContentsByExam]);

  return {
    courseContents,
    pagination,
    isLoading,
    error,
    refetch: fetchCourseContentsByExam,
  };
};

/**
 * Hook for searching course contents
 */
export const useCourseContentSearch = (
  searchTerm: string,
  options?: CourseContentFilters
): UseCourseContentsResult => {
  const [courseContents, setCourseContents] = useState<CourseContent[]>([]);
  const [pagination, setPagination] = useState<
    CourseContentListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useCourseContentSearch Hook - Initialized with:", {
    searchTerm,
    options,
  });

  const searchCourseContents = useCallback(async () => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setCourseContents([]);
      setPagination(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useCourseContentSearch Hook - Searching course contents:",
        searchTerm
      );

      const data = await courseContentApiService.searchCourseContents(
        searchTerm,
        options
      );
      setCourseContents(data.courseContents);
      setPagination(data.pagination);

      console.log(
        "🔗 useCourseContentSearch Hook - Successfully found course contents:",
        data.courseContents.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search course contents";
      setError(errorMessage);
      console.error("🔗 useCourseContentSearch Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchCourseContents();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchCourseContents]);

  return {
    courseContents,
    pagination,
    isLoading,
    error,
    refetch: searchCourseContents,
  };
};

/**
 * Hook for course content statistics
 */
export const useCourseContentStatistics =
  (): UseCourseContentStatisticsResult => {
    const [statistics, setStatistics] =
      useState<CourseContentStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log("🔗 useCourseContentStatistics Hook - Initialized");

    const fetchCourseContentStatistics = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔗 useCourseContentStatistics Hook - Fetching statistics");

        const data = await courseContentApiService.getCourseContentStatistics();
        setStatistics(data);

        console.log(
          "🔗 useCourseContentStatistics Hook - Successfully loaded statistics"
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch course content statistics";
        setError(errorMessage);
        console.error(
          "🔗 useCourseContentStatistics Hook - Error:",
          errorMessage
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchCourseContentStatistics();
    }, [fetchCourseContentStatistics]);

    return {
      statistics,
      isLoading,
      error,
      refetch: fetchCourseContentStatistics,
    };
  };

/**
 * Hook for creating a course content (admin only)
 */
export const useCreateCourseContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCourseContent = useCallback(
    async (
      courseContentData: CreateCourseContentData
    ): Promise<CourseContent | null> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(
          "🔗 useCreateCourseContent Hook - Creating course content:",
          courseContentData
        );

        const courseContent = await courseContentApiService.createCourseContent(
          courseContentData
        );

        console.log(
          "🔗 useCreateCourseContent Hook - Successfully created course content"
        );
        return courseContent;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to create course content";
        setError(errorMessage);
        console.error("🔗 useCreateCourseContent Hook - Error:", errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createCourseContent,
    isLoading,
    error,
  };
};

/**
 * Hook for updating a course content (admin only)
 */
export const useUpdateCourseContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCourseContent = useCallback(
    async (
      courseContentId: string,
      updateData: UpdateCourseContentData
    ): Promise<CourseContent | null> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(
          "🔗 useUpdateCourseContent Hook - Updating course content:",
          {
            courseContentId,
            updateData,
          }
        );

        const courseContent = await courseContentApiService.updateCourseContent(
          courseContentId,
          updateData
        );

        console.log(
          "🔗 useUpdateCourseContent Hook - Successfully updated course content"
        );
        return courseContent;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update course content";
        setError(errorMessage);
        console.error("🔗 useUpdateCourseContent Hook - Error:", errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    updateCourseContent,
    isLoading,
    error,
  };
};

/**
 * Hook for deleting a course content (admin only)
 */
export const useDeleteCourseContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCourseContent = useCallback(
    async (courseContentId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(
          "🔗 useDeleteCourseContent Hook - Deleting course content:",
          courseContentId
        );

        await courseContentApiService.deleteCourseContent(courseContentId);

        console.log(
          "🔗 useDeleteCourseContent Hook - Successfully deleted course content"
        );
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to delete course content";
        setError(errorMessage);
        console.error("🔗 useDeleteCourseContent Hook - Error:", errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    deleteCourseContent,
    isLoading,
    error,
  };
};

/**
 * Hook for updating progress tracking
 */
export const useUpdateProgressTracking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProgressTracking = useCallback(
    async (
      courseContentId: string,
      progressData: UpdateProgressTrackingData
    ): Promise<CourseContent | null> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔗 useUpdateProgressTracking Hook - Updating progress:", {
          courseContentId,
          progressData,
        });

        const courseContent =
          await courseContentApiService.updateProgressTracking(
            courseContentId,
            progressData
          );

        console.log(
          "🔗 useUpdateProgressTracking Hook - Successfully updated progress"
        );
        return courseContent;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update progress tracking";
        setError(errorMessage);
        console.error(
          "🔗 useUpdateProgressTracking Hook - Error:",
          errorMessage
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    updateProgressTracking,
    isLoading,
    error,
  };
};
