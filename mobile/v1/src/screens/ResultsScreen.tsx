"use client";

import { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  withRepeat,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    score,
    correctAnswers,
    totalQuestions,
    xpEarned,
    timeSpent,
    streak,
  } = useLocalSearchParams();

  const scoreValue = Number.parseInt(score as string) || 0;
  const correctCount = Number.parseInt(correctAnswers as string) || 0;
  const totalCount = Number.parseInt(totalQuestions as string) || 0;
  const xpValue = Number.parseInt(xpEarned as string) || 0;
  const timeValue = Number.parseInt(timeSpent as string) || 0;
  const streakValue = Number.parseInt(streak as string) || 0;

  // Animations
  const confettiAnimation = useSharedValue(0);
  const scoreAnimation = useSharedValue(0);


  const cardAnimation1 = useSharedValue(0);
  const cardAnimation2 = useSharedValue(0);
  const cardAnimation3 = useSharedValue(0);
  const cardAnimation4 = useSharedValue(0);
  const cardAnimations = useMemo(
    () => [cardAnimation1, cardAnimation2, cardAnimation3, cardAnimation4],
    [cardAnimation1, cardAnimation2, cardAnimation3, cardAnimation4]
  );
  const xpAnimation = useSharedValue(0);
  const celebrationAnimation = useSharedValue(1);

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiAnimation.value,
    transform: [{ scale: confettiAnimation.value }],
  }));

  const cardAnimatedStyles = cardAnimations.map((anim: Animated.SharedValue<number>) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      opacity: anim.value,
      transform: [{ translateY: (1 - anim.value) * 30 }, { scale: anim.value }],
    }))
  );

  const xpStyle = useAnimatedStyle(() => ({
    opacity: xpAnimation.value,
    transform: [{ scale: xpAnimation.value }],
  }));

  useEffect(() => {
    // Start animations
    confettiAnimation.value = withDelay(500, withSpring(1));
    scoreAnimation.value = withDelay(800, withSpring(1));

    cardAnimations.forEach((anim: Animated.SharedValue<number>, index: number) => {
      anim.value = withDelay(1000 + index * 200, withSpring(1));
    });

    xpAnimation.value = withDelay(1800, withSpring(1));

    // Celebration animation for good scores
    if (scoreValue >= 80) {
      celebrationAnimation.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        3,
        false
      );
    }
  }, [cardAnimations, celebrationAnimation, confettiAnimation, scoreAnimation, scoreValue, xpAnimation]);

  const getPerformanceData = () => {
    if (scoreValue >= 90) {
      return {
        title: "Outstanding! 🎉",
        subtitle: "You're a quiz master!",
        color: "#10B981",
        emoji: "🏆",
        message: "Perfect performance! You've mastered this topic.",
      };
    }
    if (scoreValue >= 80) {
      return {
        title: "Excellent! 🌟",
        subtitle: "Great job!",
        color: "#059669",
        emoji: "⭐",
        message: "Impressive work! You're doing really well.",
      };
    }
    if (scoreValue >= 70) {
      return {
        title: "Good Job! 👍",
        subtitle: "Keep it up!",
        color: "#0EA5E9",
        emoji: "👏",
        message: "Nice work! You're on the right track.",
      };
    }
    if (scoreValue >= 60) {
      return {
        title: "Keep Practicing! 💪",
        subtitle: "You can do better!",
        color: "#F59E0B",
        emoji: "📚",
        message: "Good effort! A bit more practice will help.",
      };
    }
    return {
      title: "Need More Study 📚",
      subtitle: "Don't give up!",
      color: "#EF4444",
      emoji: "💪",
      message: "Keep studying! Every expert was once a beginner.",
    };
  };

  const performance = getPerformanceData();

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
      backgroundColor: "#F8FAFF",
      paddingTop: insets.top,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1F2937",
    },
    shareButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "white",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    confettiContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    confetti: {
      fontSize: 40,
    },
    scoreSection: {
      alignItems: "center",
      marginVertical: 32,
    },
    scoreCircle: {
      width: 180,
      height: 180,
      borderRadius: 90,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
    scoreText: {
      fontSize: 48,
      fontWeight: "900",
      color: "white",
    },
    scoreLabel: {
      fontSize: 16,
      color: "white",
      opacity: 0.9,
      fontWeight: "600",
    },
    performanceContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    performanceEmoji: {
      fontSize: 48,
      marginBottom: 12,
    },
    performanceTitle: {
      fontSize: 28,
      fontWeight: "700",
      marginBottom: 8,
    },
    performanceSubtitle: {
      fontSize: 18,
      color: "#6B7280",
      marginBottom: 12,
    },
    performanceMessage: {
      fontSize: 16,
      color: "#374151",
      textAlign: "center",
      lineHeight: 24,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 32,
    },
    statCard: {
      width: (SCREEN_WIDTH - 60) / 2,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    statIcon: {
      marginBottom: 12,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: "#1F2937",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: "#6B7280",
      textAlign: "center",
      fontWeight: "500",
    },
    xpCard: {
      backgroundColor: "white",
      borderRadius: 20,
      padding: 24,
      marginBottom: 32,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
    },
    xpTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1F2937",
      marginBottom: 8,
    },
    xpValue: {
      fontSize: 36,
      fontWeight: "900",
      color: "#F59E0B",
      marginBottom: 8,
    },
    xpSubtitle: {
      fontSize: 14,
      color: "#6B7280",
    },
    actionsContainer: {
      paddingBottom: Math.max(insets.bottom + 20, 40),
    },
    actionButton: {
      borderRadius: 16,
      padding: 18,
      alignItems: "center",
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    actionButtonSecondary: {
      backgroundColor: "white",
      borderWidth: 2,
      borderColor: "#E5E7EB",
    },
    actionButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
    },
    actionButtonTextSecondary: {
      color: "#374151",
    },
    badgeContainer: {
      backgroundColor: "#FEF3C7",
      borderRadius: 16,
      padding: 20,
      marginVertical: 20,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#F59E0B",
    },
    badgeEmoji: {
      fontSize: 32,
      marginBottom: 8,
    },
    badgeText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#D97706",
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      {/* Confetti */}
      {scoreValue >= 80 && (
        <Animated.View style={[styles.confettiContainer, confettiStyle]}>
          <Text style={styles.confetti}>🎉 ✨ 🎊 ⭐ 🏆</Text>
        </Animated.View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/home")}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Results</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Score Section */}
        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle]}>
            <LinearGradient
              colors={[performance.color, performance.color + "CC"]}
              style={styles.scoreCircle}
            >
              <Text style={styles.scoreText}>{scoreValue}%</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </LinearGradient>
          </View>

          <View style={styles.performanceContainer}>
            <Text style={styles.performanceEmoji}>{performance.emoji}</Text>
            <Text
              style={[styles.performanceTitle, { color: performance.color }]}
            >
              {performance.title}
            </Text>
            <Text style={styles.performanceSubtitle}>
              {performance.subtitle}
            </Text>
            <Text style={styles.performanceMessage}>{performance.message}</Text>
          </View>
        </View>

        {/* Achievement Badge */}
        {scoreValue >= 80 && (
          <Animated.View style={[styles.badgeContainer, cardAnimatedStyles[0]]}>
            <Text style={styles.badgeEmoji}>🏆</Text>
            <Text style={styles.badgeText}>
              🎉 Excellent Performance! You&apos;ve earned a High Achiever badge!
            </Text>
          </Animated.View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Animated.View style={[styles.statCard, cardAnimatedStyles[0]]}>
            <View style={styles.statIcon}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{correctCount}</Text>
            <Text style={styles.statLabel}>Correct Answers</Text>
          </Animated.View>

          <Animated.View style={[styles.statCard, cardAnimatedStyles[1]]}>
            <View style={styles.statIcon}>
              <Ionicons name="close-circle" size={32} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{totalCount - correctCount}</Text>
            <Text style={styles.statLabel}>Incorrect Answers</Text>
          </Animated.View>

          <Animated.View style={[styles.statCard, cardAnimatedStyles[2]]}>
            <View style={styles.statIcon}>
              <Ionicons name="time" size={32} color="#6366F1" />
            </View>
            <Text style={styles.statValue}>{formatTime(timeValue)}</Text>
            <Text style={styles.statLabel}>Time Spent</Text>
          </Animated.View>

          <Animated.View style={[styles.statCard, cardAnimatedStyles[3]]}>
            <View style={styles.statIcon}>
              <Ionicons name="flame" size={32} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{streakValue}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </Animated.View>
        </View>

        {/* XP Card */}
        <Animated.View style={[styles.xpCard, xpStyle]}>
          <Text style={styles.xpTitle}>XP Earned</Text>
          <Text style={styles.xpValue}>+{xpValue}</Text>
          <Text style={styles.xpSubtitle}>Experience Points</Text>
        </Animated.View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/study")}
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
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
    </View>
  );
}
