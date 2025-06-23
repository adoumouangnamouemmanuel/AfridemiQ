"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";

// Mock recent activities data
const MOCK_ACTIVITIES = [
  {
    _id: "activity_001",
    type: "lesson_completed",
    title: "Completed: Introduction to Algebraic Expressions",
    description:
      "You successfully completed the base lesson on algebraic expressions with 85% score.",
    subjectName: "Mathematics",
    topicName: "Algebra Basics",
    icon: "checkmark-circle",
    color: "#10B981",
    metadata: {
      score: 85,
      duration: 15,
      contentId: "lesson_001",
      contentType: "lesson",
    },
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    _id: "activity_002",
    type: "note_created",
    title: "Created: Variables and Coefficients Summary",
    description:
      "You created a new note summarizing key concepts from today's algebra lesson.",
    subjectName: "Mathematics",
    topicName: "Algebra Basics",
    icon: "document-text",
    color: "#3B82F6",
    metadata: {
      wordCount: 65,
      contentId: "note_001",
      contentType: "note",
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    _id: "activity_003",
    type: "video_watched",
    title: "Watched: Distributive Property Explained",
    description:
      "You watched 12 minutes of the distributive property video tutorial.",
    subjectName: "Mathematics",
    topicName: "Algebra Basics",
    icon: "play-circle",
    color: "#EF4444",
    metadata: {
      watchTime: 12,
      totalDuration: 15,
      progress: 80,
      contentId: "video_001",
      contentType: "video",
    },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    _id: "activity_004",
    type: "quiz_attempted",
    title: "Attempted: Algebra Practice Quiz",
    description:
      "You scored 78% on the algebra practice quiz. Consider reviewing distributive property.",
    subjectName: "Mathematics",
    topicName: "Algebra Basics",
    icon: "help-circle",
    color: "#F59E0B",
    metadata: {
      score: 78,
      totalQuestions: 25,
      correctAnswers: 19,
      contentId: "quiz_001",
      contentType: "quiz",
    },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    _id: "activity_005",
    type: "resource_downloaded",
    title: "Downloaded: Algebra Reference Sheet",
    description:
      "You downloaded the comprehensive algebra reference sheet for offline study.",
    subjectName: "Mathematics",
    topicName: "Algebra Basics",
    icon: "download",
    color: "#8B5CF6",
    metadata: {
      fileSize: 2500000,
      fileType: "PDF",
      contentId: "resource_001",
      contentType: "resource",
    },
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    _id: "activity_006",
    type: "bookmark_added",
    title: "Bookmarked: Triangle Properties Quick Reference",
    description:
      "You bookmarked the triangle properties reference for quick access during study sessions.",
    subjectName: "Mathematics",
    topicName: "Geometry",
    icon: "bookmark",
    color: "#06B6D4",
    metadata: {
      priority: 4,
      contentId: "note_003",
      contentType: "note",
    },
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    _id: "activity_007",
    type: "study_streak",
    title: "Study Streak: 7 Days!",
    description:
      "Congratulations! You've maintained your study streak for 7 consecutive days.",
    subjectName: "General",
    topicName: "Achievement",
    icon: "flame",
    color: "#F97316",
    metadata: {
      streakDays: 7,
      totalStudyTime: 420, // 7 hours
    },
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
];

export default function RecentActivitiesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  const filteredActivities = MOCK_ACTIVITIES.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.subjectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" || activity.type.includes(selectedFilter);

    return matchesSearch && matchesFilter;
  });

  const handleActivityPress = (activity: (typeof MOCK_ACTIVITIES)[0]) => {
    // Navigate based on content type
    if (activity.metadata.contentId && activity.metadata.contentType) {
      switch (activity.metadata.contentType) {
        case "lesson":
          router.push(
            `/(routes)/learning/lessons/base-lesson?lessonId=${activity.metadata.contentId}`
          );
          break;
        case "video":
          router.push(
            `/(routes)/learning/video-player?videoId=${activity.metadata.contentId}`
          );
          break;
        case "note":
          console.log(`Navigate to note: ${activity.metadata.contentId}`);
          break;
        case "quiz":
          console.log(`Navigate to quiz: ${activity.metadata.contentId}`);
          break;
        case "resource":
          console.log(`Navigate to resource: ${activity.metadata.contentId}`);
          break;
        default:
          console.log(
            `Navigate to ${activity.metadata.contentType}: ${activity.metadata.contentId}`
          );
      }
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderActivityCard = ({
    item: activity,
  }: {
    item: (typeof MOCK_ACTIVITIES)[0];
  }) => {
    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <TouchableOpacity
          style={styles.activityCard}
          onPress={() => handleActivityPress(activity)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={styles.activityCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.activityHeader}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: activity.color + "20" },
                ]}
              >
                <Ionicons
                  name={activity.icon as any}
                  size={20}
                  color={activity.color}
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription} numberOfLines={2}>
                  {activity.description}
                </Text>
              </View>
              <Text style={styles.timeAgo}>
                {getTimeAgo(activity.timestamp)}
              </Text>
            </View>

            <View style={styles.activityMeta}>
              <View style={styles.subjectInfo}>
                <Ionicons name="book" size={14} color="#64748B" />
                <Text style={styles.subjectText}>{activity.subjectName}</Text>
                {activity.topicName !== "Achievement" &&
                  activity.topicName !== "General" && (
                    <>
                      <Ionicons
                        name="chevron-forward"
                        size={12}
                        color="#9CA3AF"
                      />
                      <Text style={styles.topicText}>{activity.topicName}</Text>
                    </>
                  )}
              </View>

              {/* Activity-specific metadata */}
              <View style={styles.activityDetails}>
                {activity.type === "lesson_completed" && (
                  <View style={styles.scoreContainer}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.scoreText}>
                      {activity.metadata.score}%
                    </Text>
                  </View>
                )}
                {activity.type === "video_watched" && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${activity.metadata.progress || 0}%`,
                            backgroundColor: activity.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {activity.metadata.progress}%
                    </Text>
                  </View>
                )}
                {activity.type === "quiz_attempted" && (
                  <View style={styles.quizResults}>
                    <Text style={styles.quizScore}>
                      {activity.metadata.correctAnswers}/
                      {activity.metadata.totalQuestions}
                    </Text>
                    <Text style={styles.quizPercentage}>
                      ({activity.metadata.score}%)
                    </Text>
                  </View>
                )}
                {activity.type === "resource_downloaded" && (
                  <View style={styles.fileInfo}>
                    <Ionicons name="document" size={14} color="#64748B" />
                    <Text style={styles.fileSize}>
                      {formatFileSize(activity.metadata.fileSize || 0)}
                    </Text>
                  </View>
                )}
                {activity.type === "study_streak" && (
                  <View style={styles.streakInfo}>
                    <Ionicons name="flame" size={14} color="#F97316" />
                    <Text style={styles.streakText}>
                      {activity.metadata.streakDays} days
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
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
      borderRadius: 12,
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
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    filterButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F8FAFC",
      borderRadius: 50,
      paddingHorizontal: 16,
      paddingVertical: 0,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: "#1E293B",
      fontFamily: "Inter-Regular",
      marginLeft: 8,
    },
    content: {
      flex: 1,
      padding: 0,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    statLabel: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 4,
    },
    activityCard: {
      margin: 20,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    activityCardGradient: {
      padding: 20,
    },
    activityHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    activityInfo: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    activityDescription: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    timeAgo: {
      fontSize: 12,
      color: "#9CA3AF",
      fontFamily: "Inter-Regular",
    },
    activityMeta: {
      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",
      paddingTop: 16,
    },
    subjectInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    subjectText: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Medium",
    },
    topicText: {
      fontSize: 12,
      color: "#9CA3AF",
      fontFamily: "Inter-Regular",
    },
    activityDetails: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    scoreContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#FEF3C7",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    scoreText: {
      fontSize: 12,
      color: "#92400E",
      fontFamily: "Inter-SemiBold",
    },
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    progressBar: {
      width: 60,
      height: 4,
      backgroundColor: "#E2E8F0",
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 2,
    },
    progressText: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Medium",
    },
    quizResults: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#FEF3C7",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    quizScore: {
      fontSize: 12,
      color: "#92400E",
      fontFamily: "Inter-SemiBold",
    },
    quizPercentage: {
      fontSize: 11,
      color: "#A16207",
      fontFamily: "Inter-Regular",
    },
    fileInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#F3E8FF",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    fileSize: {
      fontSize: 12,
      color: "#7C3AED",
      fontFamily: "Inter-Medium",
    },
    streakInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#FED7AA",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    streakText: {
      fontSize: 12,
      color: "#C2410C",
      fontFamily: "Inter-SemiBold",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyStateIcon: {
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: "#64748B",
      textAlign: "center",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
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
            <Text style={styles.title}>Recent Activities</Text>
            <Text style={styles.subtitle}>
              Your learning journey • {filteredActivities.length} activities
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.content}>
        {/* <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{MOCK_ACTIVITIES.length}</Text>
            <Text style={styles.statLabel}>Total Activities</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {
                MOCK_ACTIVITIES.filter((a) => a.type.includes("completed"))
                  .length
              }
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {MOCK_ACTIVITIES.filter((a) => a.type === "study_streak").length}
            </Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {
                MOCK_ACTIVITIES.filter(
                  (a) =>
                    a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length
              }
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View> */}

        {filteredActivities.length > 0 ? (
          <FlatList
            data={filteredActivities}
            renderItem={renderActivityCard}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.emptyState}
          >
            <Ionicons
              name="time-outline"
              size={64}
              color="#E2E8F0"
              style={styles.emptyStateIcon}
            />
            <Text style={styles.emptyStateTitle}>No activities found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Your recent learning activities will appear here"}
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
