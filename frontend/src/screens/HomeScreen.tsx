"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useTheme } from "../utils/ThemeContext"
import { useUser } from "../utils/UserContext"
import { Ionicons } from "@expo/vector-icons"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import XPBar from "../components/XPBar"
import QuizCard from "../components/QuizCard"
import MissionCard from "../components/MissionCard"
import missionsData from "../data/missions.json"
import questionsData from "../data/questions.json"

export default function HomeScreen() {
  const { theme } = useTheme()
  const { user, addXP, incrementStreak } = useUser()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [todaysMissions, setTodaysMissions] = useState(missionsData.slice(0, 3))

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const getDailyQuizzes = () => {
    return questionsData.slice(0, 3).map((quiz, index) => ({
      id: quiz.id,
      title: `Daily Quiz ${index + 1}`,
      subject: quiz.subject,
      difficulty: "Medium" as const,
      questions: 10,
      duration: 15,
      completed: false,
    }))
  }

  const handleQuizPress = (quizId: string) => {
    router.push(`/(routes)/quiz/${quizId}`)
  }

  const handleMissionPress = (missionId: string) => {
    // Handle mission press
    console.log("Mission pressed:", missionId)
  }

  const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const translateY = useSharedValue(50)
    const opacity = useSharedValue(0)

    React.useEffect(() => {
      translateY.value = withDelay(delay, withSpring(0))
      opacity.value = withDelay(delay, withSpring(1))
    }, [])

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }))

    return <Animated.View style={animatedStyle}>{children}</Animated.View>
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    headerGradient: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
    },
    greetingContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    greeting: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
    },
    userName: {
      fontSize: 16,
      color: "rgba(255,255,255,0.8)",
      marginTop: 4,
    },
    notificationButton: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      padding: 8,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.md,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
    statLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      marginTop: 4,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    todayGoalCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    goalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    goalDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    goalProgress: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    goalProgressText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: "500",
    },
    goalProgressBar: {
      flex: 1,
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      marginHorizontal: theme.spacing.md,
      overflow: "hidden",
    },
    goalProgressFill: {
      height: "100%",
      borderRadius: 4,
    },
    quickActionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    quickActionButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: "center",
      marginHorizontal: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quickActionIcon: {
      marginBottom: theme.spacing.sm,
    },
    quickActionText: {
      fontSize: 12,
      color: theme.colors.text,
      textAlign: "center",
      fontWeight: "500",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: theme.spacing.xl,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
  })

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Please log in to continue</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.headerGradient}>
            <View style={styles.greetingContainer}>
              <View>
                <Text style={styles.greeting}>{getGreeting()}!</Text>
                <Text style={styles.userName}>{user.name}</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.level}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.xp}</Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <AnimatedCard delay={100}>
            <XPBar currentXP={user.xp} level={user.level} />
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <View style={styles.todayGoalCard}>
              <Text style={styles.goalTitle}>Today's Goal</Text>
              <Text style={styles.goalDescription}>Complete 3 quizzes to maintain your streak</Text>
              <View style={styles.goalProgress}>
                <Text style={styles.goalProgressText}>1/3</Text>
                <View style={styles.goalProgressBar}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={[styles.goalProgressFill, { width: "33%" }]}
                  />
                </View>
                <Text style={styles.goalProgressText}>33%</Text>
              </View>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={300}>
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/(tabs)/study")}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="book" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.quickActionText}>Study</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/(tabs)/challenges")}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="trophy" size={24} color={theme.colors.secondary} />
                </View>
                <Text style={styles.quickActionText}>Challenges</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/(tabs)/leaderboard")}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="podium" size={24} color={theme.colors.accent} />
                </View>
                <Text style={styles.quickActionText}>Leaderboard</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>

          <Text style={styles.sectionTitle}>Daily Quizzes</Text>
          {getDailyQuizzes().map((quiz, index) => (
            <AnimatedCard key={quiz.id} delay={400 + index * 100}>
              <QuizCard
                title={quiz.title}
                subject={quiz.subject}
                difficulty={quiz.difficulty}
                questions={quiz.questions}
                duration={quiz.duration}
                completed={quiz.completed}
                onPress={() => handleQuizPress(quiz.id)}
              />
            </AnimatedCard>
          ))}

          <Text style={styles.sectionTitle}>Today's Missions</Text>
          {todaysMissions.map((mission, index) => (
            <AnimatedCard key={mission.id} delay={700 + index * 100}>
              <MissionCard
                title={mission.title}
                description={mission.description}
                progress={mission.progress}
                target={mission.target}
                reward={mission.reward}
                icon={mission.icon}
                completed={mission.completed}
                onPress={() => handleMissionPress(mission.id)}
              />
            </AnimatedCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
