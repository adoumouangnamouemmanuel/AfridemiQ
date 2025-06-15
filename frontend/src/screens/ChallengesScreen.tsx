"use client";

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock data based on Challenge model
const mockChallenges = [
  {
    id: "1",
    title: "Mathematics Championship",
    description: "Weekly mathematics competition for Terminale students",
    difficulty: "hard",
    level: "terminale",
    subjectId: "math",
    topicId: "algebra",
    timeLimit: 45,
    maxParticipants: 100,
    participants: Array.from({ length: 78 }, (_, i) => `user_${i + 1}`),
    questionIds: Array.from({ length: 15 }, (_, i) => `q_${i + 1}`),
    scheduling: {
      startDate: new Date("2024-01-25T14:00:00Z"),
      endDate: new Date("2024-01-25T15:00:00Z"),
      registrationDeadline: new Date("2024-01-25T13:30:00Z"),
    },
    prizes: [
      { rank: 1, description: "Gold Medal", points: 500, badge: "🥇" },
      { rank: 2, description: "Silver Medal", points: 300, badge: "🥈" },
      { rank: 3, description: "Bronze Medal", points: 200, badge: "🥉" },
    ],
    status: "open",
    analytics: {
      totalParticipants: 78,
      completionRate: 0,
      averageScore: 0,
      averageTimeSpent: 0,
    },
    tags: ["mathematics", "algebra", "competition"],
    premiumOnly: false,
  },
  {
    id: "2",
    title: "Physics Challenge",
    description: "Test your physics knowledge in mechanics and thermodynamics",
    difficulty: "medium",
    level: "premiere",
    subjectId: "physics",
    topicId: "mechanics",
    timeLimit: 30,
    maxParticipants: 75,
    participants: Array.from({ length: 45 }, (_, i) => `user_${i + 100}`),
    questionIds: Array.from({ length: 12 }, (_, i) => `q_${i + 20}`),
    scheduling: {
      startDate: new Date("2024-01-26T10:00:00Z"),
      endDate: new Date("2024-01-26T10:45:00Z"),
      registrationDeadline: new Date("2024-01-26T09:30:00Z"),
    },
    prizes: [
      {
        rank: 1,
        description: "Physics Master Badge",
        points: 400,
        badge: "⚡",
      },
      {
        rank: 2,
        description: "Physics Expert Badge",
        points: 250,
        badge: "🔬",
      },
      {
        rank: 3,
        description: "Physics Scholar Badge",
        points: 150,
        badge: "📐",
      },
    ],
    status: "active",
    analytics: {
      totalParticipants: 45,
      completionRate: 67,
      averageScore: 73,
      averageTimeSpent: 1680,
    },
    tags: ["physics", "mechanics", "science"],
    premiumOnly: false,
  },
  {
    id: "3",
    title: "Chemistry Lab Challenge",
    description:
      "Advanced chemistry challenge covering organic and inorganic chemistry",
    difficulty: "hard",
    level: "terminale",
    subjectId: "chemistry",
    topicId: "organic",
    timeLimit: 60,
    maxParticipants: 50,
    participants: Array.from({ length: 32 }, (_, i) => `user_${i + 200}`),
    questionIds: Array.from({ length: 20 }, (_, i) => `q_${i + 40}`),
    scheduling: {
      startDate: new Date("2024-01-24T16:00:00Z"),
      endDate: new Date("2024-01-24T17:00:00Z"),
      registrationDeadline: new Date("2024-01-24T15:30:00Z"),
    },
    prizes: [
      { rank: 1, description: "Chemistry Genius", points: 600, badge: "🧪" },
      { rank: 2, description: "Lab Expert", points: 400, badge: "⚗️" },
      { rank: 3, description: "Molecule Master", points: 250, badge: "🔬" },
    ],
    status: "completed",
    winners: [
      {
        userId: "user_205",
        rank: 1,
        score: 95,
        timeSpent: 3200,
        completedAt: new Date(),
      },
      {
        userId: "user_212",
        rank: 2,
        score: 89,
        timeSpent: 3450,
        completedAt: new Date(),
      },
      {
        userId: "user_201",
        rank: 3,
        score: 85,
        timeSpent: 3600,
        completedAt: new Date(),
      },
    ],
    analytics: {
      totalParticipants: 32,
      completionRate: 94,
      averageScore: 76,
      averageTimeSpent: 3240,
    },
    tags: ["chemistry", "organic", "lab"],
    premiumOnly: true,
  },
];

interface ChallengeCardProps {
  challenge: (typeof mockChallenges)[0];
  onPress: () => void;
}

function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#10B981";
      case "active":
        return "#F59E0B";
      case "completed":
        return "#6366F1";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return "checkmark-circle";
      case "active":
        return "play-circle";
      case "completed":
        return "trophy";
      default:
        return "time";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "hard":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const formatTimeRemaining = () => {
    const now = new Date();
    const startTime = new Date(challenge.scheduling.startDate);
    const endTime = new Date(challenge.scheduling.endDate);

    if (challenge.status === "completed") {
      return "Completed";
    }

    if (challenge.status === "active") {
      const remaining = Math.max(
        0,
        Math.floor((endTime.getTime() - now.getTime()) / 1000)
      );
      const minutes = Math.floor(remaining / 60);
      return `${minutes}m remaining`;
    }

    if (challenge.status === "open") {
      const remaining = Math.max(
        0,
        Math.floor((startTime.getTime() - now.getTime()) / 1000)
      );
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      return `Starts in ${hours}h ${minutes}m`;
    }

    return "Coming soon";
  };

  return (
    <TouchableOpacity style={styles.challengeCard} onPress={onPress}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeStatus}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(challenge.status) + "20" },
            ]}
          >
            <Ionicons
              name={getStatusIcon(challenge.status) as any}
              size={14}
              color={getStatusColor(challenge.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(challenge.status) },
              ]}
            >
              {challenge.status.charAt(0).toUpperCase() +
                challenge.status.slice(1)}
            </Text>
          </View>
          {challenge.premiumOnly && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={12} color="#F59E0B" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
        <Text style={styles.timeRemaining}>{formatTimeRemaining()}</Text>
      </View>

      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      <Text style={styles.challengeDescription}>{challenge.description}</Text>

      <View style={styles.challengeDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{challenge.timeLimit}min</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {challenge.questionIds.length} questions
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {challenge.participants.length}/{challenge.maxParticipants}
            </Text>
          </View>
          <View
            style={[
              styles.difficultyBadge,
              {
                backgroundColor:
                  getDifficultyColor(challenge.difficulty) + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: getDifficultyColor(challenge.difficulty) },
              ]}
            >
              {challenge.difficulty}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.challengeFooter}>
        <View style={styles.participantsBar}>
          <View
            style={[
              styles.participantsFill,
              {
                width: `${
                  (challenge.participants.length / challenge.maxParticipants) *
                  100
                }%`,
              },
            ]}
          />
        </View>
        <View style={styles.prizeInfo}>
          <Text style={styles.prizeText}>
            {challenge.prizes[0]?.badge} {challenge.prizes[0]?.points} pts
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface FilterTabsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

function FilterTabs({ selectedFilter, onFilterChange }: FilterTabsProps) {
  const filters = [
    { id: "all", label: "All", icon: "grid-outline" },
    { id: "open", label: "Open", icon: "checkmark-circle-outline" },
    { id: "active", label: "Active", icon: "play-circle-outline" },
    { id: "completed", label: "Completed", icon: "trophy-outline" },
  ];

  return (
    <View style={styles.filterTabs}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollView}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterTab,
              selectedFilter === filter.id && styles.activeFilterTab,
            ]}
            onPress={() => onFilterChange(filter.id)}
          >
            <Ionicons
              name={filter.icon as any}
              size={16}
              color={selectedFilter === filter.id ? "white" : "#6B7280"}
            />
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === filter.id && styles.activeFilterTabText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function ChallengesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const filteredChallenges = mockChallenges.filter((challenge) => {
    if (selectedFilter === "all") return true;
    return challenge.status === selectedFilter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleChallengePress = (challengeId: string) => {
    router.push({
      pathname: "/(routes)/assessments/challenge",
      params: { id: challengeId },
    });
  };

  const getStatsForFilter = () => {
    const openCount = mockChallenges.filter((c) => c.status === "open").length;
    const activeCount = mockChallenges.filter(
      (c) => c.status === "active"
    ).length;
    const completedCount = mockChallenges.filter(
      (c) => c.status === "completed"
    ).length;

    return { openCount, activeCount, completedCount };
  };

  const stats = getStatsForFilter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenges</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.openCount}</Text>
          <Text style={styles.statLabel}>Open</Text>
          <View
            style={[styles.statIndicator, { backgroundColor: "#10B981" }]}
          />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
          <View
            style={[styles.statIndicator, { backgroundColor: "#F59E0B" }]}
          />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
          <View
            style={[styles.statIndicator, { backgroundColor: "#6366F1" }]}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <FilterTabs
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      {/* Challenges List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.challengesList}>
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onPress={() => handleChallengePress(challenge.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No challenges found</Text>
              <Text style={styles.emptyStateDescription}>
                {selectedFilter === "all"
                  ? "Check back later for new challenges"
                  : `No ${selectedFilter} challenges at the moment`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  // Stats
  statsContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  statCard: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  statIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  // Filter Tabs
  filterTabs: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterScrollView: {
    paddingHorizontal: 20,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  activeFilterTab: {
    backgroundColor: "#3B82F6",
  },
  filterTabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeFilterTabText: {
    color: "white",
  },
  // Challenges List
  challengesList: {
    padding: 20,
  },
  challengeCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  challengeStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
  },
  premiumText: {
    marginLeft: 2,
    fontSize: 10,
    fontWeight: "600",
    color: "#F59E0B",
  },
  timeRemaining: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  challengeDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantsBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginRight: 12,
    overflow: "hidden",
  },
  participantsFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  prizeInfo: {
    alignItems: "flex-end",
  },
  prizeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
