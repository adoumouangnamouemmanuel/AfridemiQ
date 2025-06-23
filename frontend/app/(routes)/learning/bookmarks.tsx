"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";

// Enhanced mock bookmarks data
const MOCK_BOOKMARKS = [
  {
    _id: "bookmark_001",
    userId: "user_001",
    contentType: "lesson",
    contentId: "lesson_001",
    title: "Introduction to Algebraic Expressions",
    description:
      "Base lesson covering variables, coefficients, and basic operations with algebraic expressions.",
    subjectName: "Mathematics",
    topicName: "Algebra Basics",
    notes:
      "Important for exam - review distributive property section. Focus on practice problems 5-10.",
    tags: ["algebra", "basics", "exam-prep", "variables"],
    category: "lessons",
    collection: "Exam Preparation",
    priority: 5,
    color: "#3B82F6",
    isArchived: false,
    lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000),
    accessCount: 12,
    completionStatus: "in-progress",
    progress: 75,
    reminder: {
      enabled: true,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      frequency: "once",
      message: "Review algebra basics before exam",
    },
    metadata: {
      source: "Math Course - Chapter 3",
      difficulty: "medium",
      estimatedReadTime: 15,
      contentPreview:
        "Learn the fundamentals of algebraic expressions including variables, coefficients...",
      instructor: "Dr. Sarah Johnson",
      duration: 900,
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    _id: "bookmark_002",
    userId: "user_001",
    contentType: "resource",
    contentId: "resource_001",
    title: "Algebra Reference Sheet",
    description:
      "Comprehensive reference guide with formulas, rules, and examples for algebraic operations.",
    subjectName: "Mathematics",
    topicName: "Algebra Basics",
    notes:
      "Great for quick lookups during practice. Print this out for exam day.",
    tags: ["reference", "formulas", "quick-guide"],
    category: "resources",
    collection: "Reference Materials",
    priority: 4,
    color: "#10B981",
    isArchived: false,
    lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    accessCount: 25,
    completionStatus: "completed",
    progress: 100,
    reminder: {
      enabled: false,
    },
    metadata: {
      source: "Study Materials Library",
      difficulty: "easy",
      estimatedReadTime: 5,
      contentPreview:
        "Essential formulas and rules for algebra including distributive property...",
      fileType: "PDF",
      fileSize: 2500000,
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "bookmark_003",
    userId: "user_001",
    contentType: "quiz",
    contentId: "quiz_001",
    title: "Algebra Practice Quiz - Chapter 3",
    description:
      "25 multiple choice questions covering basic algebraic operations and problem solving.",
    subjectName: "Mathematics",
    topicName: "Geometry",
    notes:
      "Need to retake - scored 78% last time. Focus on questions 15-20 about distributive property.",
    tags: ["practice", "quiz", "retake", "multiple-choice"],
    category: "practice",
    collection: "Practice Quizzes",
    priority: 3,
    color: "#F59E0B",
    isArchived: false,
    lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    accessCount: 7,
    completionStatus: "failed",
    progress: 78,
    reminder: {
      enabled: true,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      frequency: "weekly",
      message: "Retake algebra quiz to improve score",
    },
    metadata: {
      source: "Practice Tests Platform",
      difficulty: "medium",
      estimatedReadTime: 30,
      contentPreview:
        "Test your knowledge of algebraic expressions with this practice quiz...",
      totalQuestions: 25,
      score: 78,
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "bookmark_004",
    userId: "user_001",
    contentType: "lesson",
    contentId: "lesson_002",
    title: "Physics Motion Laws",
    description:
      "Understanding Newton's laws of motion with practical examples.",
    subjectName: "Physics",
    topicName: "Mechanics",
    notes: "Key concepts for upcoming test.",
    tags: ["physics", "motion", "laws"],
    category: "lessons",
    collection: "Physics Fundamentals",
    priority: 4,
    color: "#8B5CF6",
    isArchived: false,
    lastAccessed: new Date(Date.now() - 4 * 60 * 60 * 1000),
    accessCount: 8,
    completionStatus: "completed",
    progress: 100,
    reminder: {
      enabled: false,
    },
    metadata: {
      source: "Physics Course",
      difficulty: "medium",
      estimatedReadTime: 20,
      contentPreview: "Explore the fundamental laws that govern motion...",
      instructor: "Prof. Anderson",
      duration: 1200,
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
];

export default function BookmarksScreen() {
  const router = useRouter();
  const { topicId, topicName } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [bookmarks, setBookmarks] = useState(MOCK_BOOKMARKS);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  const topics = Array.from(new Set(bookmarks.map((b) => b.topicName)));
  const subjects = Array.from(new Set(bookmarks.map((b) => b.subjectName)));

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || bookmark.category === selectedCategory;
    const matchesTopic =
      selectedTopic === "all" || bookmark.topicName === selectedTopic;
    const matchesSubject =
      selectedSubject === "all" || bookmark.subjectName === selectedSubject;
    const matchesPriority =
      selectedPriority === "all" ||
      (selectedPriority === "high" && bookmark.priority >= 4) ||
      (selectedPriority === "medium" && bookmark.priority === 3) ||
      (selectedPriority === "low" && bookmark.priority <= 2);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesTopic &&
      matchesSubject &&
      matchesPriority &&
      !bookmark.isArchived
    );
  });

  const handleBookmarkPress = (bookmark: (typeof MOCK_BOOKMARKS)[0]) => {
    // Update access count and last accessed
    setBookmarks((prev) =>
      prev.map((b) =>
        b._id === bookmark._id
          ? {
              ...b,
              accessCount: b.accessCount + 1,
              lastAccessed: new Date(),
            }
          : b
      )
    );

    // Navigate based on content type
    switch (bookmark.contentType) {
      case "lesson":
        router.push(
          `/(routes)/learning/lessons/base-lesson?lessonId=${bookmark.contentId}`
        );
        break;
      case "resource":
        // TODO: Navigate to resource
        console.log(`Navigate to resource: ${bookmark.contentId}`);
        break;
      case "quiz":
        // TODO: Navigate to quiz
        console.log(`Navigate to quiz: ${bookmark.contentId}`);
        break;
      default:
        console.log(
          `Navigate to ${bookmark.contentType}: ${bookmark.contentId}`
        );
    }
  };

  const handleRemoveBookmark = (bookmarkId: string) => {
    Alert.alert(
      "Remove Bookmark",
      "Are you sure you want to remove this bookmark?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setBookmarks((prev) =>
              prev.map((b) =>
                b._id === bookmarkId ? { ...b, isArchived: true } : b
              )
            );
          },
        },
      ]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedTopic("all");
    setSelectedSubject("all");
    setSelectedPriority("all");
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "lesson":
        return "play-circle";
      case "resource":
        return "document-text";
      case "quiz":
        return "help-circle";
      case "course":
        return "school";
      default:
        return "bookmark";
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

  const renderFilterModal = () => (
    <Modal visible={showFilterModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Bookmarks</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Category</Text>
            <View style={styles.filterOptions}>
              {["all", "lessons", "resources", "practice"].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    selectedCategory === category && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedCategory === category &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {category === "all"
                      ? "All Categories"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Priority</Text>
            <View style={styles.filterOptions}>
              {["all", "high", "medium", "low"].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.filterOption,
                    selectedPriority === priority && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedPriority(priority)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedPriority === priority &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {priority === "all"
                      ? "All Priorities"
                      : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Subject</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedSubject === "all" && styles.filterOptionActive,
                ]}
                onPress={() => setSelectedSubject("all")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedSubject === "all" && styles.filterOptionTextActive,
                  ]}
                >
                  All Subjects
                </Text>
              </TouchableOpacity>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.filterOption,
                    selectedSubject === subject && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedSubject(subject)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSubject === subject &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Topic</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedTopic === "all" && styles.filterOptionActive,
                ]}
                onPress={() => setSelectedTopic("all")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedTopic === "all" && styles.filterOptionTextActive,
                  ]}
                >
                  All Topics
                </Text>
              </TouchableOpacity>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={[
                    styles.filterOption,
                    selectedTopic === topic && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedTopic(topic)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedTopic === topic && styles.filterOptionTextActive,
                    ]}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderBookmarkCard = ({
    item: bookmark,
  }: {
    item: (typeof MOCK_BOOKMARKS)[0];
  }) => {
    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <TouchableOpacity
          style={styles.bookmarkCard}
          onPress={() => handleBookmarkPress(bookmark)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={styles.bookmarkCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.bookmarkHeader}>
              <View
                style={[
                  styles.contentTypeIcon,
                  { backgroundColor: bookmark.color + "20" },
                ]}
              >
                <Ionicons
                  name={getContentTypeIcon(bookmark.contentType) as any}
                  size={20}
                  color={bookmark.color}
                />
              </View>
              <View style={styles.bookmarkInfo}>
                <Text style={styles.bookmarkTitle}>{bookmark.title}</Text>
                <Text style={styles.subjectTopicText}>
                  {bookmark.subjectName} • {bookmark.topicName}
                </Text>
                {/* <Text style={styles.bookmarkDescription} numberOfLines={2}>
                  {bookmark.description}
                </Text> */}
              </View>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{bookmark.priority}</Text>
              </View>
            </View>

            {bookmark.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText} numberOfLines={2}>
                  {bookmark.notes}
                </Text>
              </View>
            )}

            {/* <View style={styles.tagsContainer}>
              {bookmark.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {bookmark.tags.length > 3 && (
                <Text style={styles.moreTagsText}>
                  +{bookmark.tags.length - 3}
                </Text>
              )}
            </View> */}

            <View style={styles.bookmarkFooter}>
              <View style={styles.bookmarkStats}>
                <View style={styles.stat}>
                  <Ionicons name="eye" size={12} color="#9CA3AF" />
                  <Text style={styles.statText}>{bookmark.accessCount}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="time" size={12} color="#9CA3AF" />
                  <Text style={styles.statText}>
                    {bookmark.metadata.estimatedReadTime}m
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="folder" size={12} color="#9CA3AF" />
                  <Text style={styles.statText}>{bookmark.category}</Text>
                </View>
                {bookmark.reminder.enabled && (
                  <View style={styles.stat}>
                    <Ionicons name="alarm" size={12} color="#F59E0B" />
                    <Text style={[styles.statText, { color: "#F59E0B" }]}>
                      Reminder
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.bookmarkActions}>
                <Text style={styles.lastAccessed}>
                  {getTimeAgo(bookmark.lastAccessed)}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveBookmark(bookmark._id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
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
      padding: 20,
    },
    bookmarkCard: {
      marginBottom: 16,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    bookmarkCardGradient: {
      padding: 20,
    },
    bookmarkHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    contentTypeIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    bookmarkInfo: {
      flex: 1,
    },
    bookmarkTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    subjectTopicText: {
      fontSize: 12,
      color: "#3B82F6",
      fontFamily: "Inter-Medium",
      marginBottom: 4,
    },
    bookmarkDescription: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    priorityBadge: {
      backgroundColor: "#3B82F6",
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    priorityText: {
      fontSize: 12,
      color: "white",
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
    notesSection: {
      backgroundColor: "#FEF3C7",
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    },
    notesLabel: {
      fontSize: 12,
      color: "#92400E",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
      marginBottom: 4,
    },
    notesText: {
      fontSize: 14,
      color: "#92400E",
      fontFamily: "Inter-Regular",
      lineHeight: 18,
    },
    tagsContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
      flexWrap: "wrap",
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
    },
    tagText: {
      fontSize: 12,
      color: "#6B7280",
      fontWeight: "500",
      fontFamily: "Inter-Medium",
    },
    moreTagsText: {
      fontSize: 12,
      color: "#9CA3AF",
      fontFamily: "Inter-Regular",
    },
    bookmarkFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    bookmarkStats: {
      flexDirection: "row",
      gap: 16,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statText: {
      fontSize: 12,
      color: "#9CA3AF",
      fontFamily: "Inter-Regular",
    },
    bookmarkActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    lastAccessed: {
      fontSize: 12,
      color: "#9CA3AF",
      fontFamily: "Inter-Regular",
    },
    removeButton: {
      padding: 4,
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
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    filterButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    filterSection: {
      marginBottom: 24,
    },
    filterSectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 12,
    },
    filterOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    filterOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: "#F1F5F9",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    filterOptionActive: {
      backgroundColor: "#3B82F6",
      borderColor: "#3B82F6",
    },
    filterOptionText: {
      fontSize: 14,
      color: "#64748B",
      fontWeight: "500",
      fontFamily: "Inter-Medium",
    },
    filterOptionTextActive: {
      color: "white",
    },
    modalActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 20,
    },
    clearButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
      alignItems: "center",
    },
    clearButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#64748B",
      fontFamily: "Inter-SemiBold",
    },
    applyButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#3B82F6",
      alignItems: "center",
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
      fontFamily: "Inter-SemiBold",
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748B" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Bookmarks</Text>
            <Text style={styles.subtitle}>
              {topicName} • {filteredBookmarks.length} bookmarks
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="filter" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.content}>
        {filteredBookmarks.length > 0 ? (
          <FlatList
            data={filteredBookmarks}
            renderItem={renderBookmarkCard}
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
              name="bookmark-outline"
              size={64}
              color="#E2E8F0"
              style={styles.emptyStateIcon}
            />
            <Text style={styles.emptyStateTitle}>No bookmarks found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Bookmark content to access it quickly later"}
            </Text>
          </Animated.View>
        )}
      </View>

      {renderFilterModal()}
    </SafeAreaView>
  );
}
