"use client";

import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "../../../src/utils/ThemeContext";
import { useTopicsBySubject } from "../../../src/hooks/useTopic";

// Mock topics data for ALL subjects (not just Math)
const ALL_TOPICS = {
  math_001: [
    {
      _id: "topic_algebra",
      name: "Algebra Fundamentals",
      subjectId: "math_001",
      series: ["D"],
      description: "Master algebraic expressions, equations, and inequalities",
      difficulty: "intermediate",
      estimatedTime: 180, // minutes
      estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      relatedTopics: ["Linear Equations", "Quadratic Functions"],
      hasPractice: true,
      hasNote: true,
      hasStudyMaterial: true,
      prerequisites: ["Basic Mathematics"],
      learningObjectives: [
        "Solve linear and quadratic equations",
        "Simplify algebraic expressions",
        "Graph linear functions",
      ],
      estimatedTimeToMaster: 300,
      resourceIds: ["res_001", "res_002"],
      assessmentCriteria: {
        minimumScore: 75,
        requiredPracticeQuestions: 50,
        masteryThreshold: 85,
      },
      progress: 65,
      isUnlocked: true,
      hasLessons: true,
    },
    {
      _id: "topic_geometry",
      name: "Geometry Basics",
      subjectId: "math_001",
      series: ["D"],
      description: "Explore shapes, angles, and geometric relationships",
      difficulty: "beginner",
      estimatedTime: 150,
      estimatedCompletionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      relatedTopics: ["Trigonometry", "Area and Volume"],
      hasPractice: true,
      hasNote: false,
      hasStudyMaterial: true,
      prerequisites: [],
      learningObjectives: [
        "Identify geometric shapes",
        "Calculate angles and areas",
        "Apply geometric theorems",
      ],
      estimatedTimeToMaster: 240,
      resourceIds: ["res_003"],
      assessmentCriteria: {
        minimumScore: 70,
        requiredPracticeQuestions: 40,
        masteryThreshold: 80,
      },
      progress: 30,
      isUnlocked: true,
      hasLessons: false,
    },
    {
      _id: "topic_calculus",
      name: "Introduction to Calculus",
      subjectId: "math_001",
      series: ["D"],
      description: "Derivatives, integrals, and limits fundamentals",
      difficulty: "advanced",
      estimatedTime: 240,
      estimatedCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      relatedTopics: ["Advanced Functions", "Applications"],
      hasPractice: true,
      hasNote: true,
      hasStudyMaterial: true,
      prerequisites: ["Algebra Fundamentals", "Functions"],
      learningObjectives: [
        "Understand limits and continuity",
        "Calculate derivatives",
        "Solve basic integrals",
      ],
      estimatedTimeToMaster: 400,
      resourceIds: ["res_004", "res_005"],
      assessmentCriteria: {
        minimumScore: 80,
        requiredPracticeQuestions: 60,
        masteryThreshold: 90,
      },
      progress: 0,
      isUnlocked: false,
      hasLessons: false,
    },
    {
      _id: "topic_statistics",
      name: "Statistics & Probability",
      subjectId: "math_001",
      series: ["D"],
      description: "Data analysis, probability distributions, and inference",
      difficulty: "intermediate",
      estimatedTime: 200,
      estimatedCompletionDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      relatedTopics: ["Data Visualization", "Hypothesis Testing"],
      hasPractice: true,
      hasNote: false,
      hasStudyMaterial: true,
      prerequisites: ["Basic Mathematics"],
      learningObjectives: [
        "Calculate probability",
        "Analyze data sets",
        "Interpret statistical results",
      ],
      estimatedTimeToMaster: 320,
      resourceIds: ["res_006"],
      assessmentCriteria: {
        minimumScore: 75,
        requiredPracticeQuestions: 45,
        masteryThreshold: 85,
      },
      progress: 15,
      isUnlocked: true,
      hasLessons: false,
    },
  ],
  physics_001: [
    {
      _id: "topic_mechanics",
      name: "Classical Mechanics",
      subjectId: "physics_001",
      series: ["D"],
      description: "Study motion, forces, and energy in physical systems",
      difficulty: "intermediate",
      estimatedTime: 200,
      estimatedCompletionDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      relatedTopics: ["Thermodynamics", "Waves"],
      hasPractice: true,
      hasNote: true,
      hasStudyMaterial: true,
      prerequisites: ["Basic Mathematics"],
      learningObjectives: [
        "Analyze motion using kinematics",
        "Apply Newton's laws of motion",
        "Calculate work and energy",
      ],
      estimatedTimeToMaster: 350,
      resourceIds: ["res_phys_001", "res_phys_002"],
      assessmentCriteria: {
        minimumScore: 75,
        requiredPracticeQuestions: 45,
        masteryThreshold: 85,
      },
      progress: 40,
      isUnlocked: true,
      hasLessons: true,
    },
    {
      _id: "topic_thermodynamics",
      name: "Thermodynamics",
      subjectId: "physics_001",
      series: ["D"],
      description: "Heat, temperature, and energy transfer principles",
      difficulty: "advanced",
      estimatedTime: 180,
      estimatedCompletionDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      relatedTopics: ["Statistical Mechanics", "Heat Engines"],
      hasPractice: true,
      hasNote: false,
      hasStudyMaterial: true,
      prerequisites: ["Classical Mechanics"],
      learningObjectives: [
        "Understand heat and temperature",
        "Apply thermodynamic laws",
        "Analyze heat engines and cycles",
      ],
      estimatedTimeToMaster: 300,
      resourceIds: ["res_phys_003"],
      assessmentCriteria: {
        minimumScore: 80,
        requiredPracticeQuestions: 50,
        masteryThreshold: 90,
      },
      progress: 0,
      isUnlocked: false,
      hasLessons: false,
    },
    {
      _id: "topic_waves",
      name: "Waves and Oscillations",
      subjectId: "physics_001",
      series: ["D"],
      description: "Wave properties, sound, and electromagnetic radiation",
      difficulty: "intermediate",
      estimatedTime: 160,
      estimatedCompletionDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      relatedTopics: ["Optics", "Quantum Physics"],
      hasPractice: true,
      hasNote: true,
      hasStudyMaterial: true,
      prerequisites: ["Basic Mathematics"],
      learningObjectives: [
        "Describe wave properties",
        "Analyze sound and light waves",
        "Apply wave interference principles",
      ],
      estimatedTimeToMaster: 280,
      resourceIds: ["res_phys_004"],
      assessmentCriteria: {
        minimumScore: 75,
        requiredPracticeQuestions: 40,
        masteryThreshold: 85,
      },
      progress: 25,
      isUnlocked: true,
      hasLessons: false,
    },
  ],
  chemistry_001: [
    {
      _id: "topic_atomic_structure",
      name: "Atomic Structure",
      subjectId: "chemistry_001",
      series: ["D"],
      description: "Atoms, electrons, and the periodic table",
      difficulty: "beginner",
      estimatedTime: 140,
      estimatedCompletionDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      relatedTopics: ["Chemical Bonding", "Periodic Trends"],
      hasPractice: true,
      hasNote: true,
      hasStudyMaterial: true,
      prerequisites: [],
      learningObjectives: [
        "Describe atomic structure",
        "Explain electron configuration",
        "Use the periodic table effectively",
      ],
      estimatedTimeToMaster: 250,
      resourceIds: ["res_chem_001"],
      assessmentCriteria: {
        minimumScore: 70,
        requiredPracticeQuestions: 35,
        masteryThreshold: 80,
      },
      progress: 60,
      isUnlocked: true,
      hasLessons: true,
    },
  ],
  biology_001: [
    {
      _id: "topic_cell_biology",
      name: "Cell Biology",
      subjectId: "biology_001",
      series: ["D"],
      description: "Cell structure, function, and processes",
      difficulty: "beginner",
      estimatedTime: 160,
      estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      relatedTopics: ["Genetics", "Metabolism"],
      hasPractice: true,
      hasNote: true,
      hasStudyMaterial: true,
      prerequisites: [],
      learningObjectives: [
        "Identify cell organelles",
        "Explain cellular processes",
        "Compare plant and animal cells",
      ],
      estimatedTimeToMaster: 280,
      resourceIds: ["res_bio_001"],
      assessmentCriteria: {
        minimumScore: 70,
        requiredPracticeQuestions: 40,
        masteryThreshold: 80,
      },
      progress: 35,
      isUnlocked: true,
      hasLessons: true,
    },
  ],
};

export default function TopicsScreen() {
  const router = useRouter();
  const { subjectId, subjectName } = useLocalSearchParams();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const { theme } = useTheme();

  // Define styles early with theme context
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text,
      fontFamily: "Inter-ExtraBold",
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeFilterChip: {
      backgroundColor: "#3B82F6",
      borderColor: "#3B82F6",
    },
    filterText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
      fontFamily: "Inter-Medium",
    },
    activeFilterText: {
      color: "white",
    },
    content: {
      flex: 1,
      padding: 0,
    },
    topicCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    lockedCard: {
      backgroundColor: theme.colors.background,
      opacity: 0.7,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    topicInfo: {
      flex: 1,
      marginRight: 12,
    },
    topicName: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    topicDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    lockedText: {
      color: theme.colors.textSecondary,
    },
    headerRight: {
      alignItems: "flex-end",
    },
    lockIcon: {
      padding: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
    },
    availableBadge: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    availableText: {
      color: theme.colors.background,
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    progressSection: {
      marginBottom: 16,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
    },
    progressPercentage: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
      fontFamily: "Inter-SemiBold",
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
    },
    featuresRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    feature: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    featureText: {
      fontSize: 12,
      color: theme.colors.text,
      fontFamily: "Inter-Medium",
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    difficultyBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    prerequisitesBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    prerequisitesText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      lineHeight: 20,
    },
    // Loading styles
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      backgroundColor: theme.colors.background,
    },
    loadingContent: {
      alignItems: "center",
      width: "100%",
    },
    loadingIconContainer: {
      marginBottom: 30,
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 50,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    loadingTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      textAlign: "center",
      marginBottom: 8,
    },
    loadingSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginBottom: 40,
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
      backgroundColor: theme.colors.primary,
    },
  });

  // Memoize the options to prevent unnecessary re-renders
  const topicOptions = useMemo(() => ({
    difficulty: selectedDifficulty === "all" ? undefined : (selectedDifficulty as any),
    sortBy: "name" as const,
    sortOrder: "asc" as const,
  }), [selectedDifficulty]);

  // Backend integration - use memoized options
  const {
    topics: backendTopics,
    isLoading,
    error,
  } = useTopicsBySubject(subjectId as string, topicOptions);

  // Memoize the data processing to prevent unnecessary re-calculations
  const { topicsData, isBackendData } = useMemo(() => {
    if (backendTopics && backendTopics.length > 0 && !isLoading && !error) {
      // Use backend data - transform to match frontend interface
      const transformedTopics = backendTopics.map((topic) => ({
        _id: topic._id,
        name: topic.name,
        subjectId: topic.subjectId,
        series: topic.series || ["D"],
        description: topic.description,
        difficulty: topic.difficulty,
        estimatedTime: topic.estimatedTime,
        estimatedCompletionDate: topic.estimatedCompletionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        relatedTopics: topic.relatedTopics || [],
        hasPractice: topic.hasPractice,
        hasNote: topic.hasNote,
        hasStudyMaterial: topic.hasStudyMaterial,
        prerequisites: topic.prerequisites || [],
        learningObjectives: topic.learningObjectives || [],
        estimatedTimeToMaster: topic.estimatedTimeToMaster,
        resourceIds: topic.resourceIds || [],
        assessmentCriteria: topic.assessmentCriteria || {
          minimumScore: 70,
          requiredPracticeQuestions: 30,
          masteryThreshold: 80,
        },
        // Add frontend-specific properties
        progress: Math.floor(Math.random() * 80) + 10, // Mock progress
        isUnlocked: true, // All backend topics are unlocked
        hasLessons: topic.hasStudyMaterial || topic.hasNote, // Has lessons if has materials or notes
      }));

      return {
        topicsData: transformedTopics,
        isBackendData: true,
      };
    } else {
      // Use mock data - get topics for the specific subject
      const mockTopics = ALL_TOPICS[subjectId as keyof typeof ALL_TOPICS] || [];
      return {
        topicsData: mockTopics,
        isBackendData: false,
      };
    }
  }, [backendTopics, isLoading, error, subjectId]);

  // Log for debugging - exactly like curriculum pattern
  console.log(
    "📚 TopicsScreen - Using data source:",
    isBackendData ? "Backend" : "Mock"
  );
  console.log("📚 TopicsScreen - Loading:", isLoading);
  console.log("📚 TopicsScreen - Error:", error);
  console.log("📚 TopicsScreen - Subject ID:", subjectId);
  console.log("📚 TopicsScreen - Found topics:", topicsData.length);

  // Memoize filtered topics to prevent unnecessary re-calculations
  const filteredTopics = useMemo(() => {
    if (selectedDifficulty === "all") return topicsData;
    return topicsData.filter(
      (topic) => topic.difficulty === selectedDifficulty
    );
  }, [topicsData, selectedDifficulty]);

  const handleTopicPress = (topic: any) => {
    if (!topic.isUnlocked) {
      console.log("Topic is locked");
      return;
    }

    if (topic.hasLessons) {
      router.push(
        `/(routes)/learning/course-content?topicId=${topic._id}&topicName=${topic.name}`
      );
    } else {
      // TODO: Navigate to topic overview or coming soon screen
      console.log(`${topic.name} lessons coming soon`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return theme.colors.success;
      case "intermediate":
        return theme.colors.warning;
      case "advanced":
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderTopicCard = ({ item: topic }: { item: any }) => {
    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <TouchableOpacity
          style={[styles.topicCard, !topic.isUnlocked && styles.lockedCard]}
          onPress={() => handleTopicPress(topic)}
          activeOpacity={topic.isUnlocked ? 0.8 : 1}
        >
          <View style={styles.cardHeader}>
            <View style={styles.topicInfo}>
              <Text
                style={[
                  styles.topicName,
                  !topic.isUnlocked && styles.lockedText,
                ]}
              >
                {topic.name}
              </Text>
              <Text
                style={[
                  styles.topicDescription,
                  !topic.isUnlocked && styles.lockedText,
                ]}
              >
                {topic.description}
              </Text>
            </View>

            <View style={styles.headerRight}>
              {!topic.isUnlocked && (
                <View style={styles.lockIcon}>
                  <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                </View>
              )}
              {topic.hasLessons && topic.isUnlocked && (
                <View style={styles.availableBadge}>
                  <Text style={styles.availableText}>Available</Text>
                </View>
              )}
            </View>
          </View>

          {topic.isUnlocked && (
            <>
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {topic.progress}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${topic.progress}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons
                    name="time"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.statText}>
                    {Math.round(topic.estimatedTime / 60)}h
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons
                    name="library"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.statText}>
                    {topic.resourceIds.length} Resources
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="checkmark-circle" size={16} color="#6B7280" />
                  <Text style={styles.statText}>
                    {topic.learningObjectives.length} Goals
                  </Text>
                </View>
              </View>

              <View style={styles.featuresRow}>
                {topic.hasPractice && (
                  <View style={styles.feature}>
                    <Ionicons
                      name="create"
                      size={14}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.featureText}>Practice</Text>
                  </View>
                )}
                {topic.hasNote && (
                  <View style={styles.feature}>
                    <Ionicons
                      name="document-text"
                      size={14}
                      color={theme.colors.success}
                    />
                    <Text style={styles.featureText}>Notes</Text>
                  </View>
                )}
                {topic.hasStudyMaterial && (
                  <View style={styles.feature}>
                    <Ionicons
                      name="book"
                      size={14}
                      color={theme.colors.warning}
                    />
                    <Text style={styles.featureText}>Materials</Text>
                  </View>
                )}
              </View>
            </>
          )}

          <View style={styles.cardFooter}>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor: getDifficultyColor(topic.difficulty) + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(topic.difficulty) },
                ]}
              >
                {topic.difficulty.charAt(0).toUpperCase() +
                  topic.difficulty.slice(1)}
              </Text>
            </View>

            {topic.prerequisites.length > 0 && (
              <View style={styles.prerequisitesBadge}>
                <Ionicons
                  name="link"
                  size={12}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.prerequisitesText}>
                  {topic.prerequisites.length} Prerequisites
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Loading Component - now defined after styles
  const TopicsLoader = () => {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#64748B" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{subjectName} Topics</Text>
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
            <Animated.View
              entering={FadeIn.delay(200).duration(600)}
              style={styles.loadingIconContainer}
            >
              <Ionicons name="book" size={48} color={theme.colors.primary} />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(400).duration(600)}>
              <Text style={styles.loadingTitle}>Loading Topics</Text>
              <Text style={styles.loadingSubtitle}>
                Fetching {subjectName} content...
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeIn.delay(600).duration(600)}
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

  // UPDATE: Filter logic to use the unified data source - removed duplicate declaration
  // filteredTopics is already defined above

  // Show loading state early return
  if (isLoading) {
    return <TopicsLoader />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{subjectName} Topics</Text>
            <Text style={styles.subtitle}>
              {/* UPDATE: Show data source indicator like curriculum */}
              {filteredTopics.length} topics available {isBackendData ? "🌐" : "📱"}
            </Text>
          </View>
        </View>

        {/* Only show filters if there are topics */}
        {topicsData.length > 0 && (
          <View style={styles.filterRow}>
            {["all", "beginner", "intermediate", "advanced"].map(
              (difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterChip,
                    selectedDifficulty === difficulty &&
                      styles.activeFilterChip,
                  ]}
                  onPress={() => setSelectedDifficulty(difficulty)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedDifficulty === difficulty &&
                        styles.activeFilterText,
                    ]}
                  >
                    {difficulty === "all"
                      ? "All"
                      : difficulty.charAt(0).toUpperCase() +
                        difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </View>

      <View style={styles.content}>
        {filteredTopics.length > 0 ? (
          <FlatList
            data={filteredTopics}
            renderItem={renderTopicCard}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="book-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>
              {isLoading ? "Loading Topics..." : "No Topics Available"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {error 
                ? `Error: ${error}`
                : isLoading 
                ? "Please wait while we fetch the topics..."
                : `Topics for ${subjectName} are coming soon!`
              }
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
