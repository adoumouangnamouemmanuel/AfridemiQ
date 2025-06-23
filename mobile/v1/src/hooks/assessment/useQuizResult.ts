import { useState, useEffect, useCallback, useRef } from "react";
import { quizResultApiService } from "../../services/assessment/api.quiz.result.service";
import type {
  QuizResult,
  CreateQuizResultData,
  QuizResultFilters,
  QuizResultListResponse,
  UserQuizResultsResponse,
  BestScoreResponse,
  QuizResultAnalytics,
} from "../../types/assessment/quiz.result.types";

/**
 * Hook for managing a single quiz result
 */
interface UseQuizResultResult {
  quizResult: QuizResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useQuizResult = (quizResultId?: string): UseQuizResultResult => {
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuizResult = useCallback(async () => {
    if (!quizResultId) {
      setQuizResult(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔍 useQuizResult - Fetching quiz result: ${quizResultId}`);
      const resultData = await quizResultApiService.getQuizResultById(
        quizResultId
      );
      setQuizResult(resultData);
      console.log(`✅ useQuizResult - Quiz result fetched successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch quiz result";
      console.error(`❌ useQuizResult - Error:`, errorMessage);
      setError(errorMessage);
      setQuizResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [quizResultId]);

  useEffect(() => {
    fetchQuizResult();
    const controller = abortControllerRef.current;

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchQuizResult]);

  return {
    quizResult,
    isLoading,
    error,
    refetch: fetchQuizResult,
  };
};

/**
 * Hook for managing multiple quiz results with filters
 */
interface UseQuizResultsResult {
  quizResults: QuizResult[];
  pagination: QuizResultListResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useQuizResults = (
  filters?: QuizResultFilters
): UseQuizResultsResult => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [pagination, setPagination] = useState<
    QuizResultListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuizResults = useCallback(
    async (page: number = 1, append: boolean = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setIsLoading(true);
      if (!append) {
        setError(null);
      }

      try {
        console.log(
          `📊 useQuizResults - Fetching quiz results (page ${page}):`,
          filters
        );
        const response = await quizResultApiService.getQuizResults({
          ...filters,
          page,
        });

        if (append) {
          setQuizResults((prev) => [...prev, ...response.quizResults]);
        } else {
          setQuizResults(response.quizResults);
        }

        setPagination(response.pagination);
        setCurrentPage(page);
        console.log(
          `✅ useQuizResults - Quiz results fetched successfully (${response.quizResults.length} items)`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch quiz results";
        console.error(`❌ useQuizResults - Error:`, errorMessage);
        setError(errorMessage);
        if (!append) {
          setQuizResults([]);
          setPagination(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoading) {
      await fetchQuizResults(currentPage + 1, true);
    }
  }, [pagination?.hasNextPage, isLoading, currentPage, fetchQuizResults]);

  const refetch = useCallback(() => {
    setCurrentPage(1);
    return fetchQuizResults(1, false);
  }, [fetchQuizResults]);

  useEffect(() => {
    setCurrentPage(1);
    fetchQuizResults(1, false);
    const controller = abortControllerRef.current;

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchQuizResults]);

  return {
    quizResults,
    pagination,
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore: pagination?.hasNextPage || false,
  };
};

/**
 * Hook for managing user quiz results
 */
interface UseUserQuizResultsResult {
  quizResults: QuizResult[];
  pagination: UserQuizResultsResponse["pagination"] | null;
  summary: UserQuizResultsResponse["summary"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useUserQuizResults = (
  userId?: string,
  filters?: QuizResultFilters
): UseUserQuizResultsResult => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [pagination, setPagination] = useState<
    UserQuizResultsResponse["pagination"] | null
  >(null);
  const [summary, setSummary] = useState<
    UserQuizResultsResponse["summary"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUserQuizResults = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!userId) {
        setQuizResults([]);
        setPagination(null);
        setSummary(null);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setIsLoading(true);
      if (!append) {
        setError(null);
      }

      try {
        console.log(
          `👤 useUserQuizResults - Fetching user quiz results (page ${page}) for user: ${userId}`
        );
        const response = await quizResultApiService.getUserQuizResults(userId, {
          ...filters,
          page,
        });

        if (append) {
          setQuizResults((prev) => [...prev, ...response.quizResults]);
        } else {
          setQuizResults(response.quizResults);
          setSummary(response.summary);
        }

        setPagination(response.pagination);
        setCurrentPage(page);
        console.log(
          `✅ useUserQuizResults - User quiz results fetched (${response.quizResults.length} items)`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch user quiz results";
        console.error(`❌ useUserQuizResults - Error:`, errorMessage);
        setError(errorMessage);
        if (!append) {
          setQuizResults([]);
          setPagination(null);
          setSummary(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [userId, filters]
  );

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoading) {
      await fetchUserQuizResults(currentPage + 1, true);
    }
  }, [pagination?.hasNextPage, isLoading, currentPage, fetchUserQuizResults]);

  const refetch = useCallback(() => {
    setCurrentPage(1);
    return fetchUserQuizResults(1, false);
  }, [fetchUserQuizResults]);

  useEffect(() => {
    setCurrentPage(1);
    fetchUserQuizResults(1, false);
    const controller = abortControllerRef.current;

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchUserQuizResults]);

  return {
    quizResults,
    pagination,
    summary,
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore: pagination?.hasNextPage || false,
  };
};

/**
 * Hook for getting user's best score for a specific quiz
 */
interface UseUserBestScoreResult {
  bestScore: BestScoreResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserBestScore = (
  userId?: string,
  quizId?: string
): UseUserBestScoreResult => {
  const [bestScore, setBestScore] = useState<BestScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBestScore = useCallback(async () => {
    if (!userId || !quizId) {
      setBestScore(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        `🏆 useUserBestScore - Fetching best score for user ${userId} on quiz ${quizId}`
      );
      const scoreData = await quizResultApiService.getUserBestScore(
        userId,
        quizId
      );
      setBestScore(scoreData);
      console.log(`✅ useUserBestScore - Best score fetched successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch best score";
      console.error(`❌ useUserBestScore - Error:`, errorMessage);
      setError(errorMessage);
      setBestScore(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, quizId]);

  useEffect(() => {
    fetchBestScore();
    const controller = abortControllerRef.current;

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchBestScore]);

  return {
    bestScore,
    isLoading,
    error,
    refetch: fetchBestScore,
  };
};

/**
 * Hook for getting user's attempt count for a specific quiz
 */
interface UseUserAttemptCountResult {
  attemptCount: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserAttemptCount = (
  userId?: string,
  quizId?: string
): UseUserAttemptCountResult => {
  const [attemptCount, setAttemptCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAttemptCount = useCallback(async () => {
    if (!userId || !quizId) {
      setAttemptCount(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        `📈 useUserAttemptCount - Fetching attempt count for user ${userId} on quiz ${quizId}`
      );
      const count = await quizResultApiService.getUserAttemptCount(
        userId,
        quizId
      );
      setAttemptCount(count);
      console.log(`✅ useUserAttemptCount - Attempt count fetched: ${count}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch attempt count";
      console.error(`❌ useUserAttemptCount - Error:`, errorMessage);
      setError(errorMessage);
      setAttemptCount(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, quizId]);

  useEffect(() => {
    fetchAttemptCount();
    const controller = abortControllerRef.current;

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchAttemptCount]);

  return {
    attemptCount,
    isLoading,
    error,
    refetch: fetchAttemptCount,
  };
};

/**
 * Hook for getting user's average score
 */
interface UseUserAverageScoreResult {
  averageScore: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserAverageScore = (
  userId?: string
): UseUserAverageScoreResult => {
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAverageScore = useCallback(async () => {
    if (!userId) {
      setAverageScore(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        `📊 useUserAverageScore - Fetching average score for user: ${userId}`
      );
      const score = await quizResultApiService.getUserAverageScore(userId);
      setAverageScore(score);
      console.log(`✅ useUserAverageScore - Average score fetched: ${score}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch average score";
      console.error(`❌ useUserAverageScore - Error:`, errorMessage);
      setError(errorMessage);
      setAverageScore(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAverageScore();
    const controller = abortControllerRef.current;

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchAverageScore]);

  return {
    averageScore,
    isLoading,
    error,
    refetch: fetchAverageScore,
  };
};

/**
 * Hook for creating quiz results
 */
interface UseCreateQuizResultResult {
  createQuizResult: (
    resultData: CreateQuizResultData
  ) => Promise<QuizResult | null>;
  isCreating: boolean;
  error: string | null;
}

export const useCreateQuizResult = (): UseCreateQuizResultResult => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuizResult = useCallback(
    async (resultData: CreateQuizResultData): Promise<QuizResult | null> => {
      setIsCreating(true);
      setError(null);

      try {
        console.log(`➕ useCreateQuizResult - Creating quiz result`);
        const result = await quizResultApiService.createQuizResult(resultData);
        console.log(
          `✅ useCreateQuizResult - Quiz result created successfully`
        );
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create quiz result";
        console.error(`❌ useCreateQuizResult - Error:`, errorMessage);
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return {
    createQuizResult,
    isCreating,
    error,
  };
};

/**
 * Hook for quiz result analytics
 */
export const useQuizResultAnalytics = (filters?: Record<string, any>) => {
  const [analytics, setAnalytics] = useState<QuizResultAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAnalytics = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`📊 useQuizResultAnalytics - Fetching analytics:`, filters);
      const analyticsData = await quizResultApiService.getQuizResultAnalytics(
        filters
      );
      setAnalytics(analyticsData);
      console.log(`✅ useQuizResultAnalytics - Analytics fetched successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch analytics";
      console.error(`❌ useQuizResultAnalytics - Error:`, errorMessage);
      setError(errorMessage);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
    const controller = abortControllerRef.current;

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
};
