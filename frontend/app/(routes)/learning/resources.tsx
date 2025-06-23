"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";

// Mock resources data with enhanced structure
const MOCK_RESOURCES = [
  {
    _id: "resource_001",
    format: "video",
    title: "Algebraic Expressions Explained",
    description:
      "Comprehensive video tutorial covering variables, coefficients, and basic operations with algebraic expressions.",
    subjectId: "math_001",
    subjectName: "Mathematics",
    series: ["D"],
    topicIds: ["topic_algebra"],
    topicName: "Algebra Basics",
    level: "beginner",
    url: "https://example.com/algebra-video.mp4",
    thumbnail: "https://example.com/algebra-thumb.jpg",
    offlineAvailable: true,
    premiumOnly: false,
    instructor: "Dr. Sarah Johnson",
    metadata: {
      fileSize: 125000000,
      duration: 900,
      format: "MP4",
      language: "english",
      difficulty: "beginner",
      version: "1.0",
    },
    analytics: {
      views: 1250,
      downloads: 340,
      averageRating: 4.8,
      bookmarkCount: 89,
      completionRate: 85,
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "resource_002",
    format: "pdf",
    title: "Algebra Reference Sheet",
    description:
      "Quick reference guide with formulas, rules, and examples for algebraic expressions and equations.",
    subjectId: "math_001",
    subjectName: "Mathematics",
    series: ["D"],
    topicIds: ["topic_algebra"],
    topicName: "Algebra Basics",
    level: "intermediate",
    url: "https://example.com/algebra-reference.pdf",
    thumbnail: "https://example.com/pdf-thumb.jpg",
    offlineAvailable: true,
    premiumOnly: false,
    instructor: "Prof. Michael Chen",
    metadata: {
      fileSize: 2500000,
      pages: 12,
      format: "PDF",
      language: "english",
      difficulty: "intermediate",
      version: "2.1",
    },
    analytics: {
      views: 890,
      downloads: 567,
      averageRating: 4.6,
      bookmarkCount: 123,
      completionRate: 92,
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "resource_003",
    format: "interactive",
    title: "Algebra Practice Simulator",
    description:
      "Interactive tool for practicing algebraic manipulations with step-by-step guidance and instant feedback.",
    subjectId: "math_001",
    subjectName: "Mathematics",
    series: ["D"],
    topicIds: ["topic_geometry"],
    topicName: "Geometry",
    level: "advanced",
    url: "https://example.com/algebra-simulator",
    thumbnail: "https://example.com/simulator-thumb.jpg",
    offlineAvailable: false,
    premiumOnly: true,
    instructor: "AI Tutor System",
    metadata: {
      format: "Web App",
      language: "english",
      difficulty: "advanced",
      version: "3.0",
      exercises: 45,
    },
    analytics: {
      views: 456,
      downloads: 0,
      averageRating: 4.9,
      bookmarkCount: 67,
      completionRate: 78,
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    _id: "resource_004",
    format: "audio",
    title: "Algebra Concepts Podcast",
    description:
      "Audio explanation of key algebraic concepts perfect for learning on the go.",
    subjectId: "physics_001",
    subjectName: "Physics",
    series: ["D"],
    topicIds: ["topic_mechanics"],
    topicName: "Mechanics",
    level: "beginner",
    url: "https://example.com/algebra-podcast.mp3",
    thumbnail: "https://example.com/audio-thumb.jpg",
    offlineAvailable: true,
    premiumOnly: false,
    instructor: "Ms. Emily Rodriguez",
    metadata: {
      fileSize: 45000000,
      duration: 1800,
      format: "MP3",
      language: "english",
      difficulty: "beginner",
      version: "1.2",
    },
    analytics: {
      views: 678,
      downloads: 234,
      averageRating: 4.4,
      bookmarkCount: 45,
      completionRate: 88,
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

export default function ResourcesScreen() {
  const router = useRouter();
  const { topicId, topicName } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
//   const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  // Get unique values for filters
  const topics = Array.from(new Set(MOCK_RESOURCES.map((r) => r.topicName)));
  const subjects = Array.from(
    new Set(MOCK_RESOURCES.map((r) => r.subjectName))
  );

  const filteredResources = MOCK_RESOURCES.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFormat =
      selectedFormat === "all" || resource.format === selectedFormat;
    const matchesLevel =
      selectedLevel === "all" || resource.metadata.difficulty === selectedLevel;
    const matchesTopic =
      selectedTopic === "all" || resource.topicName === selectedTopic;
    const matchesSubject =
      selectedSubject === "all" || resource.subjectName === selectedSubject;

    return (
      matchesSearch &&
      matchesFormat &&
      matchesLevel &&
      matchesTopic &&
      matchesSubject
    );
  });

  const handleResourcePress = (resource: (typeof MOCK_RESOURCES)[0]) => {
    if (resource.format === "video") {
      router.push(
        `/(routes)/learning/video-player?videoId=${resource._id}&title=${resource.title}`
      );
    } else {
      console.log(`Open resource: ${resource._id}`);
    }
  };

  const clearAllFilters = () => {
    setSelectedFormat("all");
    setSelectedLevel("all");
    setSelectedTopic("all");
    setSelectedSubject("all");
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "video":
        return "play-circle";
      case "pdf":
        return "document-text";
      case "interactive":
        return "game-controller";
      case "audio":
        return "musical-notes";
      default:
        return "document";
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case "video":
        return "#EF4444";
      case "pdf":
        return "#3B82F6";
      case "interactive":
        return "#10B981";
      case "audio":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "#10B981";
      case "intermediate":
        return "#F59E0B";
      case "advanced":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderFilterModal = () => (
    <Modal visible={showFilterModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Resources</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Format</Text>
            <View style={styles.filterOptions}>
              {["all", "video", "pdf", "interactive", "audio"].map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.filterOption,
                    selectedFormat === format && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedFormat(format)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFormat === format &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {format === "all"
                      ? "All Formats"
                      : format.charAt(0).toUpperCase() + format.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Difficulty</Text>
            <View style={styles.filterOptions}>
              {["all", "beginner", "intermediate", "advanced"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterOption,
                    selectedLevel === level && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedLevel(level)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedLevel === level && styles.filterOptionTextActive,
                    ]}
                  >
                    {level === "all"
                      ? "All Levels"
                      : level.charAt(0).toUpperCase() + level.slice(1)}
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

  const renderResourceCard = ({
    item: resource,
  }: {
    item: (typeof MOCK_RESOURCES)[0];
  }) => {
    const formatColor = getFormatColor(resource.format);
    const levelColor = getLevelColor(resource.metadata.difficulty);

    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <TouchableOpacity
          style={styles.resourceCard}
          onPress={() => handleResourcePress(resource)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={styles.resourceCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.resourceHeader}>
              <View
                style={[
                  styles.formatIcon,
                  { backgroundColor: formatColor + "20" },
                ]}
              >
                <Ionicons
                  name={getFormatIcon(resource.format) as any}
                  size={24}
                  color={formatColor}
                />
              </View>
              <View style={styles.resourceInfo}>
                <View style={styles.resourceTitleRow}>
                  <Text style={styles.resourceTitle} numberOfLines={2}>
                    {resource.title}
                  </Text>
                  {resource.premiumOnly && (
                    <View style={styles.premiumBadge}>
                      <Ionicons name="diamond" size={12} color="#F59E0B" />
                    </View>
                  )}
                </View>
                <Text style={styles.resourceInstructor}>
                  by {resource.instructor}
                </Text>
                <Text style={styles.resourceSubject}>
                  {resource.subjectName} • {resource.topicName}
                </Text>
                {/* <Text style={styles.resourceDescription} numberOfLines={2}>
                  {resource.description}
                </Text> */}
              </View>
            </View>

            <View style={styles.resourceMeta}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.metaText}>
                    {resource.analytics.averageRating}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="eye" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>
                    {resource.analytics.views}
                  </Text>
                </View>
                {resource.analytics.downloads > 0 && (
                  <View style={styles.metaItem}>
                    <Ionicons name="download" size={14} color="#6B7280" />
                    <Text style={styles.metaText}>
                      {resource.analytics.downloads}
                    </Text>
                  </View>
                )}
                {resource.metadata.duration && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={14} color="#6B7280" />
                    <Text style={styles.metaText}>
                      {formatDuration(resource.metadata.duration)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.resourceFooter}>
                <View style={styles.resourceTags}>
                  <View
                    style={[
                      styles.tag,
                      { backgroundColor: formatColor + "20" },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: formatColor }]}>
                      {resource.format.toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={[styles.tag, { backgroundColor: levelColor + "20" }]}
                  >
                    <Text style={[styles.tagText, { color: levelColor }]}>
                      {resource.metadata.difficulty}
                    </Text>
                  </View>
                  {resource.offlineAvailable && (
                    <View
                      style={[
                        styles.tag,
                        { backgroundColor: "#10B981" + "20" },
                      ]}
                    >
                      <Text style={[styles.tagText, { color: "#10B981" }]}>
                        Offline
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.resourceActions}>
                  <Text style={styles.fileSize}>
                    {formatFileSize(resource.metadata.fileSize || 0)}
                  </Text>
                  <TouchableOpacity style={styles.bookmarkButton}>
                    <Ionicons
                      name="bookmark-outline"
                      size={16}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Progress bar for completion rate */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${resource.analytics.completionRate}%`,
                      backgroundColor: formatColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {resource.analytics.completionRate}% completion rate
              </Text>
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
    viewModeButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
    },
    activeViewMode: {
      backgroundColor: "#3B82F6",
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
    resourceCard: {
      marginBottom: 16,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    resourceCardGradient: {
      padding: 20,
    },
    resourceHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    formatIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    resourceInfo: {
      flex: 1,
    },
    resourceTitleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    resourceTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      flex: 1,
      marginRight: 8,
    },
    resourceInstructor: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Medium",
      marginBottom: 4,
    },
    resourceSubject: {
      fontSize: 12,
      color: "#3B82F6",
      fontFamily: "Inter-Medium",
      marginBottom: 6,
    },
    resourceDescription: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    premiumBadge: {
      backgroundColor: "#FEF3C7",
      borderRadius: 12,
      padding: 6,
    },
    resourceMeta: {
      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",
      paddingTop: 16,
      marginBottom: 12,
    },
    metaRow: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 12,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    resourceFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    resourceTags: {
      flexDirection: "row",
      gap: 8,
      flex: 1,
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
    },
    tagText: {
      fontSize: 10,
      color: "#6B7280",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    resourceActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    fileSize: {
      fontSize: 12,
      color: "#9CA3AF",
      fontFamily: "Inter-Regular",
    },
    bookmarkButton: {
      padding: 4,
    },
    progressContainer: {
      marginTop: 12,
    },
    progressBar: {
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
      fontSize: 11,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 4,
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
    filterButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
      marginRight: 8,
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
      marginTop: 0,
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
            <Text style={styles.title}>Resources</Text>
            <Text style={styles.subtitle}>
              {topicName ? `${topicName} • ` : ""}
              {filteredResources.length} resources
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="filter" size={20} color="#64748B" />
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === "list" && styles.activeViewMode,
              ]}
              onPress={() => setViewMode("list")}
            >
              <Ionicons
                name="list"
                size={20}
                color={viewMode === "list" ? "white" : "#64748B"}
              />
            </TouchableOpacity> */}
            {/* <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === "grid" && styles.activeViewMode,
              ]}
              onPress={() => setViewMode("grid")}
            >
              <Ionicons
                name="grid"
                size={20}
                color={viewMode === "grid" ? "white" : "#64748B"}
              />
            </TouchableOpacity> */}
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.content}>
        {filteredResources.length > 0 ? (
          <FlatList
            data={filteredResources}
            renderItem={renderResourceCard}
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
              name="library-outline"
              size={64}
              color="#E2E8F0"
              style={styles.emptyStateIcon}
            />
            <Text style={styles.emptyStateTitle}>No resources found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "Try adjusting your search terms or filters"
                : "Resources will appear here when available"}
            </Text>
          </Animated.View>
        )}
      </View>

      {renderFilterModal()}
    </SafeAreaView>
  );
}
