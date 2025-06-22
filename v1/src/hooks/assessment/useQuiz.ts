import { useState, useEffect, useCallback, useRef } from "react";
import { quizApiService } from "../../services/assessment/api.quiz.service";
import type {
  Quiz,
  QuizFilters,
  QuizListResponse,
  QuizSearchResponse,
  UpdateQuizStatsData,
  PopularQuizFilters,
  QuizAnalytics,
  QuizComparison,
} from "../../types/assessment/quiz.types";

/**
 * Hook for managing a single quiz
 */
interface UseQuizResult {
  quiz: Quiz | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateStats: (statsData: UpdateQuizStatsData) => Promise<boolean>;
}

export const useQuiz = (quizId?: string): UseQuizResult => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) {
      setQuiz(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔍 useQuiz - Fetching quiz: ${quizId}`);
      const quizData = await quizApiService.getQuizById(quizId);
      setQuiz(quizData);
      console.log(`✅ useQuiz - Quiz fetched successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch quiz";
      console.error(`❌ useQuiz - Error:`, errorMessage);
      setError(errorMessage);
      setQuiz(null);
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  const updateStats = useCallback(
    async (statsData: UpdateQuizStatsData): Promise<boolean> => {
      if (!quizId) {
        console.warn("❌ useQuiz - Cannot update stats: No quiz ID");
        return false;
      }

      try {
        console.log(`📊 useQuiz - Updating stats for quiz: ${quizId}`);
        const updatedQuiz = await quizApiService.updateQuizStats(
          quizId,
          statsData
        );
        setQuiz(updatedQuiz);
        console.log(`✅ useQuiz - Stats updated successfully`);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update stats";
        console.error(`❌ useQuiz - Update stats error:`, errorMessage);
        setError(errorMessage);
        return false;
      }
    },
    [quizId]
  );

  useEffect(() => {
      fetchQuiz();
      const controller = abortControllerRef.current;

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchQuiz]);

  return {
    quiz,
    isLoading,
    error,
    refetch: fetchQuiz,
    updateStats,
  };
};

/**
 * Hook for managing multiple quizzes with filters
 */
interface UseQuizzesResult {
  quizzes: Quiz[];
  pagination: QuizListResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useQuizzes = (filters?: QuizFilters): UseQuizzesResult => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [pagination, setPagination] = useState<
    QuizListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuizzes = useCallback(
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
          `🧩 useQuizzes - Fetching quizzes (page ${page}):`,
          filters
        );
        const response = await quizApiService.getQuizzes({
          ...filters,
          page,
        });

        if (append) {
          setQuizzes((prev) => [...prev, ...response.quizzes]);
        } else {
          setQuizzes(response.quizzes);
        }

        setPagination(response.pagination);
        setCurrentPage(page);
        console.log(
          `✅ useQuizzes - Quizzes fetched successfully (${response.quizzes.length} items)`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch quizzes";
        console.error(`❌ useQuizzes - Error:`, errorMessage);
        setError(errorMessage);
        if (!append) {
          setQuizzes([]);
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
      await fetchQuizzes(currentPage + 1, true);
    }
  }, [pagination?.hasNextPage, isLoading, currentPage, fetchQuizzes]);

  const refetch = useCallback(() => {
    setCurrentPage(1);
    return fetchQuizzes(1, false);
  }, [fetchQuizzes]);

  useEffect(() => {
    setCurrentPage(1);
    fetchQuizzes(1, false);
    const controller = abortControllerRef.current;
    return () => {
      
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchQuizzes]);

  return {
    quizzes,
    pagination,
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore: pagination?.hasNextPage || false,
  };
};

/**
 * Hook for searching quizzes
 */
interface UseQuizSearchResult {
  results: Quiz[];
  pagination: QuizSearchResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  search: (searchTerm: string, filters?: QuizFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  searchTerm: string;
  clearResults: () => void;
}

export const useQuizSearch = (): UseQuizSearchResult => {
  const [results, setResults] = useState<Quiz[]>([]);
  const [pagination, setPagination] = useState<
    QuizSearchResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<
    QuizFilters | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (
      term: string,
      filters?: QuizFilters,
      page: number = 1,
      append: boolean = false
    ) => {
      if (!term.trim()) {
        setResults([]);
        setPagination(null);
        setSearchTerm("");
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setIsLoading(true);
      if (!append) {
        setError(null);
        setSearchTerm(term);
        setCurrentFilters(filters);
      }

      try {
        console.log(`🔍 useQuizSearch - Searching quizzes:`, {
          term,
          filters,
          page,
        });
        const response = await quizApiService.searchQuizzes(term, {
          ...filters,
          page,
        });

        if (append) {
          setResults((prev) => [...prev, ...response.quizzes]);
        } else {
          setResults(response.quizzes);
        }

        setPagination(response.pagination);
        setCurrentPage(page);
        console.log(
          `✅ useQuizSearch - Search completed (${response.quizzes.length} results)`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Search failed";
        console.error(`❌ useQuizSearch - Error:`, errorMessage);
        setError(errorMessage);
        if (!append) {
          setResults([]);
          setPagination(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoading && searchTerm) {
      await search(searchTerm, currentFilters, currentPage + 1, true);
    }
  }, [
    pagination?.hasNextPage,
    isLoading,
    searchTerm,
    currentFilters,
    currentPage,
    search,
  ]);

  const clearResults = useCallback(() => {
    setResults([]);
    setPagination(null);
    setSearchTerm("");
    setCurrentFilters(undefined);
    setCurrentPage(1);
    setError(null);
  }, []);

    useEffect(() => {
        const controller = abortControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  return {
    results,
    pagination,
    isLoading,
    error,
    search: (term: string, filters?: QuizFilters) =>
      search(term, filters, 1, false),
    loadMore,
    hasMore: pagination?.hasNextPage || false,
    searchTerm,
    clearResults,
  };
};

/**
 * Hook for getting popular quizzes
 */
interface UsePopularQuizzesResult {
  quizzes: Quiz[];
  isLoading: boolean;
  error: string | null;
  getPopularQuizzes: (filters?: PopularQuizFilters) => Promise<void>;
  refresh: () => Promise<void>;
}

export const usePopularQuizzes = (
  initialFilters?: PopularQuizFilters
): UsePopularQuizzesResult => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<
    PopularQuizFilters | undefined
  >(initialFilters);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getPopularQuizzes = useCallback(
    async (filters?: PopularQuizFilters) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setIsLoading(true);
      setError(null);

      const filtersToUse = filters || currentFilters;
      setCurrentFilters(filtersToUse);

      try {
        console.log(
          `📈 usePopularQuizzes - Getting popular quizzes:`,
          filtersToUse
        );
        const popularQuizzes = await quizApiService.getPopularQuizzes(
          filtersToUse
        );
        setQuizzes(popularQuizzes);
        console.log(
          `✅ usePopularQuizzes - Popular quizzes fetched (${popularQuizzes.length} items)`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch popular quizzes";
        console.error(`❌ usePopularQuizzes - Error:`, errorMessage);
        setError(errorMessage);
        setQuizzes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentFilters]
  );

  const refresh = useCallback(() => {
    return getPopularQuizzes(currentFilters);
  }, [getPopularQuizzes, currentFilters]);

  useEffect(() => {
    if (initialFilters) {
      getPopularQuizzes(initialFilters);
    }
    const controller = abortControllerRef.current;
      return () => {
       
      if (controller) {
       controller.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return {
    quizzes,
    isLoading,
    error,
    getPopularQuizzes,
    refresh,
  };
};

/**
 * Hook for getting quizzes by subject
 */
export const useQuizzesBySubject = (
  subjectId?: string,
  filters?: QuizFilters
) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuizzesBySubject = useCallback(async () => {
    if (!subjectId) {
      setQuizzes([]);
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
        `📋 useQuizzesBySubject - Fetching quizzes for subject: ${subjectId}`
      );
      const subjectQuizzes = await quizApiService.getQuizzesBySubject(
        subjectId,
        filters
      );
      setQuizzes(subjectQuizzes);
      console.log(
        `✅ useQuizzesBySubject - Quizzes fetched (${subjectQuizzes.length} items)`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch quizzes by subject";
      console.error(`❌ useQuizzesBySubject - Error:`, errorMessage);
      setError(errorMessage);
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, filters]);

  useEffect(() => {
    fetchQuizzesBySubject();
    const controller = abortControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchQuizzesBySubject]);

  return {
    quizzes,
    isLoading,
    error,
    refetch: fetchQuizzesBySubject,
  };
};

/**
 * Hook for getting quizzes by topic
 */
export const useQuizzesByTopic = (topicId?: string, filters?: QuizFilters) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuizzesByTopic = useCallback(async () => {
    if (!topicId) {
      setQuizzes([]);
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
        `📖 useQuizzesByTopic - Fetching quizzes for topic: ${topicId}`
      );
      const topicQuizzes = await quizApiService.getQuizzesByTopic(
        topicId,
        filters
      );
      setQuizzes(topicQuizzes);
      console.log(
        `✅ useQuizzesByTopic - Quizzes fetched (${topicQuizzes.length} items)`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch quizzes by topic";
      console.error(`❌ useQuizzesByTopic - Error:`, errorMessage);
      setError(errorMessage);
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  }, [topicId, filters]);

  useEffect(() => {
      fetchQuizzesByTopic();
       const controller = abortControllerRef.current;

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchQuizzesByTopic]);

  return {
    quizzes,
    isLoading,
    error,
    refetch: fetchQuizzesByTopic,
  };
};

/**
 * Hook for quiz analytics
 */
export const useQuizAnalytics = (filters?: Record<string, any>) => {
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
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
      console.log(`📊 useQuizAnalytics - Fetching analytics:`, filters);
      const analyticsData = await quizApiService.getQuizAnalytics(filters);
      setAnalytics(analyticsData);
      console.log(`✅ useQuizAnalytics - Analytics fetched successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch analytics";
      console.error(`❌ useQuizAnalytics - Error:`, errorMessage);
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

/**
 * Hook for comparing quizzes
 */
export const useQuizComparison = () => {
  const [comparison, setComparison] = useState<QuizComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const compareQuizzes = useCallback(async (quizIds: string[]) => {
    if (quizIds.length < 2) {
      setError("At least 2 quizzes are required for comparison");
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 useQuizComparison - Comparing quizzes:`, quizIds);
      const comparisonData = await quizApiService.compareQuizzes(quizIds);
      setComparison(comparisonData);
      console.log(`✅ useQuizComparison - Comparison completed successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to compare quizzes";
      console.error(`❌ useQuizComparison - Error:`, errorMessage);
      setError(errorMessage);
      setComparison(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearComparison = useCallback(() => {
    setComparison(null);
    setError(null);
  }, []);

    useEffect(() => {
        const controller = abortControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  return {
    comparison,
    isLoading,
    error,
    compareQuizzes,
    clearComparison,
  };
};
