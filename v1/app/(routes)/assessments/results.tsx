"use client";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { score, correctAnswers, totalQuestions, timeSpent, hearts, streak } =
    useLocalSearchParams();

  const scoreValue = Number.parseInt(score as string) || 0;
  const correctCount = Number.parseInt(correctAnswers as string) || 0;
  const totalCount = Number.parseInt(totalQuestions as string) || 0;
  const timeValue = Number.parseInt(timeSpent as string) || 0;
  // const heartsLeft = Number.parseInt(hearts as string) || 0;
  const streakValue = Number.parseInt(streak as string) || 0;

  const getPerformanceData = () => {
    if (scoreValue >= 90) {
      return {
        title: "Outstanding! 🎉",
        subtitle: "Perfect performance!",
        color: "#10B981",
        emoji: "🏆",
        message: "You've mastered this topic completely!",
      };
    } else if (scoreValue >= 80) {
      return {
        title: "Excellent! ⭐",
        subtitle: "Great job!",
        color: "#059669",
        emoji: "🌟",
        message: "Impressive work! Keep it up!",
      };
    } else if (scoreValue >= 70) {
      return {
        title: "Good Job! 👍",
        subtitle: "Well done!",
        color: "#0EA5E9",
        emoji: "👏",
        message: "You're on the right track!",
      };
    } else if (scoreValue >= 60) {
      return {
        title: "Keep Practicing! 💪",
        subtitle: "You can improve!",
        color: "#F59E0B",
        emoji: "📚",
        message: "A bit more practice will help!",
      };
    } else {
      return {
        title: "Keep Learning! 📖",
        subtitle: "Don't give up!",
        color: "#EF4444",
        emoji: "💪",
        message: "Every expert was once a beginner!",
      };
    }
  };

  const performance = getPerformanceData();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just scored ${scoreValue}% on my quiz! 🎯 Got ${correctCount}/${totalCount} questions right! 📚✨`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/home")}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Results</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      > */}
        {/* Score Circle */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <LinearGradient
              colors={[performance.color, performance.color + "CC"]}
              style={styles.scoreCircle}
            >
              <Text style={styles.scoreText}>{scoreValue}%</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </LinearGradient>
          </View>

          <Text style={styles.performanceEmoji}>{performance.emoji}</Text>
          <Text style={[styles.performanceTitle, { color: performance.color }]}>
            {performance.title}
          </Text>
          <Text style={styles.performanceSubtitle}>{performance.subtitle}</Text>
          <Text style={styles.performanceMessage}>{performance.message}</Text>
        </View>

        {/* Achievement Badge */}
        {scoreValue >= 80 && (
          <View style={styles.achievementBadge}>
            <Text style={styles.badgeEmoji}>🏆</Text>
            <Text style={styles.badgeText}>🎉 High Achiever Badge Earned!</Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardLeft]}>
              <Ionicons name="checkmark-circle" size={28} color="#10B981" />
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={[styles.statCard, styles.statCardRight]}>
              <Ionicons name="close-circle" size={28} color="#EF4444" />
              <Text style={styles.statValue}>{totalCount - correctCount}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardLeft]}>
              <Ionicons name="time" size={28} color="#6366F1" />
              <Text style={styles.statValue}>{formatTime(timeValue)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>

            <View style={[styles.statCard, styles.statCardRight]}>
              <Ionicons name="flame" size={28} color="#F59E0B" />
              <Text style={styles.statValue}>{streakValue}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Hearts Status */}
        {/* <View style={styles.heartsCard}>
          <View style={styles.heartsRow}>
            <Text style={styles.heartsTitle}>Hearts Remaining</Text>
            <View style={styles.heartsContainer}>
              {[...Array(3)].map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < heartsLeft ? "heart" : "heart-outline"}
                  size={24}
                  color={index < heartsLeft ? "#EF4444" : "#D1D5DB"}
                  style={{ marginLeft: index > 0 ? 4 : 0 }}
                />
              ))}
            </View>
          </View>
        </View> */}

      {/* Action Buttons */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom + 20, 40) },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(tabs)/study")}
        >
          <Text style={styles.primaryButtonText}>Continue Learning</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtonsRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(routes)/assessments/quiz")}
          >
            <Text style={styles.secondaryButtonText}>Retake Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text style={styles.secondaryButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  // Header styles
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  // Score section styles
  scoreSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  scoreText: {
    fontSize: 30,
    fontWeight: "900",
    color: "white",
  },
  scoreLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.9,
  },
  performanceEmoji: {
    fontSize: 40,
    marginBottom: 0,
  },
  performanceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  performanceSubtitle: {
    color: "#6B7280",
    fontSize: 16,
    marginBottom: 12,
  },
  performanceMessage: {
    color: "#374151",
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  // Achievement badge styles
  achievementBadge: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#FFFBEB",
    borderWidth: 2,
    borderColor: "#FDE68A",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
  },
  badgeEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  badgeText: {
    color: "#B45309",
    fontWeight: "600",
    textAlign: "center",
  },
  // Stats grid styles
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardLeft: {
    marginRight: 8,
  },
  statCardRight: {
    marginLeft: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
  // Hearts status styles
  heartsCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  heartsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heartsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  heartsContainer: {
    flexDirection: "row",
  },
  // Footer styles
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  secondaryButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
});
