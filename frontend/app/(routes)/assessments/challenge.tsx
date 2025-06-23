"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock data based on challenge model
const mockChallenge = {
  id: "1",
  title: "Mathematics Championship",
  description:
    "Compete with students nationwide in this exciting math challenge",
  difficulty: "hard",
  level: "terminale",
  subjectId: "math",
  topicId: "algebra",
  timeLimit: 45, // minutes
  maxParticipants: 100,
  participants: Array.from({ length: 67 }, (_, i) => `user_${i + 1}`),
  questionIds: ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"],
  scheduling: {
    startDate: new Date("2024-01-20T10:00:00Z"),
    endDate: new Date("2024-01-20T11:00:00Z"),
    registrationDeadline: new Date("2024-01-20T09:30:00Z"),
  },
  prizes: [
    {
      rank: 1,
      description: "Gold Medal + 500 points",
      points: 500,
      badge: "🥇",
    },
    {
      rank: 2,
      description: "Silver Medal + 300 points",
      points: 300,
      badge: "🥈",
    },
    {
      rank: 3,
      description: "Bronze Medal + 200 points",
      points: 200,
      badge: "🥉",
    },
  ],
  winners: [
    {
      userId: "user_1",
      rank: 1,
      score: 95,
      timeSpent: 2100,
      completedAt: new Date(),
    },
    {
      userId: "user_2",
      rank: 2,
      score: 92,
      timeSpent: 2250,
      completedAt: new Date(),
    },
    {
      userId: "user_3",
      rank: 3,
      score: 88,
      timeSpent: 2400,
      completedAt: new Date(),
    },
  ],
  rules: {
    allowMultipleAttempts: false,
    showLeaderboard: true,
    shuffleQuestions: true,
    preventCheating: true,
  },
  status: "completed", // draft, open, active, completed
  analytics: {
    totalParticipants: 67,
    completionRate: 85,
    averageScore: 76,
    averageTimeSpent: 2580,
  },
};

interface LeaderboardItemProps {
  winner: (typeof mockChallenge.winners)[0];
  index: number;
}

function LeaderboardItem({ winner, index }: LeaderboardItemProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return styles.goldRank;
      case 2:
        return styles.silverRank;
      case 3:
        return styles.bronzeRank;
      default:
        return styles.defaultRank;
    }
  };

  const prize = mockChallenge.prizes.find((p) => p.rank === winner.rank);

  return (
    <View style={[styles.leaderboardItem, getRankStyle(winner.rank)]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankBadge}>
          {prize?.badge || `#${winner.rank}`}
        </Text>
        <Text style={styles.rankNumber}>{winner.rank}</Text>
      </View>

      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>Player {winner.userId.slice(-2)}</Text>
        <Text style={styles.playerScore}>
          {winner.score}% • {formatTime(winner.timeSpent)}
        </Text>
      </View>

      {prize && (
        <View style={styles.prizeInfo}>
          <Text style={styles.prizePoints}>+{prize.points}</Text>
          <Text style={styles.prizeLabel}>points</Text>
        </View>
      )}
    </View>
  );
}

export default function ChallengeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [timeUntilStart, setTimeUntilStart] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const startTime = new Date(mockChallenge.scheduling.startDate);
      const diff = Math.max(
        0,
        Math.floor((startTime.getTime() - now.getTime()) / 1000)
      );
      setTimeUntilStart(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusInfo = () => {
    switch (mockChallenge.status) {
      case "open":
        return {
          title: "Registration Open",
          subtitle: "Join the challenge now!",
          color: "#10B981",
          icon: "checkmark-circle",
        };
      case "active":
        return {
          title: "Challenge Active",
          subtitle: "Competition in progress",
          color: "#F59E0B",
          icon: "time",
        };
      case "completed":
        return {
          title: "Challenge Completed",
          subtitle: "View final results",
          color: "#6366F1",
          icon: "trophy",
        };
      default:
        return {
          title: "Coming Soon",
          subtitle: "Challenge not yet open",
          color: "#6B7280",
          icon: "calendar",
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleJoinChallenge = () => {
    setIsRegistered(true);
    // TODO: Implement actual registration logic
  };

  const handleStartChallenge = () => {
    router.push("/(routes)/assessments/quiz");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Challenge Info */}
        <View style={styles.challengeInfo}>
          <View style={styles.statusBadge}>
            <Ionicons
              name={statusInfo.icon as any}
              size={16}
              color={statusInfo.color}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.title}
            </Text>
          </View>

          <Text style={styles.challengeTitle}>{mockChallenge.title}</Text>
          <Text style={styles.challengeDescription}>
            {mockChallenge.description}
          </Text>

          <View style={styles.challengeDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                {mockChallenge.timeLimit} minutes
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                {mockChallenge.questionIds.length} questions
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                {mockChallenge.participants.length}/
                {mockChallenge.maxParticipants} participants
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="school-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                {mockChallenge.level} • {mockChallenge.difficulty}
              </Text>
            </View>
          </View>
        </View>

        {/* Countdown Timer */}
        {mockChallenge.status === "open" && timeUntilStart > 0 && (
          <View style={styles.countdownSection}>
            <Text style={styles.countdownLabel}>Challenge starts in:</Text>
            <Text style={styles.countdownTimer}>
              {formatCountdown(timeUntilStart)}
            </Text>
          </View>
        )}

        {/* Prizes Section */}
        <View style={styles.prizesSection}>
          <Text style={styles.sectionTitle}>🏆 Prizes</Text>
          <View style={styles.prizesGrid}>
            {mockChallenge.prizes.map((prize, index) => (
              <View key={prize.rank} style={styles.prizeCard}>
                <Text style={styles.prizeBadge}>{prize.badge}</Text>
                <Text style={styles.prizeRank}>#{prize.rank}</Text>
                <Text style={styles.prizeDescription}>{prize.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rules Section */}
        <View style={styles.rulesSection}>
          <Text style={styles.sectionTitle}>📋 Rules</Text>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.ruleText}>Single attempt only</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.ruleText}>Questions are shuffled</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.ruleText}>Anti-cheating measures active</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.ruleText}>Live leaderboard updates</Text>
            </View>
          </View>
        </View>

        {/* Leaderboard */}
        {mockChallenge.status === "completed" && (
          <View style={styles.leaderboardSection}>
            <Text style={styles.sectionTitle}>🏅 Final Results</Text>
            <View style={styles.leaderboard}>
              {mockChallenge.winners.map((winner, index) => (
                <LeaderboardItem
                  key={winner.userId}
                  winner={winner}
                  index={index}
                />
              ))}
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {mockChallenge.analytics.totalParticipants}
                </Text>
                <Text style={styles.statLabel}>Participants</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {mockChallenge.analytics.completionRate}%
                </Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {mockChallenge.analytics.averageScore}%
                </Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom + 20, 40) },
        ]}
      >
        {mockChallenge.status === "open" && !isRegistered && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleJoinChallenge}
          >
            <Text style={styles.primaryButtonText}>Join Challenge</Text>
          </TouchableOpacity>
        )}

        {mockChallenge.status === "open" && isRegistered && (
          <View style={styles.registeredContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.registeredText}>You&apos;re registered!</Text>
          </View>
        )}

        {mockChallenge.status === "active" && isRegistered && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartChallenge}
          >
            <Text style={styles.primaryButtonText}>Start Challenge</Text>
          </TouchableOpacity>
        )}

        {mockChallenge.status === "completed" && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Back to Challenges</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  // Header
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  // Challenge Info
  challengeInfo: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 20,
  },
  challengeDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: "45%",
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  // Countdown
  countdownSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  countdownLabel: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  countdownTimer: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F59E0B",
    fontFamily: "monospace",
  },
  // Sections
  prizesSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  rulesSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  leaderboardSection: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  // Prizes
  prizesGrid: {
    flexDirection: "row",
    gap: 12,
  },
  prizeCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  prizeBadge: {
    fontSize: 32,
    marginBottom: 8,
  },
  prizeRank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  prizeDescription: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  // Rules
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  ruleText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  // Leaderboard
  leaderboard: {
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  goldRank: {
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  silverRank: {
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#9CA3AF",
  },
  bronzeRank: {
    backgroundColor: "#FED7AA",
    borderWidth: 2,
    borderColor: "#FB923C",
  },
  defaultRank: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rankContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  rankBadge: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6B7280",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  playerScore: {
    fontSize: 14,
    color: "#6B7280",
  },
  prizeInfo: {
    alignItems: "flex-end",
  },
  prizePoints: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  prizeLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  // Stats
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  // Footer
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "600",
  },
  registeredContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  registeredText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
});
