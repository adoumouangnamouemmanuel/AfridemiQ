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

// Mock topics data based on topic.model (only Math topics)
const MATH_TOPICS = [
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
];

export default function TopicsScreen() {
  const router = useRouter();
  const { subjectId, subjectName } = useLocalSearchParams();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  const filteredTopics = useMemo(() => {
    if (selectedDifficulty === "all") return MATH_TOPICS;
    return MATH_TOPICS.filter(
      (topic) => topic.difficulty === selectedDifficulty
    );
  }, [selectedDifficulty]);

  const handleTopicPress = (topic: (typeof MATH_TOPICS)[0]) => {
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
        return "#10B981";
      case "intermediate":
        return "#F59E0B";
      case "advanced":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const renderTopicCard = ({
    item: topic,
  }: {
    item: (typeof MATH_TOPICS)[0];
  }) => {
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
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.statText}>
                    {Math.round(topic.estimatedTime / 60)}h
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="library" size={16} color="#6B7280" />
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
                    <Ionicons name="create" size={14} color="#3B82F6" />
                    <Text style={styles.featureText}>Practice</Text>
                  </View>
                )}
                {topic.hasNote && (
                  <View style={styles.feature}>
                    <Ionicons name="document-text" size={14} color="#10B981" />
                    <Text style={styles.featureText}>Notes</Text>
                  </View>
                )}
                {topic.hasStudyMaterial && (
                  <View style={styles.feature}>
                    <Ionicons name="book" size={14} color="#F59E0B" />
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
                <Ionicons name="link" size={12} color="#6B7280" />
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
      marginBottom: 16,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
      borderRadius: 8,
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
    filterRow: {
      flexDirection: "row",
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: "#F1F5F9",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    activeFilterChip: {
      backgroundColor: "#3B82F6",
      borderColor: "#3B82F6",
    },
    filterText: {
      fontSize: 14,
      color: "#64748B",
      fontWeight: "500",
      fontFamily: "Inter-Medium",
    },
    activeFilterText: {
      color: "white",
    },
    content: {
      flex: 1,
      padding: 20,
    },
    topicCard: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    lockedCard: {
      backgroundColor: "#F8FAFC",
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
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    topicDescription: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    lockedText: {
      color: "#9CA3AF",
    },
    headerRight: {
      alignItems: "flex-end",
    },
    lockIcon: {
      padding: 8,
      backgroundColor: "#F1F5F9",
      borderRadius: 8,
    },
    availableBadge: {
      backgroundColor: "#10B981",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    availableText: {
      color: "white",
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
      color: "#64748B",
      fontFamily: "Inter-Medium",
    },
    progressPercentage: {
      fontSize: 14,
      fontWeight: "600",
      color: "#3B82F6",
      fontFamily: "Inter-SemiBold",
    },
    progressBar: {
      height: 8,
      backgroundColor: "#E2E8F0",
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#3B82F6",
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
      color: "#6B7280",
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
      backgroundColor: "#F8FAFC",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    featureText: {
      fontSize: 12,
      color: "#374151",
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
      backgroundColor: "#F1F5F9",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    prerequisitesText: {
      fontSize: 11,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748B" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{subjectName} Topics</Text>
            <Text style={styles.subtitle}>
              {filteredTopics.length} topics available
            </Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {["all", "beginner", "intermediate", "advanced"].map((difficulty) => (
            <TouchableOpacity
              key={difficulty}
              style={[
                styles.filterChip,
                selectedDifficulty === difficulty && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedDifficulty(difficulty)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedDifficulty === difficulty && styles.activeFilterText,
                ]}
              >
                {difficulty === "all"
                  ? "All"
                  : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={filteredTopics}
          renderItem={renderTopicCard}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}
