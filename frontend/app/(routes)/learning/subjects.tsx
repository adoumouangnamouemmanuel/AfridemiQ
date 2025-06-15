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
    hasTopics: true, // Only Math has topics for now
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

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  const filteredSubjects = useMemo(() => {
    if (selectedDifficulty === "all") return SUBJECTS;
    return SUBJECTS.filter(
      (subject) => subject.difficulty === selectedDifficulty
    );
  }, [selectedDifficulty]);

  const handleSubjectPress = (subject: (typeof SUBJECTS)[0]) => {
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
    item: (typeof SUBJECTS)[0];
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
      padding: 20,
    },
    subjectCard: {
      width: (SCREEN_WIDTH - 60) / 2,
      marginBottom: 16,
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
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
      </View>
    </SafeAreaView>
  );
}
