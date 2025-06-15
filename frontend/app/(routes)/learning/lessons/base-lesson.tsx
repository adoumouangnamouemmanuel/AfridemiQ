"use client";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Dynamic lesson content based on lessonId
const LESSON_CONTENT_BY_ID = {
  lesson_001: {
    _id: "lesson_001",
    topicId: "topic_algebra",
    title: "Introduction to Algebraic Expressions",
    series: ["D"],
    overview:
      "Learn the fundamentals of algebraic expressions, including variables, coefficients, and basic operations. This lesson provides the foundation for all advanced algebra topics.",
    objectives: [
      "Identify variables and coefficients in algebraic expressions",
      "Understand the difference between terms and factors",
      "Perform basic operations with algebraic expressions",
      "Simplify simple algebraic expressions",
    ],
    keyPoints: [
      "Variables represent unknown quantities",
      "Coefficients are numbers multiplied by variables",
      "Like terms can be combined",
      "Order of operations applies to algebra",
    ],
    prerequisites: [
      "Basic arithmetic operations",
      "Understanding of positive and negative numbers",
      "Familiarity with mathematical symbols",
    ],
    duration: 45,
    resourceIds: ["resource_001", "resource_002"],
    exerciseIds: ["exercise_001", "exercise_002"],
    interactivityLevel: "medium",
    offlineAvailable: true,
    premiumOnly: false,
    hasVideo: true,
    videoId: "video_001",
    estimatedCompletionTime: 35,
    difficultyLevel: "beginner",
    learningOutcomes: [
      "Master variable identification in expressions",
      "Apply coefficient rules correctly",
      "Combine like terms efficiently",
      "Solve basic algebraic problems",
    ],
  },
  lesson_002: {
    _id: "lesson_002",
    topicId: "topic_algebra",
    title: "Variables and Constants",
    series: ["D"],
    overview:
      "Master the fundamental building blocks of algebra by understanding variables and constants. Learn how to identify, work with, and manipulate these essential components in mathematical expressions.",
    objectives: [
      "Define variables and constants in mathematical contexts",
      "Identify variables and constants in given expressions",
      "Understand the role of variables in representing unknown quantities",
      "Distinguish between different types of constants",
    ],
    keyPoints: [
      "Variables are symbols that represent unknown or changing values",
      "Constants are fixed numerical values that don't change",
      "Variables are typically represented by letters (x, y, z, etc.)",
      "Constants can be whole numbers, fractions, or decimals",
    ],
    prerequisites: [
      "Basic number recognition",
      "Understanding of mathematical symbols",
      "Knowledge of the alphabet",
    ],
    duration: 35,
    resourceIds: ["resource_vars_001", "resource_vars_002"],
    exerciseIds: ["exercise_vars_001"],
    interactivityLevel: "high",
    offlineAvailable: true,
    premiumOnly: false,
    hasVideo: true,
    videoId: "video_vars_001",
    estimatedCompletionTime: 25,
    difficultyLevel: "beginner",
    learningOutcomes: [
      "Confidently identify variables in any expression",
      "Recognize different types of constants",
      "Understand when to use variables vs constants",
      "Apply variable concepts to real-world problems",
    ],
  },
  lesson_003: {
    _id: "lesson_003",
    topicId: "topic_algebra",
    title: "Basic Operations with Variables",
    series: ["D"],
    overview:
      "Learn how to perform addition, subtraction, multiplication, and division with algebraic expressions containing variables. This lesson builds on your knowledge of variables to introduce basic algebraic operations.",
    objectives: [
      "Perform addition and subtraction with like terms",
      "Understand multiplication of variables and coefficients",
      "Apply the distributive property with variables",
      "Simplify basic algebraic expressions",
    ],
    keyPoints: [
      "Like terms can be added or subtracted",
      "Coefficients multiply the variable",
      "Variables multiply to create higher powers",
      "The distributive property applies to algebraic expressions",
    ],
    prerequisites: [
      "Variables and Constants",
      "Basic arithmetic operations",
      "Understanding of coefficients",
    ],
    duration: 40,
    resourceIds: ["resource_ops_001"],
    exerciseIds: ["exercise_ops_001", "exercise_ops_002"],
    interactivityLevel: "medium",
    offlineAvailable: true,
    premiumOnly: false,
    hasVideo: true,
    videoId: "video_ops_001",
    estimatedCompletionTime: 30,
    difficultyLevel: "intermediate",
    learningOutcomes: [
      "Combine like terms efficiently",
      "Apply distributive property correctly",
      "Simplify complex algebraic expressions",
      "Solve basic algebraic problems",
    ],
  },
  // Physics lessons
  lesson_physics_001: {
    _id: "lesson_physics_001",
    topicId: "topic_mechanics",
    title: "Motion Basics",
    series: ["D"],
    overview:
      "Understand the fundamental concepts of motion including position, displacement, velocity, and acceleration. This lesson provides the foundation for all mechanics topics.",
    objectives: [
      "Define position, displacement, and distance",
      "Understand velocity and speed concepts",
      "Explain acceleration in different contexts",
      "Apply motion concepts to real-world examples",
    ],
    keyPoints: [
      "Position describes location in space",
      "Displacement is change in position",
      "Velocity includes both speed and direction",
      "Acceleration is the rate of change of velocity",
    ],
    prerequisites: [
      "Basic mathematics",
      "Understanding of graphs",
      "Vector concepts",
    ],
    duration: 50,
    resourceIds: ["resource_motion_001"],
    exerciseIds: ["exercise_motion_001"],
    interactivityLevel: "high",
    offlineAvailable: true,
    premiumOnly: false,
    hasVideo: true,
    videoId: "video_motion_001",
    estimatedCompletionTime: 40,
    difficultyLevel: "intermediate",
    learningOutcomes: [
      "Analyze motion in one dimension",
      "Calculate displacement and velocity",
      "Interpret motion graphs",
      "Solve basic kinematics problems",
    ],
  },
  lesson_physics_002: {
    _id: "lesson_physics_002",
    topicId: "topic_mechanics",
    title: "Velocity and Acceleration",
    series: ["D"],
    overview:
      "Dive deeper into the concepts of velocity and acceleration, learning how to calculate and analyze these fundamental quantities in various motion scenarios.",
    objectives: [
      "Calculate average and instantaneous velocity",
      "Understand different types of acceleration",
      "Analyze velocity-time graphs",
      "Apply kinematic equations",
    ],
    keyPoints: [
      "Average velocity = displacement / time",
      "Instantaneous velocity is the limit of average velocity",
      "Acceleration can be positive, negative, or zero",
      "Kinematic equations relate position, velocity, and acceleration",
    ],
    prerequisites: [
      "Motion Basics",
      "Basic calculus concepts",
      "Graph interpretation",
    ],
    duration: 45,
    resourceIds: ["resource_velocity_001"],
    exerciseIds: ["exercise_velocity_001"],
    interactivityLevel: "medium",
    offlineAvailable: true,
    premiumOnly: false,
    hasVideo: true,
    videoId: "video_velocity_001",
    estimatedCompletionTime: 35,
    difficultyLevel: "intermediate",
    learningOutcomes: [
      "Master velocity calculations",
      "Interpret acceleration in various contexts",
      "Use kinematic equations effectively",
      "Analyze complex motion scenarios",
    ],
  },
  // Chemistry lesson
  lesson_chem_001: {
    _id: "lesson_chem_001",
    topicId: "topic_atomic_structure",
    title: "Atomic Models and Structure",
    series: ["D"],
    overview:
      "Explore the historical development of atomic models and understand the modern view of atomic structure including electrons, protons, and neutrons.",
    objectives: [
      "Describe the evolution of atomic models",
      "Identify subatomic particles and their properties",
      "Understand electron configuration basics",
      "Apply atomic structure to element properties",
    ],
    keyPoints: [
      "Atoms consist of protons, neutrons, and electrons",
      "The nucleus contains protons and neutrons",
      "Electrons occupy energy levels around the nucleus",
      "Atomic number equals the number of protons",
    ],
    prerequisites: [
      "Basic chemistry concepts",
      "Understanding of matter",
      "Mathematical skills",
    ],
    duration: 55,
    resourceIds: ["resource_atom_001"],
    exerciseIds: ["exercise_atom_001"],
    interactivityLevel: "high",
    offlineAvailable: true,
    premiumOnly: false,
    hasVideo: true,
    videoId: "video_atom_001",
    estimatedCompletionTime: 45,
    difficultyLevel: "beginner",
    learningOutcomes: [
      "Visualize atomic structure",
      "Calculate atomic properties",
      "Understand periodic trends",
      "Explain chemical behavior through atomic structure",
    ],
  },
};

export default function BaseLessonScreen() {
  const router = useRouter();
  const { lessonId, moduleId } = useLocalSearchParams();

  // Get lesson content based on lessonId
  const lessonContent = useMemo(() => {
    const content = LESSON_CONTENT_BY_ID[lessonId as keyof typeof LESSON_CONTENT_BY_ID];
    if (!content) {
      console.warn(`No lesson content found for lessonId: ${lessonId}`);
      // Return a default "coming soon" structure
      return {
        _id: lessonId as string,
        title: "Lesson Coming Soon",
        overview:
          "This lesson content is being prepared and will be available soon.",
        objectives: [],
        keyPoints: [],
        prerequisites: [],
        duration: 0,
        resourceIds: [],
        exerciseIds: [],
        interactivityLevel: "medium",
        offlineAvailable: false,
        premiumOnly: false,
        hasVideo: false,
        videoId: null,
        estimatedCompletionTime: 0,
        difficultyLevel: "beginner",
        learningOutcomes: [],
      };
    }
    return content;
  }, [lessonId]);

  const [currentSection, setCurrentSection] = useState<
    "overview" | "objectives" | "keypoints" | "prerequisites"
  >("overview");
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  const handleStartMathLesson = () => {
    router.push(
      `/(routes)/learning/lessons/math-lesson?lessonId=${lessonId}&moduleId=${moduleId}`
    );
  };

  const handleWatchVideo = () => {
    router.push(
      `/(routes)/learning/video-player?videoId=${lessonContent.videoId}&lessonId=${lessonId}`
    );
  };

  const handleResourcePress = (resourceId: string) => {
    // TODO: Navigate to resource detail
    console.log(`Navigate to resource: ${resourceId}`);
  };

  const markSectionComplete = (section: string) => {
    if (!completedSections.includes(section)) {
      setCompletedSections([...completedSections, section]);
    }
  };

  const renderProgressIndicator = () => {
    const totalSections = 4;
    const completedCount = completedSections.length;
    const progress = (completedCount / totalSections) * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Lesson Progress</Text>
          <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View
            style={[styles.progressFill, { width: `${progress}%` }]}
            entering={SlideInRight.duration(800)}
          />
        </View>
        <Text style={styles.progressText}>
          {completedCount} of {totalSections} sections completed
        </Text>
      </View>
    );
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case "overview":
        return (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.sectionContent}
          >
            <View style={styles.overviewCard}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.overviewGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="book-outline" size={32} color="white" />
                <Text style={styles.overviewTitle}>Lesson Overview</Text>
              </LinearGradient>
              <View style={styles.overviewContent}>
                <Text style={styles.contentText}>{lessonContent.overview}</Text>

                <View style={styles.lessonMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text style={styles.metaText}>
                      {lessonContent.duration} minutes
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="trending-up-outline"
                      size={16}
                      color="#6B7280"
                    />
                    <Text style={styles.metaText}>
                      {lessonContent.difficultyLevel}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={16} color="#6B7280" />
                    <Text style={styles.metaText}>
                      {lessonContent.interactivityLevel} interaction
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => markSectionComplete("overview")}
            >
              <Text style={styles.completeButtonText}>
                {completedSections.includes("overview")
                  ? "Completed ✓"
                  : "Mark as Read"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case "prerequisites":
        return (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.sectionContent}
          >
            <View style={styles.prerequisitesCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="library-outline" size={24} color="#F59E0B" />
                <Text style={styles.cardTitle}>Prerequisites</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Make sure you understand these concepts before proceeding
              </Text>

              {lessonContent.prerequisites.length > 0 ? (
                lessonContent.prerequisites.map((prereq: string, index: number) => (
                  <View key={index} style={styles.prerequisiteItem}>
                    <View style={styles.prerequisiteIcon}>
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                    </View>
                    <Text style={styles.prerequisiteText}>{prereq}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.prerequisiteText}>
                  No specific prerequisites required for this lesson.
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => markSectionComplete("prerequisites")}
            >
              <Text style={styles.completeButtonText}>
                {completedSections.includes("prerequisites")
                  ? "Completed ✓"
                  : "I Understand These"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case "objectives":
        return (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.sectionContent}
          >
            <View style={styles.objectivesCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="flag-outline" size={24} color="#3B82F6" />
                <Text style={styles.cardTitle}>Learning Objectives</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                By the end of this lesson, you will be able to:
              </Text>

              {lessonContent.objectives.map((objective: string, index: number) => (
                <View key={index} style={styles.objectiveItem}>
                  <View style={styles.objectiveNumber}>
                    <Text style={styles.objectiveNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.objectiveText}>{objective}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => markSectionComplete("objectives")}
            >
              <Text style={styles.completeButtonText}>
                {completedSections.includes("objectives")
                  ? "Completed ✓"
                  : "Got It!"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case "keypoints":
        return (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.sectionContent}
          >
            <View style={styles.keypointsCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="key-outline" size={24} color="#10B981" />
                <Text style={styles.cardTitle}>Key Points</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Remember these important concepts:
              </Text>

              {lessonContent.keyPoints.map((point: string, index: number) => (
                <View key={index} style={styles.keypointItem}>
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    style={styles.keypointIcon}
                  >
                    <Ionicons name="bulb" size={16} color="white" />
                  </LinearGradient>
                  <Text style={styles.keypointText}>{point}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => markSectionComplete("keypoints")}
            >
              <Text style={styles.completeButtonText}>
                {completedSections.includes("keypoints")
                  ? "Completed ✓"
                  : "Understood!"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );

      default:
        return null;
    }
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
    progressContainer: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      marginVertical: 16,
      marginHorizontal: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    progressTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#374151",
      fontFamily: "Inter-SemiBold",
    },
    progressPercentage: {
      fontSize: 16,
      fontWeight: "700",
      color: "#3B82F6",
      fontFamily: "Inter-Bold",
    },
    progressBar: {
      height: 8,
      backgroundColor: "#E5E7EB",
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 8,
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#3B82F6",
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    videoSection: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      marginHorizontal: 20,
      marginBottom: 20,
    },
    videoHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    videoIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#FEE2E2",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    videoInfo: {
      flex: 1,
    },
    videoTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    videoDuration: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    watchButton: {
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#EF4444",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    watchButtonGradient: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    watchButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
      marginHorizontal: 20,
      borderRadius: 12,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 12,
      marginHorizontal: 2,
    },
    activeTab: {
      backgroundColor: "#3B82F6",
    },
    tabText: {
      fontSize: 12,
      color: "#64748B",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    activeTabText: {
      color: "white",
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    sectionContent: {
      marginBottom: 24,
    },
    overviewCard: {
      backgroundColor: "white",
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    overviewGradient: {
      padding: 20,
      alignItems: "center",
      gap: 8,
    },
    overviewTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
    },
    overviewContent: {
      padding: 20,
    },
    contentText: {
      fontSize: 16,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 24,
      marginBottom: 20,
    },
    lessonMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: "#F8FAFC",
      borderRadius: 12,
      padding: 16,
    },
    metaItem: {
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Medium",
    },
    prerequisitesCard: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#FEF3C7",
      shadowColor: "#F59E0B",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    objectivesCard: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#DBEAFE",
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    keypointsCard: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#D1FAE5",
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 12,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    cardSubtitle: {
      fontSize: 14,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
      marginBottom: 20,
      lineHeight: 20,
    },
    prerequisiteItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 12,
    },
    prerequisiteIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#D1FAE5",
      justifyContent: "center",
      alignItems: "center",
    },
    prerequisiteText: {
      flex: 1,
      fontSize: 15,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 22,
    },
    objectiveItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
      gap: 12,
    },
    objectiveNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "#3B82F6",
      justifyContent: "center",
      alignItems: "center",
    },
    objectiveNumberText: {
      fontSize: 14,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
    },
    objectiveText: {
      flex: 1,
      fontSize: 15,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 22,
    },
    keypointItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
      gap: 12,
    },
    keypointIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    keypointText: {
      flex: 1,
      fontSize: 15,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 22,
    },
    completeButton: {
      backgroundColor: "#F1F5F9",
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    completeButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#374151",
      fontFamily: "Inter-SemiBold",
    },
    resourcesSection: {
      backgroundColor: "white",
      borderRadius: 20,
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 16,
    },
    resourceItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },
    resourceIcon: {
      marginRight: 12,
    },
    resourceInfo: {
      flex: 1,
    },
    resourceTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
    },
    resourceType: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    startButton: {
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
      margin: 20,
    },
    startButtonGradient: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    startButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
    },
  });

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
            <Text style={styles.title}>{lessonContent.title}</Text>
            <Text style={styles.subtitle}>
              Base Lesson • {lessonContent.estimatedCompletionTime} min
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProgressIndicator()}

        {lessonContent.hasVideo && (
          <View style={styles.videoSection}>
            <View style={styles.videoHeader}>
              <View style={styles.videoIcon}>
                <Ionicons name="play" size={24} color="#EF4444" />
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>Watch Video Lesson</Text>
                <Text style={styles.videoDuration}>8:45 • HD Quality</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.watchButton}
              onPress={handleWatchVideo}
            >
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                style={styles.watchButtonGradient}
              >
                <Ionicons name="play" size={16} color="white" />
                <Text style={styles.watchButtonText}>Watch Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tabsContainer}>
          {[
            { key: "overview", label: "Overview" },
            { key: "prerequisites", label: "Prerequisites" },
            { key: "objectives", label: "Objectives" },
            { key: "keypoints", label: "Key Points" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                currentSection === tab.key && styles.activeTab,
              ]}
              onPress={() => setCurrentSection(tab.key as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  currentSection === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.scrollContent}>
          {renderSectionContent()}

          <View style={styles.resourcesSection}>
            <Text style={styles.sectionTitle}>Study Resources</Text>
            {lessonContent.resourceIds.length > 0 ? (
              lessonContent.resourceIds.map((resourceId: string, index: number) => (
                <TouchableOpacity
                  key={resourceId}
                  style={styles.resourceItem}
                  onPress={() => handleResourcePress(resourceId)}
                >
                  <Ionicons
                    name="document-text"
                    size={20}
                    color="#F59E0B"
                    style={styles.resourceIcon}
                  />
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceTitle}>Resource {index + 1}</Text>
                    <Text style={styles.resourceType}>Study Material • PDF</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.prerequisiteText}>
                No additional resources available for this lesson.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {lessonContent.estimatedCompletionTime > 0 && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartMathLesson}
        >
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            style={styles.startButtonGradient}
          >
            <Ionicons name="school" size={20} color="white" />
            <Text style={styles.startButtonText}>Start Interactive Lesson</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
