import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { quizApiService } from "../../services/assessment/api.quiz.service";
import type {
  Quiz,
  QuizFilters,
  QuizListResponse,
  UpdateQuizStatsData,
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

  console.log("🔗 useQuiz Hook - Initialized with:", { quizId });

  const fetchQuiz = useCallback(async () => {
    if (!quizId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useQuiz Hook - Fetching quiz:", quizId);

      const data = await quizApiService.getQuizById(quizId);
      setQuiz(data);

      console.log("🔗 useQuiz Hook - Successfully loaded quiz:", data.title);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch quiz";
      setError(errorMessage);
      console.error("🔗 useQuiz Hook - Error:", errorMessage);
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
 * Hook for managing multiple quizzes with CLIENT-SIDE filtering
 */
interface UseQuizzesResult {
  quizzes: Quiz[];
  allQuizzes: Quiz[]; // All loaded quizzes for reference
  pagination: QuizListResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  search: (query: string) => Promise<void>;
  isSearching: boolean;
}

export const useQuizzes = (filters?: QuizFilters): UseQuizzesResult => {
  // All quizzes from API (cached)
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  // Pagination data
  const [pagination, setPagination] = useState<
    QuizListResponse["pagination"] | null
  >(null);
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if we've loaded initial data
  const hasLoadedRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log("🔗 useQuizzes Hook - Filters:", filters);

  // Initial load (only once) - FIXED with safe parameters
  const fetchAllQuizzes = useCallback(async () => {
    if (hasLoadedRef.current) {
      console.log("🔗 useQuizzes Hook - Skipping fetch, already loaded");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useQuizzes Hook - Initial fetch of all quizzes");

      // FIXED: Use safer parameters that the backend accepts
      const data = await quizApiService.getQuizzes({
        isActive: true,
        limit: 50, // Reduced from 1000 to 50
        sortBy: "createdAt", // Changed from "stats.totalAttempts" to "createdAt"
        sortOrder: "desc",
      });

      const quizzesArray = data?.quizzes || [];
      const paginationData = data?.pagination || null;

      console.log(
        "🔗 useQuizzes Hook - Loaded all quizzes:",
        quizzesArray.length
      );

      setAllQuizzes(quizzesArray);
      setPagination(paginationData);
      hasLoadedRef.current = true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch quizzes";
      setError(errorMessage);
      console.error("🔗 useQuizzes Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search function (makes API call) - FIXED with safe parameters
  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        // If empty query, reload all quizzes
        hasLoadedRef.current = false;
        await fetchAllQuizzes();
        return;
      }

      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSearching(true);
          setError(null);

          console.log("🔗 useQuizzes Hook - Searching:", query);

          // FIXED: Use safer search parameters
          const data = await quizApiService.getQuizzes({
            isActive: true,
            search: query.trim(),
            limit: 50, // Reduced from 1000 to 50
            sortBy: "createdAt", // Changed from "stats.totalAttempts" to "createdAt"
            sortOrder: "desc",
          });

          const searchResults = data?.quizzes || [];
          console.log(
            "🔗 useQuizzes Hook - Search results:",
            searchResults.length
          );

          // Update allQuizzes with search results
          setAllQuizzes(searchResults);
          setPagination(data?.pagination || null);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to search quizzes";
          setError(errorMessage);
          console.error("🔗 useQuizzes Hook - Search error:", errorMessage);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce for search
    },
    [fetchAllQuizzes]
  );

  // Client-side filtering - IMPROVED sorting
  const filteredQuizzes = useMemo(() => {
    if (!allQuizzes.length) return [];

    let filtered = [...allQuizzes];

    // Apply filters
    if (filters?.format) {
      filtered = filtered.filter((quiz) => quiz.format === filters.format);
    }

    if (filters?.difficulty) {
      filtered = filtered.filter(
        (quiz) => quiz.difficulty === filters.difficulty
      );
    }

    if (filters?.educationLevel) {
      filtered = filtered.filter(
        (quiz) => quiz.educationLevel === filters.educationLevel
      );
    }

    if (filters?.examType) {
      filtered = filtered.filter((quiz) => quiz.examType === filters.examType);
    }

    if (filters?.isPremium !== undefined) {
      filtered = filtered.filter(
        (quiz) => quiz.isPremium === filters.isPremium
      );
    }

    if (filters?.subjectId) {
      filtered = filtered.filter((quiz) => {
        if (typeof quiz.subjectId === "string") {
          return quiz.subjectId === filters.subjectId;
        } else if (quiz.subjectId && typeof quiz.subjectId === "object") {
          return quiz.subjectId._id === filters.subjectId;
        }
        return false;
      });
    }

    // IMPROVED: Apply client-side sorting with safe property access
    if (filters?.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filters.sortBy) {
          case "title":
            aValue = a.title?.toLowerCase() || "";
            bValue = b.title?.toLowerCase() || "";
            break;
          case "createdAt":
            aValue = new Date(a.createdAt || 0).getTime();
            bValue = new Date(b.createdAt || 0).getTime();
            break;
          case "difficulty":
            const difficultyOrder = { easy: 1, medium: 2, hard: 3, mixed: 4 };
            aValue =
              difficultyOrder[a.difficulty as keyof typeof difficultyOrder] ||
              0;
            bValue =
              difficultyOrder[b.difficulty as keyof typeof difficultyOrder] ||
              0;
            break;
          case "stats.totalAttempts":
            aValue = a.stats?.totalAttempts || 0;
            bValue = b.stats?.totalAttempts || 0;
            break;
          case "stats.averageScore":
            aValue = a.stats?.averageScore || 0;
            bValue = b.stats?.averageScore || 0;
            break;
          default:
            // Default sort by creation date if invalid sortBy
            aValue = new Date(a.createdAt || 0).getTime();
            bValue = new Date(b.createdAt || 0).getTime();
            break;
        }

        if (filters.sortOrder === "desc") {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    } else {
      // Default sort by totalAttempts descending (most popular first)
      filtered.sort((a, b) => {
        const aAttempts = a.stats?.totalAttempts || 0;
        const bAttempts = b.stats?.totalAttempts || 0;
        return bAttempts - aAttempts;
      });
    }

    console.log("🔗 useQuizzes Hook - Client-side filtered:", {
      total: allQuizzes.length,
      filtered: filtered.length,
      filters: Object.keys(filters || {}).filter(
        (key) =>
          filters![key as keyof QuizFilters] !== undefined &&
          filters![key as keyof QuizFilters] !== null
      ),
    });

    return filtered;
  }, [allQuizzes, filters]);

  // Load initial data on mount
  useEffect(() => {
    fetchAllQuizzes();
  }, [fetchAllQuizzes]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const refetch = useCallback(async () => {
    hasLoadedRef.current = false;
    await fetchAllQuizzes();
  }, [fetchAllQuizzes]);

  return {
    quizzes: filteredQuizzes,
    allQuizzes,
    pagination,
    isLoading,
    error,
    refetch,
    search,
    isSearching,
  };
};
