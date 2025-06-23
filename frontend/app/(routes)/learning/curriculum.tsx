"use client";

import { useState, useMemo, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";
import { useCurriculum } from "../../../src/hooks/useCurriculum";
import { useUser } from "../../../src/utils/UserContext";

// Mock curriculum data based on curriculum.model
const CURRICULUM_DATA = {
  _id: "curriculum_001",
  country: "Cameroon",
  educationLevel: "secondary",
  series: ["D"],
  subjects: [
    {
      _id: "math_001",
      name: "Mathematics",
      color: "#3B82F6",
      icon: "calculator",
      totalTopics: 12,
      completedTopics: 8,
      estimatedHours: 120,
      progress: 67,
    },
    {
      _id: "physics_001",
      name: "Physics",
      color: "#10B981",
      icon: "planet",
      totalTopics: 10,
      completedTopics: 5,
      estimatedHours: 100,
      progress: 50,
    },
    {
      _id: "chemistry_001",
      name: "Chemistry",
      color: "#F59E0B",
      icon: "flask",
      totalTopics: 8,
      completedTopics: 3,
      estimatedHours: 90,
      progress: 38,
    },
    {
      _id: "biology_001",
      name: "Biology",
      color: "#EF4444",
      icon: "leaf",
      totalTopics: 9,
      completedTopics: 2,
      estimatedHours: 85,
      progress: 22,
    },
  ],
  academicYear: {
    startDate: new Date("2024-09-01"),
    endDate: new Date("2025-06-30"),
    terms: [
      {
        term: 1,
        startDate: new Date("2024-09-01"),
        endDate: new Date("2024-12-15"),
        holidays: [
          {
            name: "Mid-term Break",
            startDate: new Date("2024-10-15"),
            endDate: new Date("2024-10-22"),
          },
        ],
      },
      {
        term: 2,
        startDate: new Date("2025-01-08"),
        endDate: new Date("2025-04-15"),
        holidays: [
          {
            name: "Spring Break",
            startDate: new Date("2025-03-01"),
            endDate: new Date("2025-03-08"),
          },
        ],
      },
      {
        term: 3,
        startDate: new Date("2025-04-22"),
        endDate: new Date("2025-06-30"),
        holidays: [],
      },
    ],
  },
  analytics: {
    enrollmentCount: 15420,
    activeUsers: 8930,
    completionRate: 67,
  },
  metadata: {
    version: 2,
    status: "active",
    approvedAt: new Date("2024-08-15"),
  },
};

export default function CurriculumScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useUser();
  const [selectedTerm, setSelectedTerm] = useState(1);

  // Backend integration - determine filters
  const filters = useMemo(() => {
    const country = (params.country as string) || user?.country;
    const series = (params.series as string) || "D";
    const educationLevel = (params.educationLevel as string) || "secondary";
    return { country, series, educationLevel };
  }, [params, user]);

  // Fetch curriculum from backend
  const {
    curriculum: backendCurriculum,
    isLoading,
    error,
  } = useCurriculum(undefined, filters);

  // Determine data source and curriculum to use
  const { curriculumData, isBackendData } = useMemo(() => {
    if (backendCurriculum && !isLoading && !error) {
      // Use backend data
      return {
        curriculumData: {
          ...backendCurriculum,
          subjects:
            backendCurriculum.subjects?.map((subject: any, index: number) => ({
              _id: subject._id,
              name: subject.name,
              color: subject.color || "#3B82F6", // Use database color, fallback to blue
              icon: subject.icon || "book", // Use database icon, fallback to book
              totalTopics: Math.floor(Math.random() * 15) + 8,
              completedTopics: Math.floor(Math.random() * 8) + 2,
              estimatedHours: subject.estimatedHours,
              progress: Math.floor(Math.random() * 80) + 20,
            })) || [],
          academicYear: backendCurriculum.academicYear
            ? {
                startDate: new Date(backendCurriculum.academicYear.startDate),
                endDate: new Date(backendCurriculum.academicYear.endDate),
                terms:
                  backendCurriculum.academicYear.terms?.map((term: any) => ({
                    term: term.term,
                    startDate: new Date(term.startDate),
                    endDate: new Date(term.endDate),
                    holidays:
                      term.holidays?.map((holiday: any) => ({
                        name: holiday.name,
                        startDate: new Date(holiday.startDate),
                        endDate: new Date(holiday.endDate),
                      })) || [],
                  })) || [],
              }
            : CURRICULUM_DATA.academicYear,
          analytics: backendCurriculum.analytics || CURRICULUM_DATA.analytics,
        },
        isBackendData: true,
      };
    } else {
      // Use mock data
      return {
        curriculumData: CURRICULUM_DATA,
        isBackendData: false,
      };
    }
  }, [backendCurriculum, isLoading, error]);

  // Log for debugging
  console.log(
    "🏫 CurriculumScreen - Using data source:",
    isBackendData ? "Backend" : "Mock"
  );
  console.log("🏫 CurriculumScreen - Loading:", isLoading);
  console.log("🏫 CurriculumScreen - Error:", error);

  const getCurrentTerm = () => {
    const now = new Date();
    return (
      curriculumData.academicYear.terms.find(
        (term) => now >= term.startDate && now <= term.endDate
      ) || curriculumData.academicYear.terms[0]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getOverallProgress = () => {
    const totalTopics = curriculumData.subjects.reduce(
      (sum, subject) => sum + subject.totalTopics,
      0
    );
    const completedTopics = curriculumData.subjects.reduce(
      (sum, subject) => sum + subject.completedTopics,
      0
    );
    return Math.round((completedTopics / totalTopics) * 100);
  };

  const renderSubjectCard = ({
    item: subject,
  }: {
    item: (typeof curriculumData.subjects)[0];
  }) => {
    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <TouchableOpacity
          style={styles.subjectCard}
          onPress={() =>
            router.push(
              `/(routes)/learning/topics?subjectId=${subject._id}&subjectName=${subject.name}`
            )
          }
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[subject.color + "15", subject.color + "05"]}
            style={styles.subjectCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.subjectHeader}>
              <View
                style={[
                  styles.subjectIcon,
                  { backgroundColor: subject.color + "20" },
                ]}
              >
                <Ionicons
                  name={subject.icon as any}
                  size={24}
                  color={subject.color}
                />
              </View>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectProgress}>
                  {subject.completedTopics}/{subject.totalTopics} topics
                  completed
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${subject.progress}%`,
                      backgroundColor: subject.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{subject.progress}%</Text>
            </View>

            <View style={styles.subjectFooter}>
              <View style={styles.subjectStat}>
                <Ionicons name="time" size={14} color="#6B7280" />
                <Text style={styles.subjectStatText}>
                  {subject.estimatedHours}h
                </Text>
              </View>
              <TouchableOpacity style={styles.continueButton}>
                <Text
                  style={[styles.continueButtonText, { color: subject.color }]}
                >
                  Continue
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={subject.color}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTermCard = (
    term: (typeof curriculumData.academicYear.terms)[0]
  ) => {
    const isActive = selectedTerm === term.term;
    const isCurrent = getCurrentTerm()?.term === term.term;
    const daysRemaining = getDaysRemaining(term.endDate);

    return (
      <TouchableOpacity
        key={term.term}
        style={[styles.termCard, isActive && styles.activeTermCard]}
        onPress={() => setSelectedTerm(term.term)}
      >
        <View style={styles.termHeader}>
          <Text style={[styles.termTitle, isActive && styles.activeTermTitle]}>
            Term {term.term}
          </Text>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>

        <Text style={styles.termDates}>
          {formatDate(term.startDate)} - {formatDate(term.endDate)}
        </Text>

        {isCurrent && (
          <Text style={styles.daysRemaining}>
            {daysRemaining} days remaining
          </Text>
        )}

        {term.holidays.length > 0 && (
          <View style={styles.holidaysInfo}>
            <Ionicons name="calendar" size={12} color="#6B7280" />
            <Text style={styles.holidaysText}>
              {term.holidays.length} holiday(s)
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const selectedTermData = curriculumData.academicYear.terms.find(
    (term) => term.term === selectedTerm
  );

  // Loading Component
  const CurriculumLoader = () => {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#64748B" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Curriculum</Text>
              <Text style={styles.subtitle}>Loading...</Text>
            </View>
          </View>
        </View>

        {/* Loading Content */}
        <View style={styles.loadingContainer}>
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.loadingContent}
          >
            {/* Animated Book Icon */}
            <Animated.View
              entering={FadeIn.delay(200).duration(600)}
              style={styles.loadingIconContainer}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.loadingIconGradient}
              >
                <Ionicons name="library" size={48} color="white" />
              </LinearGradient>
            </Animated.View>

            {/* Loading Text */}
            <Animated.View entering={FadeIn.delay(400).duration(600)}>
              <Text style={styles.loadingTitle}>Loading Curriculum</Text>
              <Text style={styles.loadingSubtitle}>
                Fetching your academic content...
              </Text>
            </Animated.View>

            {/* Loading Progress Bars */}
            <Animated.View
              entering={FadeIn.delay(600).duration(600)}
              style={styles.loadingBarsContainer}
            >
              {[1, 2, 3].map((index) => (
                <View key={index} style={styles.loadingBarWrapper}>
                  <View style={styles.loadingBar}>
                    <Animated.View
                      style={[
                        styles.loadingBarFill,
                        {
                          backgroundColor:
                            index === 1
                              ? "#3B82F6"
                              : index === 2
                              ? "#10B981"
                              : "#F59E0B",
                        },
                      ]}
                      entering={FadeIn.delay(800 + index * 200).duration(800)}
                    />
                  </View>
                  <Text style={styles.loadingBarLabel}>
                    {index === 1
                      ? "Subjects"
                      : index === 2
                      ? "Calendar"
                      : "Progress"}
                  </Text>
                </View>
              ))}
            </Animated.View>

            {/* Loading Dots */}
            <Animated.View
              entering={FadeIn.delay(1200).duration(600)}
              style={styles.loadingDotsContainer}
            >
              {[1, 2, 3].map((dot) => (
                <Animated.View
                  key={dot}
                  style={styles.loadingDot}
                  entering={FadeIn.delay(1200 + dot * 100).duration(400)}
                />
              ))}
            </Animated.View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  };

  // Not Found Component
  const CurriculumNotFound = ({
    country,
    series,
    educationLevel,
    onRetry,
    onBack,
  }: {
    country: string;
    series: string;
    educationLevel: string;
    onRetry: () => void;
    onBack: () => void;
  }) => {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={20} color="#64748B" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Curriculum</Text>
              <Text style={styles.subtitle}>Not Found</Text>
            </View>
          </View>
        </View>
        <ScrollView>
          {/* Not Found Content */}
          <View style={styles.notFoundContainer}>
            <Animated.View
              entering={FadeIn.duration(600)}
              style={styles.notFoundContent}
            >
              {/* Empty State Icon */}
              <Animated.View
                entering={FadeIn.delay(200).duration(600)}
                style={styles.notFoundIconContainer}
              >
                <LinearGradient
                  colors={["#FEF3C7", "#FCD34D"]}
                  style={styles.notFoundIconGradient}
                >
                  <Ionicons name="school-outline" size={64} color="#F59E0B" />
                </LinearGradient>
              </Animated.View>

              {/* Not Found Text */}
              <Animated.View entering={FadeIn.delay(400).duration(600)}>
                <Text style={styles.notFoundTitle}>Curriculum Not Found</Text>
                <Text style={styles.notFoundSubtitle}>
                  We couldn&apos;t find a curriculum matching your criteria
                </Text>
              </Animated.View>

              {/* Search Criteria */}
              <Animated.View
                entering={FadeIn.delay(600).duration(600)}
                style={styles.searchCriteriaContainer}
              >
                <Text style={styles.searchCriteriaTitle}>Search Criteria:</Text>
                <View style={styles.criteriaItem}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={styles.criteriaText}>Country: {country}</Text>
                </View>
                <View style={styles.criteriaItem}>
                  <Ionicons name="school" size={16} color="#6B7280" />
                  <Text style={styles.criteriaText}>
                    Education Level: {educationLevel}
                  </Text>
                </View>
                <View style={styles.criteriaItem}>
                  <Ionicons name="list" size={16} color="#6B7280" />
                  <Text style={styles.criteriaText}>Series: {series}</Text>
                </View>
              </Animated.View>

              {/* Suggestions */}
              <Animated.View
                entering={FadeIn.delay(800).duration(600)}
                style={styles.suggestionsContainer}
              >
                <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                <View style={styles.suggestionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.suggestionText}>
                    Check your internet connection
                  </Text>
                </View>
                <View style={styles.suggestionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.suggestionText}>
                    Verify your country and series selection
                  </Text>
                </View>
                <View style={styles.suggestionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.suggestionText}>
                    Try refreshing the page
                  </Text>
                </View>
              </Animated.View>

              {/* Action Buttons */}
              <Animated.View
                entering={FadeIn.delay(1000).duration(600)}
                style={styles.actionButtonsContainer}
              >
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={onRetry}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#3B82F6", "#1D4ED8"]}
                    style={styles.retryButtonGradient}
                  >
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backToHomeButton}
                  onPress={onBack}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backToHomeButtonText}>Go Back</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      marginRight: 16,
      padding: 8,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: "#1E293B",
      fontFamily: "Inter-ExtraBold",
    },
    subtitle: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    curriculumInfo: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginTop: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    curriculumTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    curriculumMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 0,
    },
    metaItem: {
      alignItems: "center",
    },
    metaValue: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    metaLabel: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    overallProgress: {
      marginTop: 12,
    },
    overallProgressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    overallProgressLabel: {
      fontSize: 14,
      color: "#374151",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    overallProgressPercentage: {
      fontSize: 14,
      fontWeight: "700",
      color: "#3B82F6",
      fontFamily: "Inter-Bold",
    },
    overallProgressBar: {
      height: 8,
      backgroundColor: "#E5E7EB",
      borderRadius: 4,
      overflow: "hidden",
    },
    overallProgressFill: {
      height: "100%",
      backgroundColor: "#3B82F6",
      borderRadius: 4,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    academicYearSection: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 0,
    },
    academicYearHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    academicYearTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
    },
    academicYearDates: {
      fontSize: 14,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    termsContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 20,
    },
    termCard: {
      flex: 1,
      backgroundColor: "#F8FAFC",
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    activeTermCard: {
      backgroundColor: "#EBF8FF",
      borderColor: "#3B82F6",
    },
    termHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 5,
    },
    termTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: "#374151",
      fontFamily: "Inter-SemiBold",
    },
    activeTermTitle: {
      color: "#1E293B",
    },
    currentBadge: {
      backgroundColor: "#10B981",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    currentBadgeText: {
      fontSize: 8,
      color: "white",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    termDates: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
      marginBottom: 4,
    },
    daysRemaining: {
      fontSize: 10,
      color: "#3B82F6",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
      marginBottom: 4,
    },
    holidaysInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    holidaysText: {
      fontSize: 11,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    termDetails: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    termDetailsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 12,
    },
    holidayItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },
    holidayIcon: {
      marginRight: 12,
    },
    holidayInfo: {
      flex: 1,
    },
    holidayName: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
    },
    holidayDates: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    subjectsSection: {
      marginBottom: 20,
    },
    subjectCard: {
      marginBottom: 16,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    subjectCardGradient: {
      padding: 20,
      backgroundColor: "white",
    },
    subjectHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    subjectIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    subjectInfo: {
      flex: 1,
    },
    subjectName: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    subjectProgress: {
      fontSize: 14,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 12,
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: "#E5E7EB",
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#374151",
      fontFamily: "Inter-SemiBold",
    },
    subjectFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    subjectStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    subjectStatText: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    continueButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: "#F8FAFC",
      borderRadius: 12,
    },
    continueButtonText: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    analyticsSection: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    analyticsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    analyticsItem: {
      alignItems: "center",
    },
    analyticsValue: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    analyticsLabel: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 4,
    },
    // Loading Styles
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      backgroundColor: "#F8FAFC",
    },
    loadingContent: {
      alignItems: "center",
      width: "100%",
    },
    loadingIconContainer: {
      marginBottom: 30,
    },
    loadingIconGradient: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#667eea",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    loadingTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      textAlign: "center",
      marginBottom: 8,
    },
    loadingSubtitle: {
      fontSize: 16,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginBottom: 40,
    },
    loadingBarsContainer: {
      width: "100%",
      marginBottom: 30,
    },
    loadingBarWrapper: {
      marginBottom: 16,
    },
    loadingBar: {
      height: 8,
      backgroundColor: "#E5E7EB",
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 8,
    },
    loadingBarFill: {
      height: "100%",
      width: "70%",
      borderRadius: 4,
    },
    loadingBarLabel: {
      fontSize: 14,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    loadingDotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    loadingDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#3B82F6",
    },

    // Not Found Styles
    notFoundContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
      backgroundColor: "#F8FAFC",
    },
    notFoundContent: {
      alignItems: "center",
      width: "100%",
      maxWidth: 400,
    },
    notFoundIconContainer: {
      marginBottom: 30,
    },
    notFoundIconGradient: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#F59E0B",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    notFoundTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: "#1E293B",
      fontFamily: "Inter-ExtraBold",
      textAlign: "center",
      marginBottom: 12,
    },
    notFoundSubtitle: {
      fontSize: 16,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 30,
    },
    searchCriteriaContainer: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      width: "100%",
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    searchCriteriaTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 12,
    },
    criteriaItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    criteriaText: {
      fontSize: 14,
      color: "#374151",
      fontFamily: "Inter-Regular",
      marginLeft: 8,
    },
    suggestionsContainer: {
      backgroundColor: "#F0FDF4",
      borderRadius: 16,
      padding: 20,
      width: "100%",
      marginBottom: 30,
      borderWidth: 1,
      borderColor: "#BBF7D0",
    },
    suggestionsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#065F46",
      fontFamily: "Inter-SemiBold",
      marginBottom: 12,
    },
    suggestionItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    suggestionText: {
      fontSize: 14,
      color: "#047857",
      fontFamily: "Inter-Regular",
      marginLeft: 8,
      flex: 1,
    },
    actionButtonsContainer: {
      width: "100%",
      gap: 16,
    },
    retryButton: {
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    retryButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 24,
      gap: 8,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
      fontFamily: "Inter-SemiBold",
    },
    backToHomeButton: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
    },
    backToHomeButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#64748B",
      fontFamily: "Inter-SemiBold",
    },
  });

  // Show loading state
  if (isLoading) {
    return <CurriculumLoader />;
  }

  // Show not found state when there's an error or no curriculum
  if (error || (!backendCurriculum && !isLoading)) {
    return (
      <CurriculumNotFound
        country={filters.country || "Unknown"}
        series={filters.series || "Unknown"}
        educationLevel={filters.educationLevel || "Unknown"}
        onRetry={() => {
          // Add retry logic here if you have a refetch function
          console.log("Retrying curriculum fetch...");
        }}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748B" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Curriculum</Text>
            <Text style={styles.subtitle}>
              {curriculumData.country} • {curriculumData.educationLevel} •
              Series {curriculumData.series.join(", ")}{" "}
              {isBackendData ? "🌐" : "📱"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.curriculumInfo}>
          <Text style={styles.curriculumTitle}>
            Academic Year{" "}
            {formatDate(curriculumData.academicYear.startDate).split(",")[1]} -{" "}
            {formatDate(curriculumData.academicYear.endDate).split(",")[1]}
          </Text>

          <View style={styles.curriculumMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>
                {curriculumData.subjects.length}
              </Text>
              <Text style={styles.metaLabel}>Subjects</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>
                {curriculumData.academicYear.terms.length}
              </Text>
              <Text style={styles.metaLabel}>Terms</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>
                {curriculumData.analytics.enrollmentCount.toLocaleString()}
              </Text>
              <Text style={styles.metaLabel}>Students</Text>
            </View>
          </View>

          <View style={styles.overallProgress}>
            <View style={styles.overallProgressHeader}>
              <Text style={styles.overallProgressLabel}>Overall Progress</Text>
              <Text style={styles.overallProgressPercentage}>
                {getOverallProgress()}%
              </Text>
            </View>
            <View style={styles.overallProgressBar}>
              <View
                style={[
                  styles.overallProgressFill,
                  { width: `${getOverallProgress()}%` },
                ]}
              />
            </View>
          </View>
        </View>
        <View style={styles.scrollContent}>
          <View style={styles.academicYearSection}>
            <View style={styles.academicYearHeader}>
              <Text style={styles.sectionTitle}>Academic Calendar</Text>
              <Text style={styles.academicYearDates}>
                {formatDate(curriculumData.academicYear.startDate)} -{" "}
                {formatDate(curriculumData.academicYear.endDate)}
              </Text>
            </View>

            <View style={styles.termsContainer}>
              {curriculumData.academicYear.terms.map(renderTermCard)}
            </View>

            {selectedTermData && (
              <View style={styles.termDetails}>
                <Text style={styles.termDetailsTitle}>
                  Term {selectedTerm} Details
                </Text>
                {selectedTermData.holidays.length > 0 ? (
                  selectedTermData.holidays.map(
                    (
                      holiday: {
                        name:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactPortal
                              | ReactElement<
                                  unknown,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        startDate: Date;
                        endDate: Date;
                      },
                      index: Key | null | undefined
                    ) => (
                      <View key={index} style={styles.holidayItem}>
                        <Ionicons
                          name="calendar"
                          size={20}
                          color="#F59E0B"
                          style={styles.holidayIcon}
                        />
                        <View style={styles.holidayInfo}>
                          <Text style={styles.holidayName}>{holiday.name}</Text>
                          <Text style={styles.holidayDates}>
                            {formatDate(holiday.startDate)} -{" "}
                            {formatDate(holiday.endDate)}
                          </Text>
                        </View>
                      </View>
                    )
                  )
                ) : (
                  <Text style={styles.holidayDates}>
                    No holidays scheduled for this term
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.subjectsSection}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <FlatList
              data={curriculumData.subjects}
              renderItem={renderSubjectCard}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>

          <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Analytics</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {curriculumData.analytics.enrollmentCount.toLocaleString()}
                </Text>
                <Text style={styles.analyticsLabel}>Total Students</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {curriculumData.analytics.activeUsers.toLocaleString()}
                </Text>
                <Text style={styles.analyticsLabel}>Active Users</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {curriculumData.analytics.completionRate}%
                </Text>
                <Text style={styles.analyticsLabel}>Completion Rate</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
