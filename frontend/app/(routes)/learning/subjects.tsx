"use client";

import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "../../../src/utils/ThemeContext";
// ADD: Import the subject hooks - exactly like curriculum and topic integration
import { useSubjectsBySeries } from "../../../src/hooks/useSubject";
// import { useUser } from "../../../src/utils/UserContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Mock subjects data based on subject.model
const SUBJECTS = [
  {
    _id: "math_001",
    name: "Mathematics",
    slug: "mathematics",
    icon: "calculator",
    color: "#FF6B6B",
    description: "Master algebra, geometry, calculus and statistics",
    longDescription:
      "Comprehensive mathematics curriculum covering all essential topics for exam preparation",
    category: "science",
    difficulty: "moyen",
    series: ["D"],
    estimatedHours: 120,
    popularity: 95,
    rating: { average: 4.8, count: 1250 },
    statistics: {
      totalStudents: 15420,
      totalExams: 45,
      averageScore: 78,
      completionRate: 0.72,
      totalQuestions: 2340,
      totalResources: 156,
    },
    isActive: true,
    isPremium: false,
    hasTopics: true,
  },
  {
    _id: "physics_001",
    name: "Physics",
    slug: "physics",
    icon: "planet",
    color: "#4ECDC4",
    description: "Explore mechanics, thermodynamics, and electromagnetism",
    longDescription:
      "Complete physics curriculum with practical applications and problem-solving techniques",
    category: "science",
    difficulty: "difficile",
    series: ["D"],
    estimatedHours: 100,
    popularity: 87,
    rating: { average: 4.6, count: 980 },
    statistics: {
      totalStudents: 12340,
      totalExams: 38,
      averageScore: 74,
      completionRate: 0.68,
      totalQuestions: 1890,
      totalResources: 134,
    },
    isActive: true,
    isPremium: false,
    hasTopics: true,
  },
  {
    _id: "chemistry_001",
    name: "Chemistry",
    slug: "chemistry",
    icon: "flask",
    color: "#45B7D1",
    description: "Chemical reactions, organic and inorganic chemistry",
    longDescription:
      "Comprehensive chemistry course covering molecular structures and chemical processes",
    category: "science",
    difficulty: "moyen",
    series: ["D"],
    estimatedHours: 90,
    popularity: 82,
    rating: { average: 4.5, count: 756 },
    statistics: {
      totalStudents: 10890,
      totalExams: 32,
      averageScore: 76,
      completionRate: 0.71,
      totalQuestions: 1560,
      totalResources: 98,
    },
    isActive: true,
    isPremium: false,
    hasTopics: true,
  },
  {
    _id: "biology_001",
    name: "Biology",
    slug: "biology",
    icon: "leaf",
    color: "#96CEB4",
    description: "Cell biology, genetics, reproduction and human anatomy",
    longDescription:
      "Detailed biology curriculum covering life sciences and biological processes",
    category: "science",
    difficulty: "facile",
    series: ["D"],
    estimatedHours: 85,
    popularity: 79,
    rating: { average: 4.4, count: 623 },
    statistics: {
      totalStudents: 9560,
      totalExams: 28,
      averageScore: 80,
      completionRate: 0.75,
      totalQuestions: 1340,
      totalResources: 87,
    },
    isActive: true,
    isPremium: false,
    hasTopics: true,
  },
];

export default function SubjectsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const { theme } = useTheme();
  //TODO: ADD: Get user for series determination will add series later
  // const { user } = useUser();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.text,
      fontFamily: "Inter-ExtraBold",
    },
    viewToggle: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 2,
    },
    viewButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    activeViewButton: {
      backgroundColor: theme.colors.background,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeFilterChip: {
      backgroundColor: "#3B82F6",
      borderColor: "#3B82F6",
    },
    filterText: {
      fontSize: 14,
      color: "#64748B",
      fontWeight: "500",
      fontFamily: "Inter-Medium",
    },
    activeFilterText: {
      color: "white",
    },
    content: {
      flex: 1,
      padding: 0,
    },
    subjectCard: {
      width: (SCREEN_WIDTH - 60) / 2,
      margin: 16,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
    },
    listCard: {
      width: SCREEN_WIDTH - 40,
    },
    cardGradient: {
      padding: 15,
      minHeight: 220,
      position: "relative",
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 50,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    ratingText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    cardContent: {
      flex: 1,
    },
    subjectName: {
      fontSize: 20,
      fontWeight: "800",
      color: "white",
      fontFamily: "Inter-ExtraBold",
      marginBottom: 8,
    },
    subjectDescription: {
      fontSize: 13,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    stat: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 16,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
    },
    statLabel: {
      fontSize: 10,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    difficultyBadge: {
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    difficultyText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    availableBadge: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    availableText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    curriculumButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    toolsButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },

    // ADD: Loading styles - same as curriculum and topic pattern
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      backgroundColor: theme.colors.background,
    },
    loadingContent: {
      alignItems: "center",
      width: "100%",
    },
    loadingIconContainer: {
      marginBottom: 30,
    },
    loadingIconGradient: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#667eea",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    loadingTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      textAlign: "center",
      marginBottom: 8,
    },
    loadingSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginBottom: 40,
    },
    loadingDotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    loadingDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      lineHeight: 24,
    },
  });

  // ADD: Backend integration - exactly like curriculum pattern
  // Determine series from user (default to 'D')
  const series =  "D";

  // Memoize the options to prevent unnecessary re-renders
  const subjectOptions = useMemo(
    () => ({
      difficulty: selectedDifficulty === "all" ? undefined : (selectedDifficulty as any),
      sortBy: "name" as const,
      sortOrder: "asc" as const,
      isActive: true,
    }),
    [selectedDifficulty]
  );

  // Fetch subjects from backend using the hook
  const {
    subjects: backendSubjects,
    isLoading,
    error,
  } = useSubjectsBySeries(series, subjectOptions);

  // ADD: Determine data source and subjects to use - exactly like curriculum pattern
  const { subjectsData, isBackendData } = useMemo(() => {
    if (backendSubjects && backendSubjects.length > 0 && !isLoading && !error) {
      // Use backend data - transform to match frontend interface
      const transformedSubjects = backendSubjects.map((subject, index) => ({
        _id: subject._id,
        name: subject.name,
        slug: subject.slug || subject.name.toLowerCase(),
        icon: subject.icon || "book",
        color: subject.color || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#6C5CE7"][index % 6],
        description: subject.description,
        longDescription: subject.longDescription || subject.description,
        category: subject.category || "science",
        difficulty: subject.difficulty || "moyen",
        series: subject.series || ["D"],
        estimatedHours: subject.estimatedHours || 100,
        popularity: subject.popularity || Math.floor(Math.random() * 50) + 50,
        rating: subject.rating || { average: Math.floor(Math.random() * 20 + 30) / 10, count: Math.floor(Math.random() * 1000) + 100 },
        statistics: subject.statistics || {
          totalStudents: Math.floor(Math.random() * 10000) + 5000,
          totalExams: Math.floor(Math.random() * 30) + 20,
          averageScore: Math.floor(Math.random() * 20) + 70,
          completionRate: Math.floor(Math.random() * 30 + 60) / 100,
          totalQuestions: Math.floor(Math.random() * 1000) + 1000,
          totalResources: Math.floor(Math.random() * 100) + 50,
        },
        isActive: subject.isActive !== false,
        isPremium: subject.isPremium || false,
        hasTopics: true, // All backend subjects have topics
      }));

      return {
        subjectsData: transformedSubjects,
        isBackendData: true,
      };
    } else {
      // Use mock data
      return {
        subjectsData: SUBJECTS,
        isBackendData: false,
      };
    }
  }, [backendSubjects, isLoading, error]);

  // ADD: Log for debugging - exactly like curriculum pattern
  console.log(
    "📚 SubjectsScreen - Using data source:",
    isBackendData ? "Backend" : "Mock"
  );
  console.log("📚 SubjectsScreen - Loading:", isLoading);
  console.log("📚 SubjectsScreen - Error:", error);
  console.log("📚 SubjectsScreen - Series:", series);
  console.log("📚 SubjectsScreen - Found subjects:", subjectsData.length);

  // UPDATE: Filter logic to use the unified data source
  const filteredSubjects = useMemo(() => {
    if (selectedDifficulty === "all") return subjectsData;
    return subjectsData.filter(
      (subject) => subject.difficulty === selectedDifficulty
    );
  }, [subjectsData, selectedDifficulty]);

  const handleSubjectPress = (subject: (typeof subjectsData)[0]) => {
    if (subject.hasTopics) {
      router.push(
        `/(routes)/learning/topics?subjectId=${subject._id}&subjectName=${subject.name}`
      );
    } else {
      // TODO: Navigate to subject overview or coming soon screen
      console.log(`${subject.name} topics coming soon`);
    }
  };

  const renderSubjectCard = ({
    item: subject,
  }: {
    item: (typeof subjectsData)[0];
  }) => {
    const cardWidth =
      viewMode === "grid" ? (SCREEN_WIDTH - 60) / 2 : SCREEN_WIDTH - 40;

    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <TouchableOpacity
          style={[
            styles.subjectCard,
            { width: cardWidth },
            viewMode === "list" && styles.listCard,
          ]}
          onPress={() => handleSubjectPress(subject)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[subject.color, subject.color + "80"]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name={subject.icon as any} size={32} color="white" />
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{subject.rating.average}</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.subjectDescription}>
                {subject.description}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {subject.estimatedHours}h
                  </Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {subject.statistics.totalQuestions}
                  </Text>
                  <Text style={styles.statLabel}>Questions</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {Math.round(subject.statistics.completionRate * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>Complete</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>
                    {subject.difficulty.charAt(0).toUpperCase() +
                      subject.difficulty.slice(1)}
                  </Text>
                </View>
                {subject.hasTopics && (
                  <View style={styles.availableBadge}>
                    <Text style={styles.availableText}>Available</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ADD: Loading Component - exactly like curriculum and topic pattern
  const SubjectsLoader = () => {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.title}>Subjects</Text>
            <View style={styles.headerActions}>
              <View style={styles.viewToggle}>
                <View style={[styles.viewButton, styles.activeViewButton]}>
                  <Ionicons name="grid" size={18} color={theme.colors.primary} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Loading Content */}
        <View style={styles.loadingContainer}>
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.loadingContent}
          >
            <Animated.View
              entering={FadeIn.delay(200).duration(600)}
              style={styles.loadingIconContainer}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.loadingIconGradient}
              >
                <Ionicons name="library" size={48} color="white" />
              </LinearGradient>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(400).duration(600)}>
              <Text style={styles.loadingTitle}>Loading Subjects</Text>
              <Text style={styles.loadingSubtitle}>
                Fetching your series {series} subjects...
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeIn.delay(600).duration(600)}
              style={styles.loadingDotsContainer}
            >
              {[1, 2, 3].map((dot) => (
                <Animated.View
                  key={dot}
                  style={styles.loadingDot}
                  entering={FadeIn.delay(1200 + dot * 100).duration(400)}
                />
              ))}
            </Animated.View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  };

  // ADD: Show loading state - exactly like curriculum and topic pattern
  if (isLoading) {
    return <SubjectsLoader />;
  }



  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Subjects</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.curriculumButton}
              onPress={() => router.push("/(routes)/learning/curriculum")}
            >
              <Ionicons name="calendar" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolsButton}
              onPress={() =>
                router.push("/(routes)/learning/interactive-tools")
              }
            >
              <Ionicons name="construct" size={18} color={theme.colors.success} />
            </TouchableOpacity>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === "grid" && styles.activeViewButton,
                ]}
                onPress={() => setViewMode("grid")}
              >
                <Ionicons
                  name="grid"
                  size={18}
                  color={viewMode === "grid" ? theme.colors.primary : theme.colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === "list" && styles.activeViewButton,
                ]}
                onPress={() => setViewMode("list")}
              >
                <Ionicons
                  name="list"
                  size={18}
                  color={viewMode === "list" ? theme.colors.primary : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.filterRow}>
          {["all", "facile", "moyen", "difficile"].map((difficulty) => (
            <TouchableOpacity
              key={difficulty}
              style={[
                styles.filterChip,
                selectedDifficulty === difficulty && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedDifficulty(difficulty)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedDifficulty === difficulty && styles.activeFilterText,
                ]}
              >
                {difficulty === "all"
                  ? "All"
                  : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {filteredSubjects.length > 0 ? (
          <FlatList
            data={filteredSubjects}
            renderItem={renderSubjectCard}
            keyExtractor={(item) => item._id}
            numColumns={viewMode === "grid" ? 2 : 1}
            key={viewMode}
            columnWrapperStyle={
              viewMode === "grid"
                ? { justifyContent: "space-between" }
                : undefined
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="school-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>
              {isLoading ? "Loading Subjects..." : "No Subjects Available"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {error 
                ? `Error: ${error}`
                : isLoading 
                ? "Please wait while we fetch the subjects..."
                : `Subjects for series ${series} are coming soon! {isBackendData ? "🌐" : "📱"}`
              }
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
