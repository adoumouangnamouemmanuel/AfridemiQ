"use client";

import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  interpolateColor,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export default function ResultsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { score, correctAnswers, totalQuestions, xpEarned, timeSpent } =
    useLocalSearchParams();

  const scoreValue = Number.parseInt(score as string) || 0;
  const correctCount = Number.parseInt(correctAnswers as string) || 0;
  const totalCount = Number.parseInt(totalQuestions as string) || 0;
  const xpValue = Number.parseInt(xpEarned as string) || 0;
  const timeValue = Number.parseInt(timeSpent as string) || 0;

  const circleProgress = useSharedValue(0);
  const scaleValue = useSharedValue(0);
  const fadeValue = useSharedValue(0);

  useEffect(() => {
    // Animate score circle
    circleProgress.value = withDelay(500, withSpring(scoreValue / 100));

    // Animate cards
    scaleValue.value = withDelay(200, withSpring(1));
    fadeValue.value = withDelay(300, withSpring(1));
  }, []);

  const animatedCircleStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      circleProgress.value,
      [0, 0.5, 0.7, 1],
      [
        theme.colors.error,
        theme.colors.warning,
        theme.colors.info,
        theme.colors.success,
      ]
    );

    return {
      transform: [{ scale: withSequence(withSpring(1.2), withSpring(1)) }],
      backgroundColor,
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: fadeValue.value,
  }));

  const getPerformanceMessage = () => {
    if (scoreValue >= 90)
      return { message: "Outstanding! 🎉", color: theme.colors.success };
    if (scoreValue >= 80)
      return { message: "Excellent! 🌟", color: theme.colors.success };
    if (scoreValue >= 70)
      return { message: "Good Job! 👍", color: theme.colors.info };
    if (scoreValue >= 60)
      return { message: "Keep Practicing! 💪", color: theme.colors.warning };
    return { message: "Need More Study 📚", color: theme.colors.error };
  };

  const performance = getPerformanceMessage();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just scored ${scoreValue}% on my ExamPrep Africa quiz! 🎯 Got ${correctCount}/${totalCount} questions right and earned ${xpValue} XP! 📚✨`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
    },
    shareButton: {
      padding: theme.spacing.sm,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    scoreSection: {
      alignItems: "center",
      marginVertical: theme.spacing.xl,
    },
    scoreCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    scoreText: {
      fontSize: 48,
      fontWeight: "bold",
      color: "white",
    },
    scoreLabel: {
      fontSize: 16,
      color: "white",
      opacity: 0.9,
    },
    performanceMessage: {
      fontSize: 24,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    performanceSubtext: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    statsContainer: {
      marginVertical: theme.spacing.xl,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    statCard: {
      width: "48%",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statIcon: {
      marginBottom: theme.spacing.sm,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    actionsContainer: {
      paddingVertical: theme.spacing.xl,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    actionButtonSecondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    actionButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    actionButtonTextSecondary: {
      color: theme.colors.primary,
    },
    badgeContainer: {
      backgroundColor: theme.colors.accent + "20",
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginVertical: theme.spacing.md,
      alignItems: "center",
    },
    badgeText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.accent,
      textAlign: "center",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/home")}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Results</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreSection}>
          <Animated.View style={[styles.scoreCircle, animatedCircleStyle]}>
            <LinearGradient
              colors={[performance.color, performance.color + "80"]}
              style={styles.scoreCircle}
            >
              <Text style={styles.scoreText}>{scoreValue}%</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </LinearGradient>
          </Animated.View>

          <Text
            style={[styles.performanceMessage, { color: performance.color }]}
          >
            {performance.message}
          </Text>
          <Text style={styles.performanceSubtext}>
            You got {correctCount} out of {totalCount} questions correct
          </Text>
        </View>

        {scoreValue >= 80 && (
          <Animated.View style={[styles.badgeContainer, animatedCardStyle]}>
            <Ionicons name="trophy" size={32} color={theme.colors.accent} />
            <Text style={styles.badgeText}>
              🎉 Excellent Performance! You&apos;ve earned a High Achiever badge!
            </Text>
          </Animated.View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <Animated.View style={[styles.statCard, animatedCardStyle]}>
              <View style={styles.statIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={32}
                  color={theme.colors.success}
                />
              </View>
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct Answers</Text>
            </Animated.View>

            <Animated.View style={[styles.statCard, animatedCardStyle]}>
              <View style={styles.statIcon}>
                <Ionicons
                  name="close-circle"
                  size={32}
                  color={theme.colors.error}
                />
              </View>
              <Text style={styles.statValue}>{totalCount - correctCount}</Text>
              <Text style={styles.statLabel}>Incorrect Answers</Text>
            </Animated.View>

            <Animated.View style={[styles.statCard, animatedCardStyle]}>
              <View style={styles.statIcon}>
                <Ionicons name="star" size={32} color={theme.colors.warning} />
              </View>
              <Text style={styles.statValue}>{xpValue}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </Animated.View>

            <Animated.View style={[styles.statCard, animatedCardStyle]}>
              <View style={styles.statIcon}>
                <Ionicons name="time" size={32} color={theme.colors.info} />
              </View>
              <Text style={styles.statValue}>{formatTime(timeValue)}</Text>
              <Text style={styles.statLabel}>Time Spent</Text>
            </Animated.View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/study")}
          >
            <Text style={styles.actionButtonText}>Continue Learning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => router.push("/(routes)/quiz/retry")}
          >
            <Text
              style={[
                styles.actionButtonText,
                styles.actionButtonTextSecondary,
              ]}
            >
              Retake Quiz
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Text
              style={[
                styles.actionButtonText,
                styles.actionButtonTextSecondary,
              ]}
            >
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
