"use client";

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { useTheme } from "../../../src/utils/ThemeContext";

// Mock video data
const VIDEOS = [
  {
    id: "1",
    title: "Introduction to Calculus",
    subject: "Mathematics",
    duration: "15:30",
    thumbnail: "/placeholder.svg?height=120&width=200",
    instructor: "Dr. Smith",
    views: "1.2K",
    rating: 4.8,
    isWatched: false,
    progress: 0,
    difficulty: "Intermediate",
  },
  {
    id: "2",
    title: "Photosynthesis Process",
    subject: "Biology",
    duration: "12:45",
    thumbnail: "/placeholder.svg?height=120&width=200",
    instructor: "Prof. Johnson",
    views: "856",
    rating: 4.9,
    isWatched: true,
    progress: 100,
    difficulty: "Beginner",
  },
  {
    id: "3",
    title: "Newton's Laws of Motion",
    subject: "Physics",
    duration: "18:20",
    thumbnail: "/placeholder.svg?height=120&width=200",
    instructor: "Dr. Wilson",
    views: "2.1K",
    rating: 4.7,
    isWatched: false,
    progress: 45,
    difficulty: "Intermediate",
  },
  {
    id: "4",
    title: "Chemical Bonding",
    subject: "Chemistry",
    duration: "20:15",
    thumbnail: "/placeholder.svg?height=120&width=200",
    instructor: "Prof. Davis",
    views: "934",
    rating: 4.6,
    isWatched: false,
    progress: 0,
    difficulty: "Advanced",
  },
];

const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry", "Biology"];

export default function VideosScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const filteredVideos = VIDEOS.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject =
      selectedSubject === "All" || video.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleVideoPress = (videoId: string) => {
    // TODO: Navigate to video player
    router.push(`/(routes)/learning/video-player?id=${videoId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return { backgroundColor: "#D1FAE5", color: "#065F46" };
      case "Intermediate":
        return { backgroundColor: "#FEF3C7", color: "#92400E" };
      case "Advanced":
        return { backgroundColor: "#FEE2E2", color: "#991B1B" };
      default:
        return {
          backgroundColor: theme.colors.border,
          color: theme.colors.textSecondary,
        };
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // Header
    header: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    backButton: {
      marginRight: 16,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text,
      fontFamily: "Inter-ExtraBold",
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontFamily: "Inter-Medium",
    },
    filterButton: {
      width: 40,
      height: 40,
      backgroundColor: theme.colors.primary + "20",
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    // Search Bar
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      borderRadius: 50,
      paddingHorizontal: 16,
      paddingVertical: 0,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      marginLeft: 12,
      color: theme.colors.text,
      fontSize: 16,
      fontFamily: "Inter-Regular",
    },
    clearButton: {
      padding: 4,
    },
    // Subject Filter
    filtersContainer: {
      flexDirection: "row",
    },
    filterChip: {
      marginRight: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary,
    },
    filterChipInactive: {
      backgroundColor: theme.colors.border,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    filterChipTextActive: {
      color: "white",
    },
    filterChipTextInactive: {
      color: theme.colors.text,
    },
    // Videos List
    videosList: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    videoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    // Thumbnail
    thumbnailContainer: {
      position: "relative",
    },
    thumbnail: {
      width: "100%",
      height: 192,
    },
    playOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    playButton: {
      width: 64,
      height: 64,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    duration: {
      position: "absolute",
      bottom: 12,
      right: 12,
      backgroundColor: "rgba(0,0,0,0.7)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    durationText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    progressBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: "rgba(255,255,255,0.3)",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.colors.primary,
    },
    watchedBadge: {
      position: "absolute",
      top: 12,
      left: 12,
      backgroundColor: "#10B981",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    watchedBadgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    // Video Info
    videoInfo: {
      padding: 16,
    },
    videoHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    videoTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
      fontFamily: "Inter-SemiBold",
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    videoSubject: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
    },
    videoMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    videoMetaLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    instructorInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    instructorText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginLeft: 4,
      fontFamily: "Inter-Regular",
    },
    videoMetaRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    metaText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginLeft: 4,
      fontFamily: "Inter-Regular",
    },
    // Empty State
    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
    },
    emptyStateText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      textAlign: "center",
      fontFamily: "Inter-Regular",
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Videos</Text>
              <Text style={styles.headerSubtitle}>
                {VIDEOS.length} educational videos
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Subject Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {SUBJECTS.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[
                styles.filterChip,
                selectedSubject === subject
                  ? styles.filterChipActive
                  : styles.filterChipInactive,
              ]}
              onPress={() => setSelectedSubject(subject)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSubject === subject
                    ? styles.filterChipTextActive
                    : styles.filterChipTextInactive,
                ]}
              >
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Videos List */}
      <ScrollView
        style={styles.videosList}
        showsVerticalScrollIndicator={false}
      >
        {filteredVideos.map((video, index) => (
          <Animated.View
            key={video.id}
            entering={SlideInRight.delay(index * 100)}
          >
            <TouchableOpacity
              style={styles.videoCard}
              onPress={() => handleVideoPress(video.id)}
            >
              {/* Thumbnail */}
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: video.thumbnail }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />

                {/* Play Button Overlay */}
                <View style={styles.playOverlay}>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={24} color="white" />
                  </View>
                </View>

                {/* Duration */}
                <View style={styles.duration}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>

                {/* Progress Bar */}
                {video.progress > 0 && (
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${video.progress}%` },
                      ]}
                    />
                  </View>
                )}

                {/* Watched Badge */}
                {video.isWatched && (
                  <View style={styles.watchedBadge}>
                    <Text style={styles.watchedBadgeText}>Watched</Text>
                  </View>
                )}
              </View>

              {/* Video Info */}
              <View style={styles.videoInfo}>
                <View style={styles.videoHeader}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <View
                    style={[
                      styles.difficultyBadge,
                      getDifficultyColor(video.difficulty),
                    ]}
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(video.difficulty).color },
                      ]}
                    >
                      {video.difficulty}
                    </Text>
                  </View>
                </View>

                <Text style={styles.videoSubject}>{video.subject}</Text>

                <View style={styles.videoMeta}>
                  <View style={styles.instructorInfo}>
                    <Ionicons
                      name="person-circle"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.instructorText}>
                      {video.instructor}
                    </Text>
                  </View>

                  <View style={styles.videoMetaRight}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="eye"
                        size={16}
                        color={theme.colors.textSecondary}
                      />
                      <Text style={styles.metaText}>{video.views}</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={styles.metaText}>{video.rating}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {filteredVideos.length === 0 && (
          <Animated.View entering={FadeIn.delay(300)} style={styles.emptyState}>
            <Ionicons
              name="videocam-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyStateTitle}>No videos found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filter criteria
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
