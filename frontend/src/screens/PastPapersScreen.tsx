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
import mockPastPapers from "../data/mockPastPapers.json";
import PastPaperCard from "../components/PastPaperCard";

const EXAM_FILTERS = [
  { id: "all", label: "All Exams", icon: "apps" },
  { id: "JEE Main", label: "JEE Main", icon: "calculator" },
  { id: "JEE Advanced", label: "JEE Adv", icon: "rocket" },
  { id: "NEET", label: "NEET", icon: "medical" },
  { id: "GATE", label: "GATE", icon: "laptop" },
  { id: "CAT", label: "CAT", icon: "briefcase" },
];

const YEAR_FILTERS = ["2024", "2023", "2022", "2021", "2020"];

export default function PastPapersScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const filteredPapers = useMemo(() => {
    let filtered = mockPastPapers;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (paper) =>
          paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paper.exam.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Exam filter
    if (selectedExam !== "all") {
      filtered = filtered.filter((paper) => paper.exam === selectedExam);
    }

    // Year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter(
        (paper) => paper.year.toString() === selectedYear
      );
    }

    // Sort by year (latest first) and then by popularity
    return filtered.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.totalAttempts - a.totalAttempts;
    });
  }, [searchQuery, selectedExam, selectedYear]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
    examFilters: {
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
    yearFilters: {
      flexDirection: "row",
      gap: 8,
    },
    yearButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    yearButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    yearText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    yearTextActive: {
      color: "white",
    },
    resultsHeader: {
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
    papersList: {
      gap: 12,
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

  const renderPaperCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={SlideInRight.delay(index * 100)}>
      <View style={{ marginBottom: 12 }}>
        <PastPaperCard
          paper={item}
          onPress={() => router.push(`/(routes)/past-paper/${item.id}`)}
        />
      </View>
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
                <Text style={styles.title}>Past Papers</Text>
                <Text style={styles.subtitle}>
                  National exam papers for practice
                </Text>
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
              placeholder="Search past papers..."
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
              <Text style={styles.filterLabel}>Exam Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.examFilters}
              >
                {EXAM_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterButton,
                      selectedExam === filter.id && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedExam(filter.id)}
                  >
                    <Ionicons
                      name={filter.icon as any}
                      size={14}
                      color={
                        selectedExam === filter.id
                          ? "white"
                          : theme.colors.textSecondary
                      }
                      style={styles.filterIcon}
                    />
                    <Text
                      style={[
                        styles.filterText,
                        selectedExam === filter.id && styles.filterTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Year</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.yearFilters}
              >
                <TouchableOpacity
                  style={[
                    styles.yearButton,
                    selectedYear === "all" && styles.yearButtonActive,
                  ]}
                  onPress={() => setSelectedYear("all")}
                >
                  <Text
                    style={[
                      styles.yearText,
                      selectedYear === "all" && styles.yearTextActive,
                    ]}
                  >
                    All Years
                  </Text>
                </TouchableOpacity>
                {YEAR_FILTERS.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearButton,
                      selectedYear === year && styles.yearButtonActive,
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.yearText,
                        selectedYear === year && styles.yearTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Animated.View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredPapers.length} Papers Found
          </Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortText}>Latest First</Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Papers List */}
        {filteredPapers.length === 0 ? (
          <Animated.View entering={FadeIn.delay(300)}>
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color={theme.colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyStateTitle}>No papers found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search terms or filters to find the papers
                you&apos;re looking for.
              </Text>
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={filteredPapers}
            renderItem={renderPaperCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.papersList}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
