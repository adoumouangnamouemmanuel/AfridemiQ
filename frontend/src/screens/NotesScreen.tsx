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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "../utils/ThemeContext";

// Mock notes data
const mockNotes = [
  {
    id: "math-algebra-1",
    title: "Quadratic Equations - Complete Guide",
    subject: "Mathematics",
    topic: "Algebra",
    content:
      "Comprehensive notes on quadratic equations including formulas, methods, and examples...",
    lastModified: "2 hours ago",
    size: "2.4 MB",
    pages: 12,
    bookmarked: true,
    downloaded: true,
    tags: ["Important", "Formulas"],
    difficulty: "Medium",
  },
  {
    id: "physics-mechanics-1",
    title: "Laws of Motion - Newton's Laws",
    subject: "Physics",
    topic: "Mechanics",
    content:
      "Detailed explanation of Newton's three laws of motion with real-world applications...",
    lastModified: "1 day ago",
    size: "1.8 MB",
    pages: 8,
    bookmarked: false,
    downloaded: true,
    tags: ["Basics", "Important"],
    difficulty: "Easy",
  },
  {
    id: "chemistry-organic-1",
    title: "Organic Reactions - Mechanisms",
    subject: "Chemistry",
    topic: "Organic Chemistry",
    content: "Step-by-step mechanisms for important organic reactions...",
    lastModified: "3 days ago",
    size: "3.2 MB",
    pages: 18,
    bookmarked: true,
    downloaded: false,
    tags: ["Advanced", "Reactions"],
    difficulty: "Hard",
  },
  {
    id: "biology-genetics-1",
    title: "Genetics and Heredity",
    subject: "Biology",
    topic: "Genetics",
    content:
      "Complete notes on genetics, DNA, RNA, and inheritance patterns...",
    lastModified: "5 days ago",
    size: "2.1 MB",
    pages: 14,
    bookmarked: false,
    downloaded: true,
    tags: ["DNA", "Inheritance"],
    difficulty: "Medium",
  },
  {
    id: "math-calculus-1",
    title: "Differential Calculus - Limits",
    subject: "Mathematics",
    topic: "Calculus",
    content: "Understanding limits, continuity, and differentiation...",
    lastModified: "1 week ago",
    size: "2.8 MB",
    pages: 16,
    bookmarked: true,
    downloaded: true,
    tags: ["Calculus", "Advanced"],
    difficulty: "Hard",
  },
];

const SUBJECT_FILTERS = [
  { id: "all", label: "All Subjects", icon: "apps" },
  { id: "Mathematics", label: "Math", icon: "calculator" },
  { id: "Physics", label: "Physics", icon: "planet" },
  { id: "Chemistry", label: "Chemistry", icon: "flask" },
  { id: "Biology", label: "Biology", icon: "leaf" },
];

const SORT_OPTIONS = [
  { id: "recent", label: "Recently Modified" },
  { id: "alphabetical", label: "Alphabetical" },
  { id: "subject", label: "By Subject" },
  { id: "bookmarked", label: "Bookmarked First" },
];

export default function NotesScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filteredNotes = useMemo(() => {
    let filtered = mockNotes;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Subject filter
    if (selectedSubject !== "all") {
      filtered = filtered.filter((note) => note.subject === selectedSubject);
    }

    // Sort
    switch (selectedSort) {
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "subject":
        filtered.sort((a, b) => a.subject.localeCompare(b.subject));
        break;
      case "bookmarked":
        filtered.sort(
          (a, b) => (b.bookmarked ? 1 : 0) - (a.bookmarked ? 1 : 0)
        );
        break;
      default: // recent
        // Already sorted by recent in mock data
        break;
    }

    return filtered;
  }, [searchQuery, selectedSubject, selectedSort]);

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
    noteCard: {
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
    },
    noteHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    noteTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      flex: 1,
      marginRight: 12,
    },
    noteActions: {
      flexDirection: "row",
      gap: 8,
    },
    noteActionButton: {
      padding: 4,
    },
    noteInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 12,
    },
    subjectBadge: {
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    subjectText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
      fontFamily: "Inter-SemiBold",
    },
    topicText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
    },
    difficultyBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    difficultyText: {
      fontSize: 11,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    noteContent: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      fontFamily: "Inter-Regular",
      marginBottom: 12,
    },
    noteTags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 12,
    },
    tag: {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    tagText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
    },
    noteFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    noteStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginLeft: 4,
    },
    lastModified: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
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

  const renderNoteCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={SlideInRight.delay(index * 100)}>
      <TouchableOpacity
        style={styles.noteCard}
        onPress={() => router.push(`/(routes)/note/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle}>{item.title}</Text>
          <View style={styles.noteActions}>
            <TouchableOpacity style={styles.noteActionButton}>
              <Ionicons
                name={item.bookmarked ? "bookmark" : "bookmark-outline"}
                size={18}
                color={item.bookmarked ? "#FFD700" : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.noteActionButton}>
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.noteInfo}>
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectText}>{item.subject}</Text>
          </View>
          <Text style={styles.topicText}>{item.topic}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) + "20" },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: getDifficultyColor(item.difficulty) },
              ]}
            >
              {item.difficulty}
            </Text>
          </View>
        </View>

        <Text style={styles.noteContent} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.noteTags}>
          {item.tags.map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.noteFooter}>
          <View style={styles.noteStats}>
            <View style={styles.statItem}>
              <Ionicons
                name="document-text"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.statText}>{item.pages} pages</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="folder"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.statText}>{item.size}</Text>
            </View>
            {item.downloaded && (
              <View style={styles.statItem}>
                <Ionicons name="download" size={14} color="#4CAF50" />
              </View>
            )}
          </View>
          <Text style={styles.lastModified}>{item.lastModified}</Text>
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
                <Text style={styles.title}>Study Notes</Text>
                <Text style={styles.subtitle}>
                  Your comprehensive study materials
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="cloud-download" size={16} color="white" />
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
              placeholder="Search notes..."
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
          </View>
        </Animated.View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <Text style={styles.resultsCount}>{filteredNotes.length} Notes</Text>
          <View style={styles.rightControls}>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortText}>Recent</Text>
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

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <Animated.View entering={FadeIn.delay(300)}>
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color={theme.colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyStateTitle}>No notes found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search terms or create your first study note.
              </Text>
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={filteredNotes}
            renderItem={renderNoteCard}
            keyExtractor={(item) => item.id}
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
