"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../utils/ThemeContext";
import { useUser } from "../utils/UserContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

// Import components
import XPBar from "../components/XPBar";
import QuizCard from "../components/QuizCard";
import SubjectProgressRing from "../components/home/SubjectProgressRing";
import StreakFlame from "../components/home/StreakFlame";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Stable data for exam prep
const EXAM_SUBJECTS = [
  {
    _id: "math_001",
    name: "Mathematics",
    progress: 75,
    color: "#FF6B6B",
    icon: "calculator",
    priority: "high",
    lastStudied: "2 hours ago",
  },
  {
    _id: "physics_001",
    name: "Physics",
    progress: 60,
    color: "#4ECDC4",
    icon: "planet",
    priority: "medium",
    lastStudied: "1 day ago",
  },
  {
    _id: "chemistry_001",
    name: "Chemistry",
    progress: 85,
    color: "#45B7D1",
    icon: "flask",
    priority: "low",
    lastStudied: "3 hours ago",
  },
  {
    _id: "biology_001",
    name: "Biology",
    progress: 40,
    color: "#96CEB4",
    icon: "leaf",
    priority: "high",
    lastStudied: "3 days ago",
  },
];

// Stable daily missions
const DAILY_MISSIONS = [
  {
    id: "daily_practice",
    title: "Daily Practice",
    description: "Complete 15 questions",
    progress: 8,
    target: 15,
    reward: 50,
    icon: "create-outline",
    color: "#4ECDC4",
  },
  {
    id: "weak_subjects",
    title: "Focus on Weak Areas",
    description: "Study Biology for 20 minutes",
    progress: 12,
    target: 20,
    reward: 75,
    icon: "trending-up-outline",
    color: "#FF6B6B",
  },
  {
    id: "review_mistakes",
    title: "Review Mistakes",
    description: "Review 5 incorrect answers",
    progress: 2,
    target: 5,
    reward: 30,
    icon: "refresh-outline",
    color: "#FFD93D",
  },
];

const STUDY_TIPS = [
  "Focus on your weakest subjects first - they have the highest impact.",
  "Practice questions daily to build speed and accuracy.",
  "Review mistakes immediately to avoid repeating them.",
  "Take 10-minute breaks every 45 minutes of study.",
  "Create a realistic study schedule and stick to it.",
  "Use active recall instead of just re-reading notes.",
];

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [showCelebration, ] = useState(false);

  // Stable calculations
  const examDaysLeft = useMemo(() => {
    if (!user?.goalDate) return null;
    const today = new Date();
    const examDate = new Date(user.goalDate);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [user?.goalDate]);

  const weeklyProgress = useMemo(() => {
    // TODO: Calculate from actual study data
    return 68;
  }, []);

  const prioritySubjects = useMemo(() => {
    return EXAM_SUBJECTS.filter((subject) => subject.priority === "high");
  }, []);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 30000);
    return () => clearInterval(tipInterval);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch latest data from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name?.split(" ")[0] || "Student";

    if (hour < 12) return `Good Morning, ${name}!`;
    if (hour < 17) return `Good Afternoon, ${name}!`;
    return `Good Evening, ${name}!`;
  };

  const getRecommendedQuizzes = () => {
    return [
      {
        id: "math_algebra",
        title: "Algebra Fundamentals",
        subject: "Mathematics",
        difficulty: "Medium" as const,
        questions: 15,
        duration: 20,
        completed: false,
        xpReward: 75,
        popularity: 89,
        examRelevance: 95,
        weaknessMatch: true,
      },
      {
        id: "bio_cells",
        title: "Cell Biology",
        subject: "Biology",
        difficulty: "Hard" as const,
        questions: 12,
        duration: 18,
        completed: false,
        xpReward: 100,
        popularity: 76,
        examRelevance: 88,
        weaknessMatch: true,
      },
      {
        id: "physics_mechanics",
        title: "Mechanics & Motion",
        subject: "Physics",
        difficulty: "Medium" as const,
        questions: 18,
        duration: 25,
        completed: false,
        xpReward: 85,
        popularity: 92,
        examRelevance: 91,
        weaknessMatch: false,
      },
    ];
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
    },
    headerGradient: {
      borderRadius: 20,
      padding: 20,
    },
    greetingContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    greetingSection: {
      flex: 1,
    },
    greeting: {
      fontSize: 24,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    motivationText: {
      fontSize: 14,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Inter-Medium",
    },
    streakContainer: {
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      padding: 12,
      minWidth: 80,
    },
    streakNumber: {
      fontSize: 20,
      fontWeight: "800",
      color: "white",
      fontFamily: "Inter-ExtraBold",
      marginTop: 4,
    },
    streakLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter-Medium",
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 12,
      padding: 10,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    examCountdown: {
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    countdownText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    daysLeft: {
      color: "white",
      fontSize: 20,
      fontWeight: "800",
      fontFamily: "Inter-ExtraBold",
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    seeAllButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    },
    seeAllText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontFamily: "Inter-SemiBold",
    },
    // Study tip
    tipCard: {
      backgroundColor: isDark ? "rgba(255,215,0,0.1)" : "rgba(255,215,0,0.05)",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: "#FFD700",
    },
    tipHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    tipTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFD700",
      marginLeft: 8,
      fontFamily: "Inter-SemiBold",
    },
    tipText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
      fontFamily: "Inter-Regular",
    },
    // Enhanced weekly progress
    weeklyProgressCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    progressTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    progressPercentage: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.primary,
      fontFamily: "Inter-ExtraBold",
    },
    progressBar: {
      height: 12,
      backgroundColor: theme.colors.border,
      borderRadius: 6,
      overflow: "hidden",
      marginBottom: 16,
    },
    progressFill: {
      height: "100%",
      borderRadius: 6,
    },
    progressStats: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    progressStat: {
      alignItems: "center",
    },
    progressStatValue: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    progressStatLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontFamily: "Inter-Regular",
    },
    // Priority subjects
    priorityContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    priorityHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    priorityTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginLeft: 8,
      fontFamily: "Inter-SemiBold",
    },
    prioritySubjects: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    // Subject cards in grid
    subjectsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 12,
    },
    subjectCard: {
      width: (SCREEN_WIDTH - 64) / 2,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 4,
    },
    subjectProgress: {
      marginBottom: 8,
    },
    subjectName: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      textAlign: "center",
      fontFamily: "Inter-SemiBold",
      marginBottom: 4,
    },
    subjectLastStudied: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
      fontFamily: "Inter-Regular",
    },
    // Quick actions
    quickActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      gap: 10,
    },
    quickAction: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quickActionIcon: {
      marginBottom: 8,
      padding: 8,
      borderRadius: 8,
    },
    quickActionText: {
      fontSize: 12,
      color: theme.colors.text,
      textAlign: "center",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    // Simplified mission cards
    missionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    missionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    missionContent: {
      flex: 1,
    },
    missionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
      marginBottom: 2,
    },
    missionDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginBottom: 4,
    },
    missionProgress: {
      fontSize: 12,
      color: theme.colors.primary,
      fontFamily: "Inter-Medium",
    },
    missionReward: {
      alignItems: "center",
    },
    missionRewardText: {
      fontSize: 12,
      color: "#FFD700",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    // Study insights section
    insightsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    insightsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    insightsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginLeft: 8,
      fontFamily: "Inter-SemiBold",
    },
    insightItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    insightIcon: {
      marginRight: 12,
    },
    insightText: {
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
      flex: 1,
    },
    insightValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
      fontFamily: "Inter-SemiBold",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      fontFamily: "Inter-Regular",
    },
    celebrationOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 1000,
    },
    celebrationText: {
      fontSize: 24,
      fontWeight: "700",
      color: "white",
      textAlign: "center",
      fontFamily: "Inter-Bold",
    },
  });

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons
            name="person-circle-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyStateText}>
            Please log in to start your exam preparation
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Celebration overlay - minimal animation */}
      {showCelebration && (
        <View style={styles.celebrationOverlay}>
          <Text style={styles.celebrationText}>
            🎉 Great job! Keep it up! 🎉
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Enhanced Header with Streak */}
        <View style={styles.header}>
          <LinearGradient
            colors={isDark ? ["#667eea", "#764ba2"] : ["#4facfe", "#00f2fe"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.greetingContainer}>
              <View style={styles.greetingSection}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.motivationText}>
                  {examDaysLeft
                    ? `${examDaysLeft} days until ${
                        user.selectedExam || "your exam"
                      }`
                    : "Ready to study!"}
                </Text>
              </View>

              <View style={styles.streakContainer}>
                <StreakFlame streak={user.streak} size={20} />
                <Text style={styles.streakNumber}>{user.streak}</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
              </View>
            </View>

            {examDaysLeft !== null && (
              <View style={styles.examCountdown}>
                <Text style={styles.countdownText}>Days until exam</Text>
                <Text style={styles.daysLeft}>{examDaysLeft}</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* XP Progress */}
          <XPBar currentXP={user.xp} level={user.level} />

          {/* Study Tip */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={16} color="#FFD700" />
              <Text style={styles.tipTitle}>Study Tip</Text>
            </View>
            <Text style={styles.tipText}>{STUDY_TIPS[currentTip]}</Text>
          </View>

          {/* Enhanced Weekly Progress */}
          <View style={styles.weeklyProgressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                This Week&apos;s Progress
              </Text>
              <Text style={styles.progressPercentage}>{weeklyProgress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={["#4facfe", "#00f2fe"]}
                style={[styles.progressFill, { width: `${weeklyProgress}%` }]}
              />
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>12</Text>
                <Text style={styles.progressStatLabel}>Quizzes</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>4.2h</Text>
                <Text style={styles.progressStatLabel}>Study Time</Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>85%</Text>
                <Text style={styles.progressStatLabel}>Accuracy</Text>
              </View>
            </View>
          </View>

          {/* Priority Subjects */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Focus Areas</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priorityContainer}>
            <View style={styles.priorityHeader}>
              <Ionicons name="warning" size={20} color="#FF6B6B" />
              <Text style={styles.priorityTitle}>Needs Attention</Text>
            </View>
            <View style={styles.prioritySubjects}>
              {prioritySubjects.map((subject) => (
                <SubjectProgressRing
                  key={subject.name}
                  subject={subject.name}
                  progress={subject.progress}
                  color={subject.color}
                  icon={subject.icon}
                />
              ))}
            </View>
          </View>

          {/* All Subjects in Cards */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subject Progress</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push(`/(routes)/learning/subjects`)}
            >
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subjectsContainer}>
            {EXAM_SUBJECTS.map((subject) => (
              <TouchableOpacity
                key={subject.name}
                style={styles.subjectCard}
                onPress={() =>
                  router.push(
                    `/(routes)/learning/topics?subjectId=${subject._id}&subjectName=${subject.name}`
                  )
                }
              >
                <View style={styles.subjectProgress}>
                  <SubjectProgressRing
                    subject=""
                    progress={subject.progress}
                    color={subject.color}
                    icon={subject.icon}
                  />
                </View>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectLastStudied}>
                  Last studied {subject.lastStudied}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Study Insights */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Study Insights</Text>
          </View>

          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Ionicons
                name="analytics"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.insightsTitle}>Your Performance</Text>
            </View>

            <View style={styles.insightItem}>
              <Ionicons
                name="trending-up"
                size={16}
                color="#4CAF50"
                style={styles.insightIcon}
              />
              <Text style={styles.insightText}>
                Average quiz score this week
              </Text>
              <Text style={styles.insightValue}>85%</Text>
            </View>

            <View style={styles.insightItem}>
              <Ionicons
                name="time"
                size={16}
                color="#FF9800"
                style={styles.insightIcon}
              />
              <Text style={styles.insightText}>Average time per question</Text>
              <Text style={styles.insightValue}>1.2 min</Text>
            </View>

            <View style={styles.insightItem}>
              <Ionicons
                name="flag"
                size={16}
                color="#2196F3"
                style={styles.insightIcon}
              />
              <Text style={styles.insightText}>Most improved subject</Text>
              <Text style={styles.insightValue}>Chemistry</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/(tabs)/study")}
            >
              <LinearGradient
                colors={["#FF6B6B", "#FF8E8E"]}
                style={styles.quickActionIcon}
              >
                <Ionicons name="book" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Study</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/(routes)/practice")}
            >
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                style={styles.quickActionIcon}
              >
                <Ionicons name="create" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Practice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/(routes)/mock-exam")}
            >
              <LinearGradient
                colors={["#45B7D1", "#96C93D"]}
                style={styles.quickActionIcon}
              >
                <Ionicons name="timer" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Mock Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/(routes)/review")}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.quickActionIcon}
              >
                <Ionicons name="refresh" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Review</Text>
            </TouchableOpacity>
          </View>

          {/* Recommended Quizzes */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push("/(routes)/assessments")}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {getRecommendedQuizzes().map((quiz) => (
            <Animated.View key={quiz.id} entering={FadeIn.duration(300)}>
              <QuizCard
                title={quiz.title}
                subject={quiz.subject}
                difficulty={quiz.difficulty}
                questions={quiz.questions}
                duration={quiz.duration}
                completed={quiz.completed}
                xpReward={quiz.xpReward}
                popularity={quiz.popularity}
                examRelevance={quiz.examRelevance}
                weaknessMatch={quiz.weaknessMatch}
                onPress={() => router.push(`/(routes)/quiz/${quiz.id}`)}
              />
            </Animated.View>
          ))}

          {/* Simplified Daily Missions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Goals</Text>
          </View>

          {DAILY_MISSIONS.map((mission) => (
            <TouchableOpacity key={mission.id} style={styles.missionCard}>
              <LinearGradient
                colors={[mission.color, mission.color + "80"]}
                style={styles.missionIcon}
              >
                <Ionicons name={mission.icon as any} size={20} color="white" />
              </LinearGradient>

              <View style={styles.missionContent}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionDescription}>
                  {mission.description}
                </Text>
                <Text style={styles.missionProgress}>
                  {mission.progress}/{mission.target} completed
                </Text>
              </View>

              <View style={styles.missionReward}>
                <Ionicons name="diamond" size={16} color="#FFD700" />
                <Text style={styles.missionRewardText}>+{mission.reward}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
