"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeInDown,
  FadeInRight,
} from "react-native-reanimated";

// Use the provided hooks
import { useQuizzes } from "../../../src/hooks/assessment/useQuiz";
import { useUser } from "../../../src/utils/UserContext";
import type {
  Quiz,
  QuizFilters,
} from "../../../src/types/assessment/quiz.types";

interface QuizCardProps {
  quiz: Quiz;
  onPress: () => void;
  index: number;
}

function QuizCard({ quiz, onPress, index }: QuizCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return { bg: "#ECFDF5", text: "#047857", border: "#D1FAE5" };
      case "medium":
        return { bg: "#FFFBEB", text: "#D97706", border: "#FED7AA" };
      case "hard":
        return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
      case "mixed":
        return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "practice":
        return "school-outline";
      case "mock_exam":
        return "document-text-outline";
      case "topic_review":
        return "book-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getFormatGradient = (format: string): [string, string] => {
    switch (format) {
      case "practice":
        return ["#3B82F6", "#1D4ED8"];
      case "mock_exam":
        return ["#EF4444", "#DC2626"];
      case "topic_review":
        return ["#10B981", "#059669"];
      default:
        return ["#6366F1", "#4F46E5"];
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const difficultyColors = getDifficultyColor(quiz.difficulty);
  const formatGradient = getFormatGradient(quiz.format);

  // Fixed: Handle subject name properly with null fallback
  const subjectName =
    quiz.subjectId && typeof quiz.subjectId === "object"
      ? quiz.subjectId.name
      : "Mathematics"; // Default subject since your quizzes are math-related

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.quizCard}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {/* Header with Format Icon */}
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={formatGradient}
            style={styles.formatIconContainer}
          >
            <Ionicons
              name={getFormatIcon(quiz.format) as any}
              size={24}
              color="white"
            />
          </LinearGradient>

          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {quiz.title}
            </Text>
            <Text style={styles.cardSubject}>{subjectName}</Text>
          </View>

          <View
            style={[
              styles.difficultyBadge,
              {
                backgroundColor: difficultyColors.bg,
                borderColor: difficultyColors.border,
              },
            ]}
          >
            <Text
              style={[styles.difficultyText, { color: difficultyColors.text }]}
            >
              {quiz.difficulty}
            </Text>
          </View>
        </View>

        {/* Description */}
        {quiz.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {quiz.description}
          </Text>
        )}

        {/* Metrics Row */}
        <View style={styles.cardMetrics}>
          <View style={styles.metricItem}>
            <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.metricText}>
              {quiz.totalQuestions} questions
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.metricText}>{formatTime(quiz.timeLimit)}</Text>
          </View>

          <View style={styles.metricItem}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.metricText}>
              {Math.round(quiz.stats.averageScore)}%
            </Text>
          </View>
        </View>

        {/* Topics - Fixed: Handle topic display properly */}
        {quiz.topicIds &&
          Array.isArray(quiz.topicIds) &&
          quiz.topicIds.length > 0 && (
            <View style={styles.topicsContainer}>
              {quiz.topicIds.slice(0, 3).map((topic, topicIndex) => {
                // Fixed: Handle both string and object topic IDs
                const topicName =
                  topic && typeof topic === "object"
                    ? topic.name
                    : `Functions & Algebra`; // Default topic since your quizzes are function-related

                return (
                  <View key={topicIndex} style={styles.topicTag}>
                    <Text style={styles.topicText}>{topicName}</Text>
                  </View>
                );
              })}
              {quiz.topicIds.length > 3 && (
                <View style={styles.moreTopicsTag}>
                  <Text style={styles.moreTopicsText}>
                    +{quiz.topicIds.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}

        {/* Footer Stats */}
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Text style={styles.attemptsText}>
              {quiz.stats.totalAttempts.toLocaleString()} attempts
            </Text>
            <Text style={styles.passRateText}>
              {Math.round(quiz.stats.passRate)}% pass rate
            </Text>
          </View>

          {quiz.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={12} color="#F59E0B" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon?: string;
  color?: string;
}

function FilterChip({
  label,
  isActive,
  onPress,
  icon,
  color = "#3B82F6",
}: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isActive && { backgroundColor: color, borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={16}
          color={isActive ? "white" : color}
          style={styles.filterChipIcon}
        />
      )}
      <Text
        style={[
          styles.filterChipText,
          isActive && { color: "white" },
          !isActive && { color },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Add debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function AssessmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );

  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fixed: Memoize filters to prevent infinite re-renders
  const filters: QuizFilters = useMemo(
    () => ({
      isActive: true,
      limit: 50, // Safe limit
      sortBy: "createdAt", // Safe sortBy field
      sortOrder: "desc",
      ...(user?.educationLevel && { educationLevel: user.educationLevel }),
      ...(user?.examType && { examType: user.examType }),
      ...(selectedFormat && { format: selectedFormat as any }),
      ...(selectedDifficulty && { difficulty: selectedDifficulty as any }),
    }),
    [user?.educationLevel, user?.examType, selectedFormat, selectedDifficulty]
  );
  // Use the hook with CLIENT-SIDE filtering
  const { quizzes, isLoading, error, refetch, search, isSearching } =
    useQuizzes(filters);

  // Handle search separately with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        search(searchQuery);
      } else if (searchQuery === "") {
        // Clear search and reload all quizzes
        search("");
      }
    }, 500); // 500ms debounce for search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, search]);
  // Animation values
  const headerOpacity = useSharedValue(0);
  const statsScale = useSharedValue(0);

  // Animate header on mount
  useEffect(() => {
    headerOpacity.value = withDelay(200, withSpring(1));
    statsScale.value = withDelay(400, withSpring(1));
  }, []);

  // Handle quiz selection - Fixed navigation
  const handleQuizPress = (quiz: Quiz) => {
    router.push({
      pathname: "/(routes)/assessments/quiz", // Update to correct route
      params: {
        quizId: quiz._id,
        title: quiz.title,
      },
    });
  };

  // Calculate stats
  const totalQuizzes = quizzes.length;
  const completedQuizzes = 0; // TODO: Get from user progress when available
  const averageScore = useMemo(() => {
    if (quizzes.length === 0) return 0;
    return Math.round(
      quizzes.reduce((sum, quiz) => sum + quiz.stats.averageScore, 0) /
        quizzes.length
    );
  }, [quizzes]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statsScale.value }],
  }));

  if (isLoading && quizzes.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading quizzes...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assessments</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Ionicons name="refresh" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quizzes..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Quick Stats */}
        <Animated.View style={[styles.statsSection, statsAnimatedStyle]}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardLeft]}>
              <LinearGradient
                colors={["#3B82F6", "#1D4ED8"]}
                style={styles.statGradient}
              >
                <Text style={styles.statValue}>{totalQuizzes}</Text>
                <Text style={styles.statLabel}>Available</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.statGradient}
              >
                <Text style={styles.statValue}>{completedQuizzes}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </LinearGradient>
            </View>

            <View style={[styles.statCard, styles.statCardRight]}>
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                style={styles.statGradient}
              >
                <Text style={styles.statValue}>{averageScore}%</Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filtersTitle}>Filters</Text>

          {/* Format Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
          >
            <FilterChip
              label="All Formats"
              isActive={!selectedFormat}
              onPress={() => setSelectedFormat(null)}
            />
            <FilterChip
              label="Practice"
              isActive={selectedFormat === "practice"}
              onPress={() =>
                setSelectedFormat(
                  selectedFormat === "practice" ? null : "practice"
                )
              }
              icon="school-outline"
              color="#3B82F6"
            />
            <FilterChip
              label="Mock Exam"
              isActive={selectedFormat === "mock_exam"}
              onPress={() =>
                setSelectedFormat(
                  selectedFormat === "mock_exam" ? null : "mock_exam"
                )
              }
              icon="document-text-outline"
              color="#EF4444"
            />
            <FilterChip
              label="Topic Review"
              isActive={selectedFormat === "topic_review"}
              onPress={() =>
                setSelectedFormat(
                  selectedFormat === "topic_review" ? null : "topic_review"
                )
              }
              icon="book-outline"
              color="#10B981"
            />
          </ScrollView>

          {/* Difficulty Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
          >
            <FilterChip
              label="All Levels"
              isActive={!selectedDifficulty}
              onPress={() => setSelectedDifficulty(null)}
            />
            <FilterChip
              label="Easy"
              isActive={selectedDifficulty === "easy"}
              onPress={() =>
                setSelectedDifficulty(
                  selectedDifficulty === "easy" ? null : "easy"
                )
              }
              color="#10B981"
            />
            <FilterChip
              label="Medium"
              isActive={selectedDifficulty === "medium"}
              onPress={() =>
                setSelectedDifficulty(
                  selectedDifficulty === "medium" ? null : "medium"
                )
              }
              color="#F59E0B"
            />
            <FilterChip
              label="Hard"
              isActive={selectedDifficulty === "hard"}
              onPress={() =>
                setSelectedDifficulty(
                  selectedDifficulty === "hard" ? null : "hard"
                )
              }
              color="#EF4444"
            />
            <FilterChip
              label="Mixed"
              isActive={selectedDifficulty === "mixed"}
              onPress={() =>
                setSelectedDifficulty(
                  selectedDifficulty === "mixed" ? null : "mixed"
                )
              }
              color="#6B7280"
            />
          </ScrollView>
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quizzes List */}
        {!error && (
          <View style={styles.quizzesSection}>
            <View style={styles.quizzesHeader}>
              <Text style={styles.quizzesTitle}>
                Quizzes ({quizzes.length})
              </Text>
            </View>

            {quizzes.map((quiz, index) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                onPress={() => handleQuizPress(quiz)}
                index={index}
              />
            ))}

            {quizzes.length === 0 && !isLoading && (
              <Animated.View
                entering={FadeInRight.delay(300)}
                style={styles.emptyState}
              >
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color="#D1D5DB"
                />
                <Text style={styles.emptyStateTitle}>No quizzes found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  {searchQuery || selectedFormat || selectedDifficulty
                    ? "Try adjusting your search or filters"
                    : "Check back later for new quizzes"}
                </Text>
              </Animated.View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  // Header styles
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: "#1E293B",
    fontSize: 16,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  // Stats section
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statCardLeft: {
    marginLeft: 0,
  },
  statCardRight: {
    marginRight: 0,
  },
  statGradient: {
    padding: 20,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
  },
  // Filters section
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipIcon: {
    marginRight: 6,
  },
  filterChipText: {
    fontWeight: "600",
    fontSize: 14,
  },
  // Error state
  errorContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  // Quizzes section
  quizzesSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  quizzesHeader: {
    marginBottom: 16,
  },
  quizzesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  // Quiz card styles
  quizCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  formatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 24,
    marginBottom: 4,
  },
  cardSubject: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  cardDescription: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 16,
  },
  cardMetrics: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  metricText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginLeft: 6,
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  topicTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  topicText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  moreTopicsTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  moreTopicsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flex: 1,
  },
  attemptsText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
    marginBottom: 2,
  },
  passRateText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "600",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
    marginLeft: 4,
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#CBD5E1",
    textAlign: "center",
    lineHeight: 24,
  },
});
