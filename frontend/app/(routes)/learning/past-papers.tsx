"use client";

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { useTheme } from "../../../src/utils/ThemeContext";

// Mock past papers data
const PAST_PAPERS = [
  {
    id: "1",
    title: "WAEC Mathematics 2023",
    year: "2023",
    exam: "WAEC",
    subject: "Mathematics",
    type: "Theory",
    duration: "3 hours",
    questions: 13,
    difficulty: "Intermediate",
    downloads: "2.3K",
    rating: 4.8,
    isDownloaded: false,
    size: "2.4 MB",
  },
  {
    id: "2",
    title: "JAMB Physics 2022",
    year: "2022",
    exam: "JAMB",
    subject: "Physics",
    type: "Objective",
    duration: "2 hours",
    questions: 40,
    difficulty: "Advanced",
    downloads: "1.8K",
    rating: 4.7,
    isDownloaded: true,
    size: "1.8 MB",
  },
  {
    id: "3",
    title: "NECO Chemistry 2023",
    year: "2023",
    exam: "NECO",
    subject: "Chemistry",
    type: "Practical",
    duration: "2.5 hours",
    questions: 8,
    difficulty: "Intermediate",
    downloads: "1.5K",
    rating: 4.6,
    isDownloaded: false,
    size: "3.1 MB",
  },
  {
    id: "4",
    title: "WAEC Biology 2022",
    year: "2022",
    exam: "WAEC",
    subject: "Biology",
    type: "Theory",
    duration: "3 hours",
    questions: 12,
    difficulty: "Beginner",
    downloads: "3.1K",
    rating: 4.9,
    isDownloaded: true,
    size: "2.7 MB",
  },
];

const EXAM_TYPES = ["All", "WAEC", "JAMB", "NECO", "NABTEB"];

export default function PastPapersScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("All");

  const filteredPapers = PAST_PAPERS.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExam = selectedExam === "All" || paper.exam === selectedExam;
    return matchesSearch && matchesExam;
  });

  const handlePaperPress = (paperId: string) => {
    // TODO: Navigate to paper viewer or download
    console.log("Paper pressed:", paperId);
  };

  const handleDownload = (paperId: string) => {
    // TODO: Implement download functionality
    console.log("Download paper:", paperId);
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

  const getExamColor = (exam: string) => {
    switch (exam) {
      case "WAEC":
        return { backgroundColor: "#DBEAFE", color: "#1E40AF" };
      case "JAMB":
        return { backgroundColor: "#EDE9FE", color: "#7C3AED" };
      case "NECO":
        return { backgroundColor: "#D1FAE5", color: "#065F46" };
      case "NABTEB":
        return { backgroundColor: "#FED7AA", color: "#C2410C" };
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
    downloadButton: {
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
    // Filters
    filtersContainer: {
      flexDirection: "row",
    },
    filterChip: {
      marginRight: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
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
    // Papers List
    papersList: {
      flex: 1,
      paddingHorizontal: 24,
        paddingVertical: 10,
    },
    paperCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    // Paper Header
    paperHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    paperHeaderLeft: {
      flex: 1,
      marginRight: 12,
    },
    paperTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
    },
    paperBadges: {
      flexDirection: "row",
      gap: 8,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    downloadActionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    downloadedButton: {
      backgroundColor: "#D1FAE5",
    },
    notDownloadedButton: {
      backgroundColor: "#DBEAFE",
    },
    // Paper Details
    paperDetails: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    paperDetailsLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    detailText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginLeft: 4,
      fontFamily: "Inter-Regular",
    },
    // Paper Stats
    paperStats: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    paperStatsLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginLeft: 4,
      fontFamily: "Inter-Regular",
    },
    paperYear: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
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
              <Text style={styles.headerTitle}>Past Papers</Text>
              <Text style={styles.headerSubtitle}>
                {PAST_PAPERS.length} exam papers
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.downloadButton}>
            <Ionicons
              name="download-outline"
              size={20}
              color={theme.colors.primary}
            />
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
            placeholder="Search past papers..."
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

        {/* Exam Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {EXAM_TYPES.map((exam) => (
            <TouchableOpacity
              key={exam}
              style={[
                styles.filterChip,
                selectedExam === exam
                  ? styles.filterChipActive
                  : styles.filterChipInactive,
              ]}
              onPress={() => setSelectedExam(exam)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedExam === exam
                    ? styles.filterChipTextActive
                    : styles.filterChipTextInactive,
                ]}
              >
                {exam}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Papers List */}
      <ScrollView
        style={styles.papersList}
        showsVerticalScrollIndicator={false}
      >
        {filteredPapers.map((paper, index) => (
          <Animated.View
            key={paper.id}
            entering={SlideInRight.delay(index * 100)}
          >
            <TouchableOpacity
              style={styles.paperCard}
              onPress={() => handlePaperPress(paper.id)}
            >
              {/* Paper Header */}
              <View style={styles.paperHeader}>
                <View style={styles.paperHeaderLeft}>
                  <Text style={styles.paperTitle}>{paper.title}</Text>
                  <View style={styles.paperBadges}>
                    <View style={[styles.badge, getExamColor(paper.exam)]}>
                      <Text
                        style={[
                          styles.badgeText,
                          { color: getExamColor(paper.exam).color },
                        ]}
                      >
                        {paper.exam}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        getDifficultyColor(paper.difficulty),
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: getDifficultyColor(paper.difficulty).color },
                        ]}
                      >
                        {paper.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.downloadActionButton,
                    paper.isDownloaded
                      ? styles.downloadedButton
                      : styles.notDownloadedButton,
                  ]}
                  onPress={() => handleDownload(paper.id)}
                >
                  <Ionicons
                    name={paper.isDownloaded ? "checkmark" : "download"}
                    size={20}
                    color={paper.isDownloaded ? "#065F46" : "#1E40AF"}
                  />
                </TouchableOpacity>
              </View>

              {/* Paper Details */}
              <View style={styles.paperDetails}>
                <View style={styles.paperDetailsLeft}>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="document-text"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{paper.type}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons
                      name="time"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{paper.duration}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons
                      name="help-circle"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.detailText}>
                      {paper.questions} questions
                    </Text>
                  </View>
                </View>
              </View>

              {/* Paper Stats */}
              <View style={styles.paperStats}>
                <View style={styles.paperStatsLeft}>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="download-outline"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.statText}>{paper.downloads}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={styles.statText}>{paper.rating}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Ionicons
                      name="document"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.statText}>{paper.size}</Text>
                  </View>
                </View>

                <Text style={styles.paperYear}>{paper.year}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {filteredPapers.length === 0 && (
          <Animated.View entering={FadeIn.delay(300)} style={styles.emptyState}>
            <Ionicons
              name="document-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyStateTitle}>No past papers found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filter criteria
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
