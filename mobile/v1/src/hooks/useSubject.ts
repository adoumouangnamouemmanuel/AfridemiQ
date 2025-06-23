import { useCallback, useEffect, useRef, useState } from "react";
import { subjectApiService } from "../services/learning/api.subject.service";
import type {
  Subject,
  SubjectAdvancedSearchResponse,
  SubjectAnalytics,
  SubjectComparison,
  SubjectFilters,
  SubjectListResponse,
  SubjectPerformance,
  SubjectSuggestion,
} from "../types/learning/subject.types";

interface UseSubjectResult {
  subject: Subject | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSubjectsResult {
  subjects: Subject[];
  pagination: SubjectListResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSubjectAdvancedSearchResult {
  subjects: Subject[];
  pagination: SubjectAdvancedSearchResponse["pagination"] | null;
  facets: SubjectAdvancedSearchResponse["facets"] | null;
  searchParams: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSubjectSuggestionsResult {
  suggestions: SubjectSuggestion[];
  isLoading: boolean;
  error: string | null;
}

interface UseSubjectAnalyticsResult {
  analytics: SubjectAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSubjectPerformanceResult {
  performance: SubjectPerformance | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSubjectComparisonResult {
  comparison: SubjectComparison | null;
  isLoading: boolean;
  error: string | null;
  refetch: (subjectIds: string[]) => Promise<void>;
}

/**
 * Hook for fetching a single subject by ID
 */
export const useSubject = (subjectId?: string): UseSubjectResult => {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useSubject Hook - Initialized with:", { subjectId });

  const fetchSubject = useCallback(async () => {
    if (!subjectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useSubject Hook - Fetching subject:", subjectId);

      const data = await subjectApiService.getSubjectById(subjectId);
      setSubject(data);

      console.log(
        "🔗 useSubject Hook - Successfully loaded subject:",
        data.name
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch subject";
      setError(errorMessage);
      console.error("🔗 useSubject Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchSubject();
  }, [fetchSubject]);

  return {
    subject,
    isLoading,
    error,
    refetch: fetchSubject,
  };
};

/**
 * Hook for fetching multiple subjects with filters
 */
export const useSubjects = (filters?: SubjectFilters): UseSubjectsResult => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pagination, setPagination] = useState<
    SubjectListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useSubjects Hook - Initialized with filters:", filters);

  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useSubjects Hook - Fetching subjects with filters:",
        filters
      );

      const data = await subjectApiService.getSubjects(filters);
      setSubjects(data.subjects);
      setPagination(data.pagination);

      console.log(
        "🔗 useSubjects Hook - Successfully loaded subjects:",
        data.subjects.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch subjects";
      setError(errorMessage);
      console.error("🔗 useSubjects Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    pagination,
    isLoading,
    error,
    refetch: fetchSubjects,
  };
};

/**
 * Hook for fetching subjects by series
 */
export const useSubjectsBySeries = (
  series: string,
  options?: SubjectFilters
): UseSubjectsResult => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pagination, setPagination] = useState<SubjectListResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track previous values and prevent unnecessary re-renders
  const previousSeriesRef = useRef<string | null>(null);
  const previousOptionsRef = useRef<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log("🔗 useSubjectsBySeries Hook - Initialized with:", { series, options });

  const fetchSubjectsBySeries = useCallback(async () => {
    if (!series) {
      setIsLoading(false);
      return;
    }

    // Serialize options for comparison
    const optionsString = JSON.stringify(options || {});

    // Check if we need to fetch (series or options changed)
    if (
      previousSeriesRef.current === series &&
      previousOptionsRef.current === optionsString
    ) {
      console.log("🔗 useSubjectsBySeries Hook - Skipping fetch, no changes detected");
      return;
    }

    // Clear any pending timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Update refs
    previousSeriesRef.current = series;
    previousOptionsRef.current = optionsString;

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useSubjectsBySeries Hook - Fetching subjects for series:", series);

      const data = await subjectApiService.getSubjectsBySeries(series, options);
      
      // Safely access the data
      const subjectsArray = data?.subjects || [];
      const paginationData = data?.pagination || null;
      
      console.log("🔗 useSubjectsBySeries Hook - Response data:", {
        subjectsCount: subjectsArray.length,
        hasPagination: !!paginationData,
        firstSubject: subjectsArray[0]?.name || 'No subjects'
      });

      setSubjects(subjectsArray);
      setPagination(paginationData);

      console.log("🔗 useSubjectsBySeries Hook - Successfully loaded subjects:", subjectsArray.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch subjects by series";
      setError(errorMessage);
      console.error("🔗 useSubjectsBySeries Hook - Error:", errorMessage);

      // Reset refs on error so we can retry
      previousSeriesRef.current = null;
      previousOptionsRef.current = null;
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - we manage dependencies manually

  const serializedOptions = JSON.stringify(options || {});

  useEffect(() => {
    // Debounce the fetch to prevent rapid successive calls
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchSubjectsBySeries();
    }, 100); // 100ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [series, serializedOptions, fetchSubjectsBySeries]);

  return {
    subjects,
    pagination,
    isLoading,
    error,
    refetch: fetchSubjectsBySeries,
  };
};

/**
 * Hook for advanced subject search
 */
export const useSubjectAdvancedSearch = (
  searchParams: Record<string, any>
): UseSubjectAdvancedSearchResult => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pagination, setPagination] = useState<
    SubjectAdvancedSearchResponse["pagination"] | null
  >(null);
  const [facets, setFacets] = useState<
    SubjectAdvancedSearchResponse["facets"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(
    "🔗 useSubjectAdvancedSearch Hook - Initialized with:",
    searchParams
  );

  const performSearch = useCallback(async () => {
    if (!searchParams.q || searchParams.q.trim().length < 2) {
      setSubjects([]);
      setPagination(null);
      setFacets(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useSubjectAdvancedSearch Hook - Performing search:",
        searchParams
      );

      const data = await subjectApiService.advancedSearch(searchParams);
      setSubjects(data.subjects);
      setPagination(data.pagination);
      setFacets(data.facets);

      console.log(
        "🔗 useSubjectAdvancedSearch Hook - Successfully found subjects:",
        data.subjects.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search subjects";
      setError(errorMessage);
      console.error("🔗 useSubjectAdvancedSearch Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  return {
    subjects,
    pagination,
    facets,
    searchParams,
    isLoading,
    error,
    refetch: performSearch,
  };
};

/**
 * Hook for subject search suggestions
 */
export const useSubjectSuggestions = (
  query: string,
  limit = 10
): UseSubjectSuggestionsResult => {
  const [suggestions, setSuggestions] = useState<SubjectSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useSubjectSuggestions Hook - Initialized with:", {
    query,
    limit,
  });

  const fetchSuggestions = useCallback(async () => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useSubjectSuggestions Hook - Fetching suggestions:",
        query
      );

      const data = await subjectApiService.getSearchSuggestions(query, limit);
      setSuggestions(data);

      console.log(
        "🔗 useSubjectSuggestions Hook - Successfully loaded suggestions:",
        data.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch suggestions";
      setError(errorMessage);
      console.error("🔗 useSubjectSuggestions Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [query, limit]);

  useEffect(() => {
    // Debounce suggestions
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
  };
};

/**
 * Hook for trending subjects
 */
export const useTrendingSubjects = (
  period = "week",
  limit = 10
): UseSubjectsResult => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useTrendingSubjects Hook - Initialized with:", {
    period,
    limit,
  });

  const fetchTrending = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useTrendingSubjects Hook - Fetching trending subjects");

      const data = await subjectApiService.getTrendingSubjects(period, limit);
      setSubjects(data);

      console.log(
        "🔗 useTrendingSubjects Hook - Successfully loaded trending subjects:",
        data.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch trending subjects";
      setError(errorMessage);
      console.error("🔗 useTrendingSubjects Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [period, limit]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return {
    subjects,
    pagination: null, // Trending doesn't use pagination
    isLoading,
    error,
    refetch: fetchTrending,
  };
};

/**
 * Hook for subject analytics
 */
export const useSubjectAnalytics = (
  filters?: Record<string, any>
): UseSubjectAnalyticsResult => {
  const [analytics, setAnalytics] = useState<SubjectAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(
    "🔗 useSubjectAnalytics Hook - Initialized with filters:",
    filters
  );

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useSubjectAnalytics Hook - Fetching analytics");

      const data = await subjectApiService.getSubjectAnalytics(filters);
      setAnalytics(data);

      console.log(
        "🔗 useSubjectAnalytics Hook - Successfully loaded analytics"
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(errorMessage);
      console.error("🔗 useSubjectAnalytics Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
};

/**
 * Hook for subject performance
 */
export const useSubjectPerformance = (
  subjectId?: string
): UseSubjectPerformanceResult => {
  const [performance, setPerformance] = useState<SubjectPerformance | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useSubjectPerformance Hook - Initialized with:", {
    subjectId,
  });

  const fetchPerformance = useCallback(async () => {
    if (!subjectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useSubjectPerformance Hook - Fetching performance:",
        subjectId
      );

      const data = await subjectApiService.getSubjectPerformance(subjectId);
      setPerformance(data);

      console.log(
        "🔗 useSubjectPerformance Hook - Successfully loaded performance"
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch performance";
      setError(errorMessage);
      console.error("🔗 useSubjectPerformance Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  return {
    performance,
    isLoading,
    error,
    refetch: fetchPerformance,
  };
};

/**
 * Hook for subject comparison
 */
export const useSubjectComparison = (): UseSubjectComparisonResult => {
  const [comparison, setComparison] = useState<SubjectComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useSubjectComparison Hook - Initialized");

  const compareSubjects = useCallback(async (subjectIds: string[]) => {
    if (!subjectIds || subjectIds.length < 2) {
      setError("At least 2 subjects are required for comparison");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useSubjectComparison Hook - Comparing subjects:",
        subjectIds
      );

      const data = await subjectApiService.compareSubjects(subjectIds);
      setComparison(data);

      console.log(
        "🔗 useSubjectComparison Hook - Successfully compared subjects"
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to compare subjects";
      setError(errorMessage);
      console.error("🔗 useSubjectComparison Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    comparison,
    isLoading,
    error,
    refetch: compareSubjects,
  };
};
