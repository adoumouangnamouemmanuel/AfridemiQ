"use client";

import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "../utils/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Mock videos data
const mockVideos = [
  {
    id: "math-quadratic-1",
    title: "Quadratic Equations - Complete Tutorial",
    subject: "Mathematics",
    topic: "Algebra",
    instructor: "Dr. Sarah Johnson",
    duration: "45:30",
    views: 125000,
    rating: 4.8,
    thumbnail: "/placeholder.svg?height=200&width=300",
    difficulty: "Medium",
    tags: ["Equations", "Algebra", "Problem Solving"],
    uploadDate: "2 days ago",
    isBookmarked: true,
    isWatched: false,
    watchProgress: 0,
    description:
      "Master quadratic equations with step-by-step explanations and practice problems.",
  },
  {
    id: "physics-motion-1",
    title: "Newton's Laws of Motion Explained",
    subject: "Physics",
    topic: "Mechanics",
    instructor: "Prof. Michael Chen",
    duration: "38:15",
    views: 89000,
    rating: 4.9,
    thumbnail: "/placeholder.svg?height=200&width=300",
    difficulty: "Easy",
    tags: ["Newton", "Motion", "Forces"],
    uploadDate: "5 days ago",
    isBookmarked: false,
    isWatched: true,
    watchProgress: 100,
    description:
      "Understanding the fundamental laws that govern motion in our universe.",
  },
  {
    id: "chemistry-organic-1",
    title: "Organic Chemistry Reactions",
    subject: "Chemistry",
    topic: "Organic Chemistry",
    instructor: "Dr. Emily Rodriguez",
    duration: "52:20",
    views: 67000,
    rating: 4.7,
    thumbnail: "/placeholder.svg?height=200&width=300",
    difficulty: "Hard",
    tags: ["Organic", "Reactions", "Mechanisms"],
    uploadDate: "1 week ago",
    isBookmarked: true,
    isWatched: false,
    watchProgress: 35,
    description:
      "Deep dive into organic reaction mechanisms and synthesis strategies.",
  },
  {
    id: "biology-genetics-1",
    title: "DNA Structure and Replication",
    subject: "Biology",
    topic: "Genetics",
    instructor: "Dr. James Wilson",
    duration: "41:45",
    views: 156000,
    rating: 4.6,
    thumbnail: "/placeholder.svg?height=200&width=300",
    difficulty: "Medium",
    tags: ["DNA", "Genetics", "Molecular Biology"],
    uploadDate: "3 days ago",
    isBookmarked: false,
    isWatched: false,
    watchProgress: 0,
    description:
      "Explore the structure of DNA and how it replicates in living cells.",
  },
  {
    id: "math-calculus-1",
    title: "Introduction to Limits and Continuity",
    subject: "Mathematics",
    topic: "Calculus",
    instructor: "Prof. Lisa Anderson",
    duration: "49:10",
    views: 203000,
    rating: 4.9,
    thumbnail: "/placeholder.svg?height=200&width=300",
    difficulty: "Hard",
    tags: ["Limits", "Calculus", "Advanced"],
    uploadDate: "4 days ago",
    isBookmarked: true,
    isWatched: false,
    watchProgress: 15,
    description:
      "Master the fundamental concepts of limits and continuity in calculus.",
  },
];

const SUBJECT_FILTERS = [
  { id: "all", label: "All Subjects", icon: "apps" },
  { id: "Mathematics", label: "Math", icon: "calculator" },
  { id: "Physics", label: "Physics", icon: "planet" },
  { id: "Chemistry", label: "Chemistry", icon: "flask" },
  { id: "Biology", label: "Biology", icon: "leaf" },
];

const DIFFICULTY_FILTERS = [
  { id: "all", label: "All Levels" },
  { id: "Easy", label: "Easy" },
  { id: "Medium", label: "Medium" },
  { id: "Hard", label: "Hard" },
];

export default function VideosScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const filteredVideos = useMemo(() => {
    let filtered = mockVideos;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Subject filter
    if (selectedSubject !== "all") {
      filtered = filtered.filter((video) => video.subject === selectedSubject);
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(
        (video) => video.difficulty === selectedDifficulty
      );
    }

    // Sort by views (most popular first)
    return filtered.sort((a, b) => b.views - a.views);
  }, [searchQuery, selectedSubject, selectedDifficulty]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "#4CAF50";
      case "Medium":
        return "#FF9800";
      case "Hard":
        return "#F44336";
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
    },
    headerGradient: {
      borderRadius: 16,
      padding: 16,
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    backButton: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 10,
      padding: 8,
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: "white",
      fontFamily: "Inter-ExtraBold",
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 14,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Inter-Medium",
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 10,
      padding: 8,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: 14,
      fontFamily: "Inter-Regular",
    },
    clearButton: {
      padding: 4,
    },
    filtersContainer: {
      marginBottom: 20,
    },
    filterSection: {
      marginBottom: 12,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    subjectFilters: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    filterButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    filterIcon: {
      marginRight: 6,
    },
    filterText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    filterTextActive: {
      color: "white",
    },
    difficultyFilters: {
      flexDirection: "row",
      gap: 8,
    },
    difficultyButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    difficultyButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    difficultyTextActive: {
      color: "white",
    },
    controlsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    resultsCount: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    rightControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    sortText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginRight: 4,
      fontFamily: "Inter-Medium",
    },
    viewToggle: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    viewButton: {
      padding: 6,
      borderRadius: 6,
    },
    viewButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    // Grid view styles
    videoCardGrid: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 3,
      width: (SCREEN_WIDTH - 52) / 2,
    },
    videoThumbnail: {
      width: "100%",
      height: 120,
      backgroundColor: theme.colors.border,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    playButton: {
      position: "absolute",
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 20,
      padding: 8,
    },
    durationBadge: {
      position: "absolute",
      bottom: 8,
      right: 8,
      backgroundColor: "rgba(0,0,0,0.8)",
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    durationText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    bookmarkButton: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 12,
      padding: 4,
    },
    progressBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: "rgba(255,255,255,0.3)",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.colors.primary,
    },
    videoCardContent: {
      padding: 12,
    },
    videoTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      marginBottom: 6,
      lineHeight: 18,
    },
    videoInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    },
    subjectBadge: {
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    subjectText: {
      fontSize: 10,
      fontWeight: "600",
      color: theme.colors.primary,
      fontFamily: "Inter-SemiBold",
    },
    difficultyBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    difficultyTextSmall: {
      fontSize: 10,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    instructor: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
      marginBottom: 6,
    },
    videoStats: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginLeft: 2,
    },
    rating: {
      flexDirection: "row",
      alignItems: "center",
    },
    ratingText: {
      fontSize: 11,
      color: "#FFD700",
      fontFamily: "Inter-SemiBold",
      marginLeft: 2,
    },
    // List view styles
    videoCardList: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 3,
      flexDirection: "row",
    },
    videoThumbnailList: {
      width: 120,
      height: 80,
      backgroundColor: theme.colors.border,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      position: "relative",
    },
    videoContentList: {
      flex: 1,
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
      color: theme.colors.text,
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      fontFamily: "Inter-Regular",
      paddingHorizontal: 40,
    },
  });

  const renderVideoCardGrid = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => (
    <Animated.View entering={SlideInRight.delay(index * 100)}>
      <TouchableOpacity
        style={styles.videoCardGrid}
        onPress={() => router.push(`/(routes)/video/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.videoThumbnail}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color="white" />
          </View>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Ionicons
              name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={14}
              color={item.isBookmarked ? "#FFD700" : "white"}
            />
          </TouchableOpacity>
          {item.watchProgress > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${item.watchProgress}%` },
                ]}
              />
            </View>
          )}
        </View>

        <View style={styles.videoCardContent}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.videoInfo}>
            <View style={styles.subjectBadge}>
              <Text style={styles.subjectText}>{item.subject}</Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(item.difficulty) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.difficultyTextSmall,
                  { color: getDifficultyColor(item.difficulty) },
                ]}
              >
                {item.difficulty}
              </Text>
            </View>
          </View>

          <Text style={styles.instructor} numberOfLines={1}>
            {item.instructor}
          </Text>

          <View style={styles.videoStats}>
            <View style={styles.statItem}>
              <Ionicons
                name="eye"
                size={12}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.statText}>{formatViews(item.views)}</Text>
            </View>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderVideoCardList = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => (
    <Animated.View entering={SlideInRight.delay(index * 100)}>
      <TouchableOpacity
        style={styles.videoCardList}
        onPress={() => router.push(`/(routes)/video/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.videoThumbnailList}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={16} color="white" />
          </View>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
          {item.watchProgress > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${item.watchProgress}%` },
                ]}
              />
            </View>
          )}
        </View>

        <View style={styles.videoContentList}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.videoInfo}>
            <View style={styles.subjectBadge}>
              <Text style={styles.subjectText}>{item.subject}</Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(item.difficulty) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.difficultyTextSmall,
                  { color: getDifficultyColor(item.difficulty) },
                ]}
              >
                {item.difficulty}
              </Text>
            </View>
          </View>

          <Text style={styles.instructor} numberOfLines={1}>
            {item.instructor}
          </Text>

          <View style={styles.videoStats}>
            <View style={styles.statItem}>
              <Ionicons
                name="eye"
                size={12}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.statText}>{formatViews(item.views)}</Text>
            </View>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons
                name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={16}
                color={
                  item.isBookmarked ? "#FFD700" : theme.colors.textSecondary
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={isDark ? ["#667eea", "#764ba2"] : ["#4facfe", "#00f2fe"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.title}>Video Lectures</Text>
                <Text style={styles.subtitle}>Expert-taught video content</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="bookmark" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {/* Search */}
        <Animated.View entering={FadeIn.delay(100)}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={18}
              color={theme.colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search videos..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery("")}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Filters */}
        <Animated.View entering={FadeIn.delay(150)}>
          <View style={styles.filtersContainer}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Subject</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.subjectFilters}
              >
                {SUBJECT_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterButton,
                      selectedSubject === filter.id &&
                        styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedSubject(filter.id)}
                  >
                    <Ionicons
                      name={filter.icon as any}
                      size={14}
                      color={
                        selectedSubject === filter.id
                          ? "white"
                          : theme.colors.textSecondary
                      }
                      style={styles.filterIcon}
                    />
                    <Text
                      style={[
                        styles.filterText,
                        selectedSubject === filter.id &&
                          styles.filterTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Difficulty</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.difficultyFilters}
              >
                {DIFFICULTY_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.difficultyButton,
                      selectedDifficulty === filter.id &&
                        styles.difficultyButtonActive,
                    ]}
                    onPress={() => setSelectedDifficulty(filter.id)}
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        selectedDifficulty === filter.id &&
                          styles.difficultyTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Animated.View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <Text style={styles.resultsCount}>
            {filteredVideos.length} Videos
          </Text>
          <View style={styles.rightControls}>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortText}>Popular</Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === "list" && styles.viewButtonActive,
                ]}
                onPress={() => setViewMode("list")}
              >
                <Ionicons
                  name="list"
                  size={16}
                  color={
                    viewMode === "list" ? "white" : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === "grid" && styles.viewButtonActive,
                ]}
                onPress={() => setViewMode("grid")}
              >
                <Ionicons
                  name="grid"
                  size={16}
                  color={
                    viewMode === "grid" ? "white" : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Videos List */}
        {filteredVideos.length === 0 ? (
          <Animated.View entering={FadeIn.delay(300)}>
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons
                  name="play-circle-outline"
                  size={64}
                  color={theme.colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyStateTitle}>No videos found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search terms or filters to find the videos
                you&apos;re looking for.
              </Text>
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={filteredVideos}
            renderItem={
              viewMode === "grid" ? renderVideoCardGrid : renderVideoCardList
            }
            keyExtractor={(item) => item.id}
            numColumns={viewMode === "grid" ? 2 : 1}
            key={viewMode} // Force re-render when view mode changes
            columnWrapperStyle={
              viewMode === "grid"
                ? { justifyContent: "space-between" }
                : undefined
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}