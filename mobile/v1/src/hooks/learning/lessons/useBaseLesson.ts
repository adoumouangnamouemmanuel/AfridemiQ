import { useCallback, useEffect, useRef, useState } from "react";
import { baseLessonApiService } from "../../../services/learning/lessons/api.lesson.base.service";
import type {
  AddLessonFeedbackData,
  BaseLesson,
  BaseLessonFilters,
  BaseLessonListResponse,
  BaseLessonStatistics,
} from "../../../types/learning/lessons/lesson.base.types";

interface UseBaseLessonResult {
  lesson: BaseLesson | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseBaseLessonsResult {
  lessons: BaseLesson[];
  pagination: BaseLessonListResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseBaseLessonStatisticsResult {
  statistics: BaseLessonStatistics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single base lesson by ID
 */
export const useBaseLesson = (lessonId?: string): UseBaseLessonResult => {
  const [lesson, setLesson] = useState<BaseLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useBaseLesson Hook - Initialized with:", { lessonId });

  const fetchLesson = useCallback(async () => {
    if (!lessonId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useBaseLesson Hook - Fetching lesson:", lessonId);

      const data = await baseLessonApiService.getLessonById(lessonId);
      setLesson(data);

      console.log(
        "🔗 useBaseLesson Hook - Successfully loaded lesson:",
        data.title
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch lesson";
      setError(errorMessage);
      console.error("🔗 useBaseLesson Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return {
    lesson,
    isLoading,
    error,
    refetch: fetchLesson,
  };
};

/**
 * Hook for fetching multiple base lessons with filters
 */
export const useBaseLessons = (
  filters?: BaseLessonFilters
): UseBaseLessonsResult => {
  const [lessons, setLessons] = useState<BaseLesson[]>([]);
  const [pagination, setPagination] = useState<
    BaseLessonListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useBaseLessons Hook - Initialized with filters:", filters);

  const fetchLessons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useBaseLessons Hook - Fetching lessons with filters:",
        filters
      );

      const data = await baseLessonApiService.getLessons(filters);
      setLessons(data.lessons);
      setPagination(data.pagination);

      console.log(
        "🔗 useBaseLessons Hook - Successfully loaded lessons:",
        data.lessons.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch lessons";
      setError(errorMessage);
      console.error("🔗 useBaseLessons Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    pagination,
    isLoading,
    error,
    refetch: fetchLessons,
  };
};

/**
 * Hook for fetching lessons by topic
 */
export const useBaseLessonsByTopic = (
  topicId: string,
  options?: BaseLessonFilters
): UseBaseLessonsResult => {
  const [lessons, setLessons] = useState<BaseLesson[]>([]);
  const [pagination, setPagination] = useState<
    BaseLessonListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track previous values and prevent unnecessary re-renders
  const previousTopicIdRef = useRef<string | null>(null);
  const previousOptionsRef = useRef<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log("🔗 useBaseLessonsByTopic Hook - Initialized with:", {
    topicId,
    options,
  });

  const fetchLessonsByTopic = useCallback(async () => {
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
        "🔗 useBaseLessonsByTopic Hook - Skipping fetch, no changes detected"
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
        "🔗 useBaseLessonsByTopic Hook - Fetching lessons for topic:",
        topicId
      );

      const data = await baseLessonApiService.getLessonsByTopic(
        topicId,
        options
      );
      setLessons(data.lessons);
      setPagination(data.pagination);

      console.log(
        "🔗 useBaseLessonsByTopic Hook - Successfully loaded lessons:",
        data.lessons.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch lessons by topic";
      setError(errorMessage);
      console.error("🔗 useBaseLessonsByTopic Hook - Error:", errorMessage);

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
      fetchLessonsByTopic();
    }, 100); // 100ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [topicId, serializedOptions, fetchLessonsByTopic]);

  return {
    lessons,
    pagination,
    isLoading,
    error,
    refetch: fetchLessonsByTopic,
  };
};

/**
 * Hook for searching lessons
 */
export const useBaseLessonSearch = (
  searchTerm: string,
  options?: BaseLessonFilters
): UseBaseLessonsResult => {
  const [lessons, setLessons] = useState<BaseLesson[]>([]);
  const [pagination, setPagination] = useState<
    BaseLessonListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useBaseLessonSearch Hook - Initialized with:", {
    searchTerm,
    options,
  });

  const searchLessons = useCallback(async () => {
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
        "🔗 useBaseLessonSearch Hook - Searching lessons:",
        searchTerm
      );

      const data = await baseLessonApiService.searchLessons(
        searchTerm,
        options
      );
      setLessons(data.lessons);
      setPagination(data.pagination);

      console.log(
        "🔗 useBaseLessonSearch Hook - Successfully found lessons:",
        data.lessons.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search lessons";
      setError(errorMessage);
      console.error("🔗 useBaseLessonSearch Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLessons();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchLessons]);

  return {
    lessons,
    pagination,
    isLoading,
    error,
    refetch: searchLessons,
  };
};

/**
 * Hook for lesson statistics
 */
export const useBaseLessonStatistics = (): UseBaseLessonStatisticsResult => {
  const [statistics, setStatistics] = useState<BaseLessonStatistics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useBaseLessonStatistics Hook - Initialized");

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useBaseLessonStatistics Hook - Fetching statistics");

      const data = await baseLessonApiService.getLessonStatistics();
      setStatistics(data);

      console.log(
        "🔗 useBaseLessonStatistics Hook - Successfully loaded statistics"
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch statistics";
      setError(errorMessage);
      console.error("🔗 useBaseLessonStatistics Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    isLoading,
    error,
    refetch: fetchStatistics,
  };
};

/**
 * Hook for adding feedback to a lesson
 */
export const useAddLessonFeedback = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFeedback = useCallback(
    async (
      lessonId: string,
      feedbackData: AddLessonFeedbackData
    ): Promise<BaseLesson | null> => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔗 useAddLessonFeedback Hook - Adding feedback:", {
          lessonId,
          feedbackData,
        });

        const updatedLesson = await baseLessonApiService.addFeedback(
          lessonId,
          feedbackData
        );

        console.log(
          "🔗 useAddLessonFeedback Hook - Successfully added feedback"
        );
        return updatedLesson;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add feedback";
        setError(errorMessage);
        console.error("🔗 useAddLessonFeedback Hook - Error:", errorMessage);
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
