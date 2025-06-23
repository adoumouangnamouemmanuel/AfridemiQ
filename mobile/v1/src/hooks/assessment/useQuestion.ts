import { useState, useEffect, useCallback, useRef } from "react";
import { questionApiService } from "../../services/assessment/api.question.service";
import type {
  Question,
  QuestionFilters,
  QuestionListResponse,
  QuestionSearchResponse,
  CheckAnswerData,
  CheckAnswerResponse,
  UpdateQuestionStatsData,
  RandomQuestionsFilters,
} from "../../types/assessment/question.types";

/**
 * Hook for managing a single question
 */
interface UseQuestionResult {
  question: Question | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  checkAnswer: (
    answerData: CheckAnswerData
  ) => Promise<CheckAnswerResponse | null>;
  updateStats: (statsData: UpdateQuestionStatsData) => Promise<boolean>;
}

export const useQuestion = (questionId?: string): UseQuestionResult => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuestion = useCallback(async () => {
    if (!questionId) {
      setQuestion(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔍 useQuestion - Fetching question: ${questionId}`);
      const questionData = await questionApiService.getQuestionById(questionId);
      setQuestion(questionData);
      console.log(`✅ useQuestion - Question fetched successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch question";
      console.error(`❌ useQuestion - Error:`, errorMessage);
      setError(errorMessage);
      setQuestion(null);
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  const checkAnswer = useCallback(
    async (
      answerData: CheckAnswerData
    ): Promise<CheckAnswerResponse | null> => {
      if (!questionId) {
        console.warn("❌ useQuestion - Cannot check answer: No question ID");
        return null;
      }

      try {
        console.log(
          `✅ useQuestion - Checking answer for question: ${questionId}`
        );
        const result = await questionApiService.checkAnswer(
          questionId,
          answerData
        );
        console.log(`✅ useQuestion - Answer check result:`, result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to check answer";
        console.error(`❌ useQuestion - Check answer error:`, errorMessage);
        setError(errorMessage);
        return null;
      }
    },
    [questionId]
  );

  const updateStats = useCallback(
    async (statsData: UpdateQuestionStatsData): Promise<boolean> => {
      if (!questionId) {
        console.warn("❌ useQuestion - Cannot update stats: No question ID");
        return false;
      }

      try {
        console.log(
          `📊 useQuestion - Updating stats for question: ${questionId}`
        );
        const updatedQuestion = await questionApiService.updateQuestionStats(
          questionId,
          statsData
        );
        setQuestion(updatedQuestion);
        console.log(`✅ useQuestion - Stats updated successfully`);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update stats";
        console.error(`❌ useQuestion - Update stats error:`, errorMessage);
        setError(errorMessage);
        return false;
      }
    },
    [questionId]
  );

  useEffect(() => {
    fetchQuestion();
    const controller = abortControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchQuestion]);

  return {
    question,
    isLoading,
    error,
    refetch: fetchQuestion,
    checkAnswer,
    updateStats,
  };
};

/**
 * Hook for managing multiple questions with filters
 */
interface UseQuestionsResult {
  questions: Question[];
  pagination: QuestionListResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useQuestions = (filters?: QuestionFilters): UseQuestionsResult => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<
    QuestionListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuestions = useCallback(
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
          `❓ useQuestions - Fetching questions (page ${page}):`,
          filters
        );
        const response = await questionApiService.getQuestions({
          ...filters,
          page,
        });

        if (append) {
          setQuestions((prev) => [...prev, ...response.questions]);
        } else {
          setQuestions(response.questions);
        }

        setPagination(response.pagination);
        setCurrentPage(page);
        console.log(
          `✅ useQuestions - Questions fetched successfully (${response.questions.length} items)`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch questions";
        console.error(`❌ useQuestions - Error:`, errorMessage);
        setError(errorMessage);
        if (!append) {
          setQuestions([]);
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
      await fetchQuestions(currentPage + 1, true);
    }
  }, [pagination?.hasNextPage, isLoading, currentPage, fetchQuestions]);

  const refetch = useCallback(() => {
    setCurrentPage(1);
    return fetchQuestions(1, false);
  }, [fetchQuestions]);

  useEffect(() => {
    setCurrentPage(1);
    fetchQuestions(1, false);
    const controller = abortControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchQuestions]);

  return {
    questions,
    pagination,
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore: pagination?.hasNextPage || false,
  };
};

/**
 * Hook for searching questions
 */
interface UseQuestionSearchResult {
  results: Question[];
  pagination: QuestionSearchResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  search: (searchTerm: string, filters?: QuestionFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  searchTerm: string;
  clearResults: () => void;
}

export const useQuestionSearch = (): UseQuestionSearchResult => {
  const [results, setResults] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<
    QuestionSearchResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<
    QuestionFilters | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (
      term: string,
      filters?: QuestionFilters,
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
        console.log(`🔍 useQuestionSearch - Searching questions:`, {
          term,
          filters,
          page,
        });
        const response = await questionApiService.searchQuestions(term, {
          ...filters,
          page,
        });

        if (append) {
          setResults((prev) => [...prev, ...response.questions]);
        } else {
          setResults(response.questions);
        }

        setPagination(response.pagination);
        setCurrentPage(page);
        console.log(
          `✅ useQuestionSearch - Search completed (${response.questions.length} results)`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Search failed";
        console.error(`❌ useQuestionSearch - Error:`, errorMessage);
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
    search: (term: string, filters?: QuestionFilters) =>
      search(term, filters, 1, false),
    loadMore,
    hasMore: pagination?.hasNextPage || false,
    searchTerm,
    clearResults,
  };
};

/**
 * Hook for getting random questions
 */
interface UseRandomQuestionsResult {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  getRandomQuestions: (filters?: RandomQuestionsFilters) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useRandomQuestions = (
  initialFilters?: RandomQuestionsFilters
): UseRandomQuestionsResult => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<
    RandomQuestionsFilters | undefined
  >(initialFilters);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getRandomQuestions = useCallback(
    async (filters?: RandomQuestionsFilters) => {
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
          `🎲 useRandomQuestions - Getting random questions:`,
          filtersToUse
        );
        const randomQuestions = await questionApiService.getRandomQuestions(
          filtersToUse
        );
        setQuestions(randomQuestions);
        console.log(
          `✅ useRandomQuestions - Random questions fetched (${randomQuestions.length} items)`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch random questions";
        console.error(`❌ useRandomQuestions - Error:`, errorMessage);
        setError(errorMessage);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentFilters]
  );

  const refresh = useCallback(() => {
    return getRandomQuestions(currentFilters);
  }, [getRandomQuestions, currentFilters]);

  useEffect(() => {
    if (initialFilters) {
      getRandomQuestions(initialFilters);
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
    questions,
    isLoading,
    error,
    getRandomQuestions,
    refresh,
  };
};

/**
 * Hook for getting questions by subject
 */
export const useQuestionsBySubject = (
  subjectId?: string,
  filters?: QuestionFilters
) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuestionsBySubject = useCallback(async () => {
    if (!subjectId) {
      setQuestions([]);
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
        `📋 useQuestionsBySubject - Fetching questions for subject: ${subjectId}`
      );
      const subjectQuestions = await questionApiService.getQuestionsBySubject(
        subjectId,
        filters
      );
      setQuestions(subjectQuestions);
      console.log(
        `✅ useQuestionsBySubject - Questions fetched (${subjectQuestions.length} items)`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch questions by subject";
      console.error(`❌ useQuestionsBySubject - Error:`, errorMessage);
      setError(errorMessage);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, filters]);

  useEffect(() => {
    fetchQuestionsBySubject();
    const controller = abortControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchQuestionsBySubject]);

  return {
    questions,
    isLoading,
    error,
    refetch: fetchQuestionsBySubject,
  };
};

/**
 * Hook for getting questions by topic
 */
export const useQuestionsByTopic = (
  topicId?: string,
  filters?: QuestionFilters
) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuestionsByTopic = useCallback(async () => {
    if (!topicId) {
      setQuestions([]);
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
        `📖 useQuestionsByTopic - Fetching questions for topic: ${topicId}`
      );
      const topicQuestions = await questionApiService.getQuestionsByTopic(
        topicId,
        filters
      );
      setQuestions(topicQuestions);
      console.log(
        `✅ useQuestionsByTopic - Questions fetched (${topicQuestions.length} items)`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch questions by topic";
      console.error(`❌ useQuestionsByTopic - Error:`, errorMessage);
      setError(errorMessage);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [topicId, filters]);

  useEffect(() => {
    fetchQuestionsByTopic();
    const controller = abortControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [fetchQuestionsByTopic]);

  return {
    questions,
    isLoading,
    error,
    refetch: fetchQuestionsByTopic,
  };
};
