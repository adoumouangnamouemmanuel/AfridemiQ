"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

// Mock course content data based on course.content.model
const COURSE_CONTENT = {
  _id: "course_algebra_001",
  examId: ["exam_001"],
  subjectId: "math_001",
  topicId: ["topic_algebra"],
  series: ["D"],
  title: "Algebra Fundamentals Course",
  description:
    "Comprehensive algebra course covering expressions, equations, and functions with practical applications",
  level: "intermediate",
  modules: [
    {
      id: "module_1",
      title: "Basic Algebraic Expressions",
      description:
        "Learn to work with variables, coefficients, and simple expressions",
      order: 1,
      series: "D",
      lessons: ["lesson_001"], // Only 1 lesson as requested
      exerciseIds: ["exercise_001", "exercise_002"],
      assessment: null,
      progressTracking: {
        completedLessons: 0,
        totalLessons: 1,
        lastAccessedAt: null,
      },
      estimatedDuration: 45,
      prerequisites: [],
      isLocked: false,
      unlockConditions: {
        requiredModules: [],
        minimumScore: 0,
      },
    },
    {
      id: "module_2",
      title: "Linear Equations",
      description: "Solve single and multi-step linear equations",
      order: 2,
      series: "D",
      lessons: [],
      exerciseIds: ["exercise_003"],
      assessment: null,
      progressTracking: {
        completedLessons: 0,
        totalLessons: 0,
        lastAccessedAt: null,
      },
      estimatedDuration: 60,
      prerequisites: ["Basic Algebraic Expressions"],
      isLocked: true,
      unlockConditions: {
        requiredModules: ["module_1"],
        minimumScore: 75,
      },
    },
    {
      id: "module_3",
      title: "Quadratic Functions",
      description: "Explore parabolas, vertex form, and quadratic equations",
      order: 3,
      series: "D",
      lessons: [],
      exerciseIds: ["exercise_004", "exercise_005"],
      assessment: "assessment_001",
      progressTracking: {
        completedLessons: 0,
        totalLessons: 0,
        lastAccessedAt: null,
      },
      estimatedDuration: 90,
      prerequisites: ["Linear Equations"],
      isLocked: true,
      unlockConditions: {
        requiredModules: ["module_1", "module_2"],
        minimumScore: 80,
      },
    },
  ],
  prerequisites: ["Basic Mathematics"],
  estimatedDuration: 195,
  progressTracking: {
    completedLessons: 0,
    totalLessons: 1,
    lastAccessedAt: null,
    averageCompletionTime: 0,
  },
  accessibilityOptions: {
    languages: ["french"],
    formats: ["text", "video"],
    accommodations: [],
    hasAudioVersion: false,
    hasBrailleVersion: false,
    screenReaderFriendly: true,
  },
  premiumOnly: false,
  accessType: "free",
  analytics: {
    enrollmentCount: 1250,
    completionRate: 68,
    averageRating: 4.6,
    totalViews: 15420,
    lastViewedAt: new Date(),
  },
  isActive: true,
  isArchived: false,
};

export default function CourseContentScreen() {
  const router = useRouter();
  const { topicId, topicName } = useLocalSearchParams();
  const [expandedModule, setExpandedModule] = useState<string | null>(
    "module_1"
  );

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  const handleModulePress = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleLessonPress = (lessonId: string, moduleId: string) => {
    router.push(
      `/(routes)/learning/lessons/base-lesson?lessonId=${lessonId}&moduleId=${moduleId}`
    );
  };

  const handleExercisePress = (exerciseId: string) => {
    // TODO: Navigate to exercise screen
    console.log(`Navigate to exercise: ${exerciseId}`);
  };

  const handleNotesPress = () => {
    router.push(
      `/(routes)/learning/notes?topicId=${topicId}&topicName=${topicName}`
    );
  };

  const handleResourcesPress = () => {
    router.push(
      `/(routes)/learning/resources?topicId=${topicId}&topicName=${topicName}`
    );
  };

  const handleBookmarksPress = () => {
    router.push(
      `/(routes)/learning/bookmarks?topicId=${topicId}&topicName=${topicName}`
    );
  };

  const renderModuleCard = ({
    item: module,
  }: {
    item: (typeof COURSE_CONTENT.modules)[0];
  }) => {
    const isExpanded = expandedModule === module.id;
    const hasLessons = module.lessons.length > 0;
    const completionPercentage =
      module.progressTracking.totalLessons > 0
        ? Math.round(
            (module.progressTracking.completedLessons /
              module.progressTracking.totalLessons) *
              100
          )
        : 0;

    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <View style={[styles.moduleCard, module.isLocked && styles.lockedCard]}>
          <TouchableOpacity
            style={styles.moduleHeader}
            onPress={() => !module.isLocked && handleModulePress(module.id)}
            activeOpacity={module.isLocked ? 1 : 0.8}
          >
            <View style={styles.moduleInfo}>
              <View style={styles.moduleTitle}>
                <Text
                  style={[
                    styles.moduleName,
                    module.isLocked && styles.lockedText,
                  ]}
                >
                  {module.title}
                </Text>
                {module.isLocked && (
                  <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                )}
              </View>
              <Text
                style={[
                  styles.moduleDescription,
                  module.isLocked && styles.lockedText,
                ]}
              >
                {module.description}
              </Text>

              {!module.isLocked && (
                <View style={styles.moduleStats}>
                  <View style={styles.stat}>
                    <Ionicons name="time" size={14} color="#6B7280" />
                    <Text style={styles.statText}>
                      {module.estimatedDuration} min
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="book" size={14} color="#6B7280" />
                    <Text style={styles.statText}>
                      {module.lessons.length} Lessons
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="create" size={14} color="#6B7280" />
                    <Text style={styles.statText}>
                      {module.exerciseIds.length} Exercises
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.moduleRight}>
              {!module.isLocked && (
                <>
                  <View style={styles.progressCircle}>
                    <Text style={styles.progressText}>
                      {completionPercentage}%
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#6B7280"
                  />
                </>
              )}
            </View>
          </TouchableOpacity>

          {isExpanded && !module.isLocked && (
            <View style={styles.moduleContent}>
              {hasLessons && (
                <View style={styles.lessonsSection}>
                  <Text style={styles.sectionTitle}>Lessons</Text>
                  {module.lessons.map((lessonId, index) => (
                    <TouchableOpacity
                      key={lessonId}
                      style={styles.lessonItem}
                      onPress={() => handleLessonPress(lessonId, module.id)}
                    >
                      <View style={styles.lessonIcon}>
                        <Ionicons
                          name="play-circle"
                          size={20}
                          color="#3B82F6"
                        />
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={styles.lessonTitle}>
                          Lesson {index + 1}: Introduction to Algebra
                        </Text>
                        <Text style={styles.lessonDuration}>
                          15 min • Math Lesson
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {module.exerciseIds.length > 0 && (
                <View style={styles.exercisesSection}>
                  <Text style={styles.sectionTitle}>Practice Exercises</Text>
                  {module.exerciseIds.map((exerciseId, index) => (
                    <TouchableOpacity
                      key={exerciseId}
                      style={styles.exerciseItem}
                      onPress={() => handleExercisePress(exerciseId)}
                    >
                      <View style={styles.exerciseIcon}>
                        <Ionicons name="create" size={18} color="#10B981" />
                      </View>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseTitle}>
                          Exercise {index + 1}
                        </Text>
                        <Text style={styles.exerciseDifficulty}>
                          Medium • 10 questions
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {module.isLocked && (
            <View style={styles.unlockRequirements}>
              <Text style={styles.unlockTitle}>Unlock Requirements:</Text>
              {module.unlockConditions.requiredModules.map((reqModule) => (
                <Text key={reqModule} style={styles.unlockText}>
                  • Complete {reqModule}
                </Text>
              ))}
              {module.unlockConditions.minimumScore > 0 && (
                <Text style={styles.unlockText}>
                  • Score at least {module.unlockConditions.minimumScore}%
                </Text>
              )}
            </View>
          )}
        </View>
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
      fontSize: 20,
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
    courseInfo: {
      backgroundColor: "#fff",
      borderRadius: 12,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 16,
    },
    courseTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    courseDescription: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
      marginBottom: 12,
    },
    courseStats: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    courseStat: {
      alignItems: "center",
    },
    courseStatValue: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    courseStatLabel: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    quickActions: {
      flexDirection: "row",
        gap: 12,
        padding: 20,
    },
    quickAction: {
      flex: 1,
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    quickActionIcon: {
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      color: "#374151",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
    },
    content: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    moduleCard: {
      backgroundColor: "white",
      borderRadius: 16,
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
    moduleHeader: {
      flexDirection: "row",
      padding: 20,
      alignItems: "flex-start",
    },
    moduleInfo: {
      flex: 1,
      marginRight: 12,
    },
    moduleTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    moduleName: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    moduleDescription: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
      marginBottom: 12,
    },
    lockedText: {
      color: "#9CA3AF",
    },
    moduleStats: {
      flexDirection: "row",
      gap: 16,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statText: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    moduleRight: {
      alignItems: "center",
      gap: 8,
    },
    progressCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#E0F2FE",
      justifyContent: "center",
      alignItems: "center",
    },
    progressText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#0369A1",
      fontFamily: "Inter-SemiBold",
    },
    moduleContent: {
      borderTopWidth: 1,
      borderTopColor: "#E2E8F0",
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    lessonsSection: {
      marginBottom: 16,
    },
    lessonItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },
    lessonIcon: {
      marginRight: 12,
    },
    lessonInfo: {
      flex: 1,
    },
    lessonTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
    },
    lessonDuration: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    exercisesSection: {
      marginTop: 16,
    },
    exerciseItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },
    exerciseIcon: {
      marginRight: 12,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
    },
    exerciseDifficulty: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    unlockRequirements: {
      backgroundColor: "#FEF3C7",
      margin: 20,
      marginTop: 0,
      padding: 16,
      borderRadius: 12,
    },
    unlockTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#92400E",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    unlockText: {
      fontSize: 12,
      color: "#92400E",
      fontFamily: "Inter-Regular",
      marginBottom: 4,
    },
    prerequisitesSection: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    prerequisitesTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 12,
    },
    prerequisitesList: {
      gap: 8,
    },
    prerequisiteItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    prerequisiteText: {
      fontSize: 14,
      color: "#374151",
      fontFamily: "Inter-Regular",
    },
    scrollContent: {
      padding: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748B" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{topicName}</Text>
            <Text style={styles.subtitle}>Course Content</Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{COURSE_CONTENT.title}</Text>
          <Text style={styles.courseDescription}>
            {COURSE_CONTENT.description}
          </Text>
          <View style={styles.courseStats}>
            <View style={styles.courseStat}>
              <Text style={styles.courseStatValue}>
                {COURSE_CONTENT.modules.length}
              </Text>
              <Text style={styles.courseStatLabel}>Modules</Text>
            </View>
            <View style={styles.courseStat}>
              <Text style={styles.courseStatValue}>
                {COURSE_CONTENT.estimatedDuration}m
              </Text>
              <Text style={styles.courseStatLabel}>Duration</Text>
            </View>
            <View style={styles.courseStat}>
              <Text style={styles.courseStatValue}>
                {COURSE_CONTENT.analytics.completionRate}%
              </Text>
              <Text style={styles.courseStatLabel}>Completion</Text>
            </View>
          </View>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleNotesPress}
          >
            <Ionicons
              name="document-text"
              size={24}
              color="#10B981"
              style={styles.quickActionIcon}
            />
            <Text style={styles.quickActionText}>My Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleResourcesPress}
          >
            <Ionicons
              name="library"
              size={24}
              color="#F59E0B"
              style={styles.quickActionIcon}
            />
            <Text style={styles.quickActionText}>Resources</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleBookmarksPress}
          >
            <Ionicons
              name="bookmark"
              size={24}
              color="#3B82F6"
              style={styles.quickActionIcon}
            />
            <Text style={styles.quickActionText}>Bookmarks</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scrollContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Course Modules</Text>
          </View>

          <FlatList
            data={COURSE_CONTENT.modules}
            renderItem={renderModuleCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
