"use client";

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import { useTheme } from "../utils/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Quick link cards data
const QUICK_LINKS = [
  {
    id: "subjects",
    title: "Subjects",
    subtitle: "12 subjects",
    icon: "library",
    color: "#667eea",
    gradient: ["#667eea", "#764ba2"],
    route: "/(routes)/learning/subjects",
  },
  {
    id: "notes",
    title: "Notes",
    subtitle: "45 notes",
    icon: "document-text",
    color: "#4ECDC4",
    gradient: ["#4ECDC4", "#44A08D"],
    route: "/(routes)/learning/notes",
  },
  {
    id: "videos",
    title: "Videos",
    subtitle: "28 videos",
    icon: "play-circle",
    color: "#FF6B6B",
    gradient: ["#FF6B6B", "#FF8E53"],
    route: "/(routes)/learning/videos",
  },
  {
    id: "past-papers",
    title: "Past Papers",
    subtitle: "15 papers",
    icon: "document",
    color: "#45B7D1",
    gradient: ["#45B7D1", "#96C93D"],
    route: "/(routes)/learning/past-papers",
  },
  {
    id: "resources",
    title: "Resources",
    subtitle: "32 resources",
    icon: "folder",
    color: "#96CEB4",
    gradient: ["#96CEB4", "#FFECD2"],
    route: "/(routes)/learning/resources",
  },
  {
    id: "bookmarks",
    title: "Bookmarks",
    subtitle: "8 saved",
    icon: "bookmark",
    color: "#FECA57",
    gradient: ["#FECA57", "#FF9FF3"],
    route: "/(routes)/learning/bookmarks",
  },
  {
    id: "curriculum",
    title: "Curriculum",
    subtitle: "View syllabus",
    icon: "school",
    color: "#A8E6CF",
    gradient: ["#A8E6CF", "#88D8C0"],
    route: "/(routes)/learning/curriculum",
  },
  {
    id: "tools",
    title: "Tools",
    subtitle: "Interactive",
    icon: "construct",
    color: "#FFB6C1",
    gradient: ["#FFB6C1", "#FFA07A"],
    route: "/(routes)/learning/interactive-tools",
  },
];

// Recent activity data
const RECENT_ACTIVITIES = [
  {
    id: "1",
    type: "lesson",
    title: "Quadratic Equations",
    subject: "Mathematics",
    time: "2 hours ago",
    icon: "calculator",
    color: "#667eea",
  },
  {
    id: "2",
    type: "note",
    title: "Physics Laws Summary",
    subject: "Physics",
    time: "5 hours ago",
    icon: "document-text",
    color: "#4ECDC4",
  },
  {
    id: "3",
    type: "video",
    title: "Cell Division Process",
    subject: "Biology",
    time: "1 day ago",
    icon: "play-circle",
    color: "#FF6B6B",
  },
];

export default function StudyScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleQuickLinkPress = (route: string) => {
    // TODO: Connect to actual navigation
    router.push(route as any);
  };

  const handleActivityPress = (activity: any) => {
    // TODO: Navigate to specific activity
    router.push(
      `/activity/${activity.type}/${activity.id}` as any);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // Fixed Header
    header: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
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
    headerActions: {
      flexDirection: "row",
      gap: 12,
    },
    headerActionButton: {
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
      paddingVertical: 2,
      marginBottom: 10,
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
    // Scrollable Content
    scrollContent: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: 20,
    },
    section: {
      marginHorizontal: 24,
      marginTop: 24,
    },
    // Quick Stats
    statsCard: {
      borderRadius: 16,
      padding: 24,
      marginBottom: 8,
    },
    statsTitle: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
      fontFamily: "Inter-SemiBold",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      color: "white",
      fontSize: 24,
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
    statLabel: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginTop: 4,
    },
    // Section Headers
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    viewAllButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
    },
    viewAllText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    // Quick Links Grid
    quickLinksGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    quickLinkCard: {
      width: (SCREEN_WIDTH - 60) / 2,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      minHeight: 120,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    quickLinkIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    quickLinkTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
      fontFamily: "Inter-SemiBold",
    },
    quickLinkSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontFamily: "Inter-Regular",
    },
    // Recent Activity
    activityCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    activityItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    activityIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
      fontFamily: "Inter-SemiBold",
    },
    activitySubtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontFamily: "Inter-Regular",
    },
    // Study Streak
    streakCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    streakHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    streakTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    streakBadge: {
      backgroundColor: "#FFF3CD",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    streakBadgeText: {
      color: "#856404",
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    streakDays: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    streakDay: {
      alignItems: "center",
    },
    streakDayCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    streakDayActive: {
      backgroundColor: "#10B981",
    },
    streakDayInactive: {
      backgroundColor: theme.colors.border,
    },
    streakDayText: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    streakDayTextActive: {
      color: "white",
    },
    streakDayTextInactive: {
      color: theme.colors.textSecondary,
    },
    streakMessage: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      fontFamily: "Inter-Regular",
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Study Hub</Text>
            <Text style={styles.headerSubtitle}>Your learning dashboard</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
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
            placeholder="Search subjects, notes, videos..."
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
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            <Text style={styles.statsTitle}>Today&apos;s Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>Lessons</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2h</Text>
                <Text style={styles.statLabel}>Study Time</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>85%</Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Links Grid */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
          </View>
          <View style={styles.quickLinksGrid}>
            {QUICK_LINKS.map((link, index) => (
              <Animated.View
                key={link.id}
                entering={SlideInUp.delay(300 + index * 50)}
              >
                <TouchableOpacity
                  style={styles.quickLinkCard}
                  onPress={() => handleQuickLinkPress(link.route)}
                >
                  <LinearGradient
                    colors={link.gradient as [string, string]}
                    style={styles.quickLinkIcon}
                  >
                    <Ionicons name={link.icon as any} size={24} color="white" />
                  </LinearGradient>
                  <Text style={styles.quickLinkTitle}>{link.title}</Text>
                  <Text style={styles.quickLinkSubtitle}>{link.subtitle}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeIn.delay(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("/(routes)/learning/recent-activities")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityCard}>
            {RECENT_ACTIVITIES.map((activity, index) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityItem,
                  index !== RECENT_ACTIVITIES.length - 1 &&
                    styles.activityItemBorder,
                ]}
                onPress={() => handleActivityPress(activity)}
              >
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
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>
                    {activity.subject} • {activity.time}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Study Streak */}
        <Animated.View entering={FadeIn.delay(500)} style={styles.section}>
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Text style={styles.streakTitle}>Study Streak</Text>
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>🔥 12 days</Text>
              </View>
            </View>

            <View style={styles.streakDays}>
              {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day, index) => (
                <View key={day} style={styles.streakDay}>
                  <View
                    style={[
                      styles.streakDayCircle,
                      index < 5
                        ? styles.streakDayActive
                        : styles.streakDayInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.streakDayText,
                        index < 5
                          ? styles.streakDayTextActive
                          : styles.streakDayTextInactive,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.streakMessage}>
              Keep it up! You&apos;re doing great this week.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
