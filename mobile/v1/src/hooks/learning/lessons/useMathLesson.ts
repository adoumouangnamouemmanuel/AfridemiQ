"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mathLessonApiService } from "../../../services/learning/lessons/api.lesson.math.service";
import type { AddLessonFeedbackData } from "../../../types/learning/lessons/lesson.base.types";
import type {
  CreateMathLessonData,
  MathLesson,
  MathLessonAnalytics,
  MathLessonFilters,
  MathLessonListResponse,
  MathLessonStatistics,
  MathTopic,
  UpdateMathLessonData,
} from "../../../types/learning/lessons/lesson.math.types";

interface UseMathLessonResult {
  lesson: MathLesson | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMathLessonsResult {
  lessons: MathLesson[];
  pagination: MathLessonListResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMathLessonStatisticsResult {
  statistics: MathLessonStatistics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMathLessonAnalyticsResult {
  analytics: MathLessonAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single math lesson by ID
 */
export const useMathLesson = (lessonId?: string): UseMathLessonResult => {
  const [lesson, setLesson] = useState<MathLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useMathLesson Hook - Initialized with:", { lessonId });

  const fetchMathLesson = useCallback(async () => {
    if (!lessonId) {
      setIsLoading(false);
      return;
    }

    console.log("🔗 useMathLesson Hook - Fetching lesson:", lessonId);

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useMathLesson Hook - Fetching math lesson:", lessonId);

      const data = await mathLessonApiService.getMathLessonById(lessonId);
      setLesson(data);

      console.log(
        "🔗 useMathLesson Hook - Successfully loaded math lesson:",
        data.title
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch math lesson";
      setError(errorMessage);
      console.error("🔗 useMathLesson Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchMathLesson();
  }, [fetchMathLesson]);

  return {
    lesson,
    isLoading,
    error,
    refetch: fetchMathLesson,
  };
};

/**
 * Hook for fetching multiple math lessons with filters
 */
export const useMathLessons = (
  filters?: MathLessonFilters
): UseMathLessonsResult => {
  const [lessons, setLessons] = useState<MathLesson[]>([]);
  const [pagination, setPagination] = useState<
    MathLessonListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useMathLessons Hook - Initialized with filters:", filters);

  const fetchMathLessons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useMathLessons Hook - Fetching math lessons with filters:",
        filters
      );

      const data = await mathLessonApiService.getMathLessons(filters);
      setLessons(data.lessons);
      setPagination(data.pagination);

      console.log(
        "🔗 useMathLessons Hook - Successfully loaded math lessons:",
        data.lessons.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch math lessons";
      setError(errorMessage);
      console.error("🔗 useMathLessons Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMathLessons();
  }, [fetchMathLessons]);

  return {
    lessons,
    pagination,
    isLoading,
    error,
    refetch: fetchMathLessons,
  };
};

/**
 * Hook for fetching math lessons by topic
 */
export const useMathLessonsByTopic = (
  topicId: string,
  options?: MathLessonFilters
): UseMathLessonsResult => {
  const [lessons, setLessons] = useState<MathLesson[]>([]);
  const [pagination, setPagination] = useState<
    MathLessonListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track previous values and prevent unnecessary re-renders
  const previousTopicIdRef = useRef<string | null>(null);
  const previousOptionsRef = useRef<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log("🔗 useMathLessonsByTopic Hook - Initialized with:", {
    topicId,
    options,
  });

  const fetchMathLessonsByTopic = useCallback(async () => {
    if (!topicId) {
      setIsLoading(false);
      return;
    }

    // Serialize options for comparison
    const optionsString = JSON.stringify(options || {});

    // Check if we need to fetch (topic or options changed)
    if (
      previousTopicIdRef.current === topicId &&
      previousOptionsRef.current === optionsString
    ) {
      console.log(
        "🔗 useMathLessonsByTopic Hook - Skipping fetch, no changes detected"
      );
      return;
    }

    // Clear any pending timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Update refs
    previousTopicIdRef.current = topicId;
    previousOptionsRef.current = optionsString;

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useMathLessonsByTopic Hook - Fetching math lessons for topic:",
        topicId
      );

      const data = await mathLessonApiService.getMathLessonsByTopic(
        topicId,
        options
      );
      setLessons(data.lessons);
      setPagination(data.pagination);

      console.log(
        "🔗 useMathLessonsByTopic Hook - Successfully loaded math lessons:",
        data.lessons.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch math lessons by topic";
      setError(errorMessage);
      console.error("🔗 useMathLessonsByTopic Hook - Error:", errorMessage);

      // Reset refs on error so we can retry
      previousTopicIdRef.current = null;
      previousOptionsRef.current = null;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - we manage dependencies manually

  // Extract complex expression to separate variable for static analysis
  const serializedOptions = JSON.stringify(options || {});

  useEffect(() => {
    // Debounce the fetch to prevent rapid successive calls
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchMathLessonsByTopic();
    }, 100); // 100ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [topicId, serializedOptions, fetchMathLessonsByTopic]);

  return {
    lessons,
    pagination,
    isLoading,
    error,
    refetch: fetchMathLessonsByTopic,
  };
};

/**
 * Hook for fetching math lessons by math topic
 */
export const useMathLessonsByMathTopic = (
  mathTopic: MathTopic,
  options?: MathLessonFilters
): UseMathLessonsResult => {
  const [lessons, setLessons] = useState<MathLesson[]>([]);
  const [pagination, setPagination] = useState<
    MathLessonListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useMathLessonsByMathTopic Hook - Initialized with:", {
    mathTopic,
    options,
  });

  const fetchMathLessonsByMathTopic = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useMathLessonsByMathTopic Hook - Fetching math lessons by math topic:",
        mathTopic
      );

      const data = await mathLessonApiService.getMathLessonsByMathTopic(
        mathTopic,
        options
      );
      setLessons(data.lessons);
      setPagination(data.pagination);

      console.log(
        "🔗 useMathLessonsByMathTopic Hook - Successfully loaded math lessons:",
        data.lessons.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch math lessons by math topic";
      setError(errorMessage);
      console.error("🔗 useMathLessonsByMathTopic Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [mathTopic, options]);

  useEffect(() => {
    fetchMathLessonsByMathTopic();
  }, [fetchMathLessonsByMathTopic]);

  return {
    lessons,
    pagination,
    isLoading,
    error,
    refetch: fetchMathLessonsByMathTopic,
  };
};

/**
 * Hook for searching math lessons
 */
export const useMathLessonSearch = (
  searchTerm: string,
  options?: MathLessonFilters
): UseMathLessonsResult => {
  const [lessons, setLessons] = useState<MathLesson[]>([]);
  const [pagination, setPagination] = useState<
    MathLessonListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useMathLessonSearch Hook - Initialized with:", {
    searchTerm,
    options,
  });

  const searchMathLessons = useCallback(async () => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setLessons([]);
      setPagination(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useMathLessonSearch Hook - Searching math lessons:",
        searchTerm
      );

      const data = await mathLessonApiService.searchMathLessons(
        searchTerm,
        options
      );
      setLessons(data.lessons);
      setPagination(data.pagination);

      console.log(
        "🔗 useMathLessonSearch Hook - Successfully found math lessons:",
        data.lessons.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search math lessons";
      setError(errorMessage);
      console.error("🔗 useMathLessonSearch Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchMathLessons();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchMathLessons]);

  return {
    lessons,
    pagination,
    isLoading,
    error,
    refetch: searchMathLessons,
  };
};

/**
 * Hook for math lesson statistics
 */
export const useMathLessonStatistics = (): UseMathLessonStatisticsResult => {
  const [statistics, setStatistics] = useState<MathLessonStatistics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useMathLessonStatistics Hook - Initialized");

  const fetchMathLessonStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useMathLessonStatistics Hook - Fetching statistics");

      const data = await mathLessonApiService.getMathLessonStatistics();
      setStatistics(data);

      console.log(
        "🔗 useMathLessonStatistics Hook - Successfully loaded statistics"
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch math lesson statistics";
      setError(errorMessage);
      console.error("🔗 useMathLessonStatistics Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMathLessonStatistics();
  }, [fetchMathLessonStatistics]);

  return {
    statistics,
    isLoading,
    error,
    refetch: fetchMathLessonStatistics,
  };
};

/**
 * Hook for math lesson analytics
 */
export const useMathLessonAnalytics = (): UseMathLessonAnalyticsResult => {
  const [analytics, setAnalytics] = useState<MathLessonAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useMathLessonAnalytics Hook - Initialized");

  const fetchMathLessonAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useMathLessonAnalytics Hook - Fetching analytics");

      const data = await mathLessonApiService.getMathLessonAnalytics();
      setAnalytics(data);

      console.log(
        "🔗 useMathLessonAnalytics Hook - Successfully loaded analytics"
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch math lesson analytics";
      setError(errorMessage);
      console.error("🔗 useMathLessonAnalytics Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMathLessonAnalytics();
  }, [fetchMathLessonAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchMathLessonAnalytics,
  };
};

/**
 * Hook for adding feedback to a math lesson
 */
export const useAddMathLessonFeedback = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFeedback = useCallback(
    async (
      lessonId: string,
      feedbackData: AddLessonFeedbackData
    ): Promise<MathLesson | null> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔗 useAddMathLessonFeedback Hook - Adding feedback:", {
          lessonId,
          feedbackData,
        });

        const lesson = await mathLessonApiService.addFeedback(
          lessonId,
          feedbackData
        );

        console.log(
          "🔗 useAddMathLessonFeedback Hook - Successfully added feedback"
        );
        return lesson;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add feedback";
        setError(errorMessage);
        console.error(
          "🔗 useAddMathLessonFeedback Hook - Error:",
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
    addFeedback,
    isLoading,
    error,
  };
};

/**
 * Hook for creating a math lesson (admin/teacher only)
 */
export const useCreateMathLesson = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMathLesson = useCallback(
    async (lessonData: CreateMathLessonData): Promise<MathLesson | null> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(
          "🔗 useCreateMathLesson Hook - Creating math lesson:",
          lessonData
        );

        const lesson = await mathLessonApiService.createMathLesson(lessonData);

        console.log(
          "🔗 useCreateMathLesson Hook - Successfully created math lesson"
        );
        return lesson;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create math lesson";
        setError(errorMessage);
        console.error("🔗 useCreateMathLesson Hook - Error:", errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createMathLesson,
    isLoading,
    error,
  };
};

/**
 * Hook for updating a math lesson (admin/teacher only)
 */
export const useUpdateMathLesson = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMathLesson = useCallback(
    async (
      lessonId: string,
      updateData: UpdateMathLessonData
    ): Promise<MathLesson | null> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔗 useUpdateMathLesson Hook - Updating math lesson:", {
          lessonId,
          updateData,
        });

        const lesson = await mathLessonApiService.updateMathLesson(
          lessonId,
          updateData
        );

        console.log(
          "🔗 useUpdateMathLesson Hook - Successfully updated math lesson"
        );
        return lesson;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update math lesson";
        setError(errorMessage);
        console.error("🔗 useUpdateMathLesson Hook - Error:", errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    updateMathLesson,
    isLoading,
    error,
  };
};

/**
 * Hook for deleting a math lesson (admin/teacher only)
 */
export const useDeleteMathLesson = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMathLesson = useCallback(
    async (lessonId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(
          "🔗 useDeleteMathLesson Hook - Deleting math lesson:",
          lessonId
        );

        await mathLessonApiService.deleteMathLesson(lessonId);

        console.log(
          "🔗 useDeleteMathLesson Hook - Successfully deleted math lesson"
        );
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete math lesson";
        setError(errorMessage);
        console.error("🔗 useDeleteMathLesson Hook - Error:", errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    deleteMathLesson,
    isLoading,
    error,
  };
};

/**
 * Hook for bulk operations with math lessons
 */
export const useBulkMathLessons = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkCreateMathLessons = useCallback(
    async (lessonsData: CreateMathLessonData[]) => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔗 useBulkMathLessons Hook - Bulk creating math lessons");

        const result = await mathLessonApiService.bulkCreateMathLessons({
          lessons: lessonsData,
        });

        console.log(
          "🔗 useBulkMathLessons Hook - Successfully bulk created math lessons"
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to bulk create math lessons";
        setError(errorMessage);
        console.error("🔗 useBulkMathLessons Hook - Error:", errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const bulkUpdateMathLessons = useCallback(
    async (updates: { id: string; data: UpdateMathLessonData }[]) => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔗 useBulkMathLessons Hook - Bulk updating math lessons");

        const result = await mathLessonApiService.bulkUpdateMathLessons({
          updates,
        });

        console.log(
          "🔗 useBulkMathLessons Hook - Successfully bulk updated math lessons"
        );
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to bulk update math lessons";
        setError(errorMessage);
        console.error("🔗 useBulkMathLessons Hook - Error:", errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    bulkCreateMathLessons,
    bulkUpdateMathLessons,
    isLoading,
    error,
  };
};
