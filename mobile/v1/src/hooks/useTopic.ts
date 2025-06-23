import { useCallback, useEffect, useRef, useState } from "react";
import { topicApiService } from "../services/learning/api.topic.service";
import type {
  Topic,
  TopicDifficulty,
  TopicFilters,
  TopicListResponse,
} from "../types/learning/topic.types";

interface UseTopicResult {
  topic: Topic | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseTopicsResult {
  topics: Topic[];
  pagination: TopicListResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single topic by ID
 */
export const useTopic = (topicId?: string): UseTopicResult => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useTopic Hook - Initialized with:", { topicId });

  const fetchTopic = useCallback(async () => {
    if (!topicId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useTopic Hook - Fetching topic:", topicId);

      const data = await topicApiService.getTopicById(topicId);
      setTopic(data);

      console.log("🔗 useTopic Hook - Successfully loaded topic:", data.name);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch topic";
      setError(errorMessage);
      console.error("🔗 useTopic Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  return {
    topic,
    isLoading,
    error,
    refetch: fetchTopic,
  };
};

/**
 * Hook for fetching multiple topics with filters
 */
export const useTopics = (filters?: TopicFilters): UseTopicsResult => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pagination, setPagination] = useState<
    TopicListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useTopics Hook - Initialized with filters:", filters);

  const fetchTopics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useTopics Hook - Fetching topics with filters:", filters);

      const data = await topicApiService.getTopics(filters);
      setTopics(data.topics);
      setPagination(data.pagination);

      console.log(
        "🔗 useTopics Hook - Successfully loaded topics:",
        data.topics.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch topics";
      setError(errorMessage);
      console.error("🔗 useTopics Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return {
    topics,
    pagination,
    isLoading,
    error,
    refetch: fetchTopics,
  };
};

/**
 * Hook for fetching topics by subject
 */
export const useTopicsBySubject = (
  subjectId: string,
  options?: TopicFilters
): UseTopicsResult => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pagination, setPagination] = useState<
    TopicListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track previous values and prevent unnecessary re-renders
  const previousSubjectIdRef = useRef<string | null>(null);
  const previousOptionsRef = useRef<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log("🔗 useTopicsBySubject Hook - Initialized with:", {
    subjectId,
    options,
  });

  const fetchTopicsBySubject = useCallback(async () => {
    if (!subjectId) {
      setIsLoading(false);
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
        "🔗 useTopicsBySubject Hook - Skipping fetch, no changes detected"
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
        "🔗 useTopicsBySubject Hook - Fetching topics for subject:",
        subjectId
      );

      const data = await topicApiService.getTopicsBySubject(subjectId, options);
      setTopics(data.topics);
      setPagination(data.pagination);

      console.log(
        "🔗 useTopicsBySubject Hook - Successfully loaded topics:",
        data.topics.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch topics by subject";
      setError(errorMessage);
      console.error("🔗 useTopicsBySubject Hook - Error:", errorMessage);

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
    // Debounce the fetch to prevent rapid successive calls
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchTopicsBySubject();
    }, 100); // 100ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [subjectId, serializedOptions, fetchTopicsBySubject]);

  return {
    topics,
    pagination,
    isLoading,
    error,
    refetch: fetchTopicsBySubject,
  };
};

/**
 * Hook for fetching topics by difficulty
 */
export const useTopicsByDifficulty = (
  difficulty: TopicDifficulty,
  options?: TopicFilters
): UseTopicsResult => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pagination, setPagination] = useState<
    TopicListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useTopicsByDifficulty Hook - Initialized with:", {
    difficulty,
    options,
  });

  const fetchTopicsByDifficulty = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔗 useTopicsByDifficulty Hook - Fetching topics by difficulty:",
        difficulty
      );

      const data = await topicApiService.getTopicsByDifficulty(
        difficulty,
        options
      );
      setTopics(data.topics);
      setPagination(data.pagination);

      console.log(
        "🔗 useTopicsByDifficulty Hook - Successfully loaded topics:",
        data.topics.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch topics by difficulty";
      setError(errorMessage);
      console.error("🔗 useTopicsByDifficulty Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty, options]);

  useEffect(() => {
    fetchTopicsByDifficulty();
  }, [fetchTopicsByDifficulty]);

  return {
    topics,
    pagination,
    isLoading,
    error,
    refetch: fetchTopicsByDifficulty,
  };
};

/**
 * Hook for searching topics
 */
export const useTopicSearch = (
  searchTerm: string,
  options?: TopicFilters
): UseTopicsResult => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pagination, setPagination] = useState<
    TopicListResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔗 useTopicSearch Hook - Initialized with:", {
    searchTerm,
    options,
  });

  const searchTopics = useCallback(async () => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setTopics([]);
      setPagination(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useTopicSearch Hook - Searching topics:", searchTerm);

      const data = await topicApiService.searchTopics(searchTerm, options);
      setTopics(data.topics);
      setPagination(data.pagination);

      console.log(
        "🔗 useTopicSearch Hook - Successfully found topics:",
        data.topics.length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search topics";
      setError(errorMessage);
      console.error("🔗 useTopicSearch Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchTopics();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTopics]);

  return {
    topics,
    pagination,
    isLoading,
    error,
    refetch: searchTopics,
  };
};
