"use client";

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock data - replace with actual API calls
const mockAssessments = [
  {
    id: "1",
    title: "Mathematics Quiz",
    description: "Test your algebra and geometry skills",
    format: "quiz",
    difficulty: "medium",
    totalQuestions: 15,
    timeLimit: 900,
    subject: "Mathematics",
    topics: ["Algebra", "Geometry"],
    averageScore: 78,
    totalAttempts: 1250,
    isActive: true,
  },
  {
    id: "2",
    title: "Physics Challenge",
    description: "Mechanics and thermodynamics assessment",
    format: "challenge",
    difficulty: "hard",
    totalQuestions: 20,
    timeLimit: 1200,
    subject: "Physics",
    topics: ["Mechanics", "Thermodynamics"],
    averageScore: 65,
    totalAttempts: 890,
    isActive: true,
  },
  {
    id: "3",
    title: "Chemistry Practice",
    description: "Organic chemistry fundamentals",
    format: "practice",
    difficulty: "easy",
    totalQuestions: 10,
    timeLimit: 600,
    subject: "Chemistry",
    topics: ["Organic Chemistry"],
    averageScore: 85,
    totalAttempts: 2100,
    isActive: true,
  },
];

const mockSubjects = [
  { id: "1", name: "Mathematics", icon: "calculator", color: "#3B82F6" },
  { id: "2", name: "Physics", icon: "planet", color: "#8B5CF6" },
  { id: "3", name: "Chemistry", icon: "flask", color: "#10B981" },
  { id: "4", name: "Biology", icon: "leaf", color: "#F59E0B" },
];

interface AssessmentCardProps {
  assessment: (typeof mockAssessments)[0];
  onPress: () => void;
}

function AssessmentCard({ assessment, onPress }: AssessmentCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "hard":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "quiz":
        return "help-circle";
      case "challenge":
        return "trophy";
      case "practice":
        return "school";
      default:
        return "document-text";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const difficultyColor = getDifficultyColor(assessment.difficulty);

  return (
    <TouchableOpacity onPress={onPress} style={styles.assessmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <View style={styles.titleRow}>
            <Ionicons
              name={getFormatIcon(assessment.format) as any}
              size={20}
              color="#6366F1"
            />
            <Text style={styles.cardTitle}>{assessment.title}</Text>
          </View>
          <Text style={styles.cardDescription}>{assessment.description}</Text>
        </View>

        <View style={styles.difficultyBadgeContainer}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColor + "20" },
            ]}
          >
            <Text style={[styles.difficultyText, { color: difficultyColor }]}>
              {assessment.difficulty}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardMetrics}>
        <View style={styles.metricsLeft}>
          <View style={styles.metricItem}>
            <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.metricText}>
              {assessment.totalQuestions} questions
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.metricText}>
              {formatTime(assessment.timeLimit)}
            </Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.scoreText}>{assessment.averageScore}%</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.topicsContainer}>
          {assessment.topics.slice(0, 2).map((topic, index) => (
            <View key={index} style={styles.topicTag}>
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
          {assessment.topics.length > 2 && (
            <View style={styles.moreTopicsTag}>
              <Text style={styles.moreTopicsText}>
                +{assessment.topics.length - 2}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.attemptsText}>
          {assessment.totalAttempts.toLocaleString()} attempts
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AssessmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );

  const filteredAssessments = mockAssessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject =
      !selectedSubject || assessment.subject === selectedSubject;
    const matchesDifficulty =
      !selectedDifficulty || assessment.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const handleAssessmentPress = (assessment: (typeof mockAssessments)[0]) => {
    // TODO: Navigate to specific assessment type
    router.push("/(routes)/assessments/quiz");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assessments</Text>
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assessments..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Subject Filter */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                !selectedSubject && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedSubject(null)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  !selectedSubject && styles.filterButtonTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {mockSubjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={[
                  styles.filterButton,
                  styles.subjectFilterButton,
                  selectedSubject === subject.name && styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedSubject(
                    selectedSubject === subject.name ? null : subject.name
                  )
                }
              >
                <Ionicons
                  name={subject.icon as any}
                  size={16}
                  color={
                    selectedSubject === subject.name ? "white" : subject.color
                  }
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    styles.subjectFilterText,
                    selectedSubject === subject.name &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardLeft]}>
              <Text style={styles.statValue}>{mockAssessments.length}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: "#10B981" }]}>12</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={[styles.statCard, styles.statCardRight]}>
              <Text style={[styles.statValue, { color: "#F59E0B" }]}>78%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>
        </View>

        {/* Difficulty Filter */}
        {/* <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Difficulty</Text>
          <View style={styles.difficultyFilters}>
            {["easy", "medium", "hard"].map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterButton,
                  selectedDifficulty === difficulty &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedDifficulty(
                    selectedDifficulty === difficulty ? null : difficulty
                  )
                }
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    styles.capitalizeText,
                    selectedDifficulty === difficulty &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  {difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* Assessments List */}
        <View style={styles.assessmentsSection}>
          <View style={styles.assessmentsHeader}>
            <Text style={styles.assessmentsTitle}>
              Assessments ({filteredAssessments.length})
            </Text>
          </View>

          {filteredAssessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onPress={() => handleAssessmentPress(assessment)}
            />
          ))}

          {filteredAssessments.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyStateTitle}>No assessments found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  // Header styles
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: "#111827",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  // Stats section
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    flex: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 4,
  },
  statCardLeft: {
    marginLeft: 0,
  },
  statCardRight: {
    marginRight: 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  // Filter sections
  filterSection: {
    paddingHorizontal: 0,
    marginTop: 10,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: "row",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  filterButtonText: {
    fontWeight: "600",
    color: "#374151",
  },
  filterButtonTextActive: {
    color: "white",
  },
  subjectFilterButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectFilterText: {
    marginLeft: 8,
  },
  difficultyFilters: {
    flexDirection: "row",
  },
  capitalizeText: {
    textTransform: "capitalize",
  },
  // Assessments section
  assessmentsSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  assessmentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  assessmentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  // Assessment card styles
  assessmentCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  cardDescription: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  difficultyBadgeContainer: {
    marginLeft: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  cardMetrics: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metricText: {
    color: "#6B7280",
    fontSize: 14,
    marginLeft: 4,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  topicTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  topicText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "500",
  },
  moreTopicsTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moreTopicsText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
  attemptsText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    color: "#9CA3AF",
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
  },
  emptyStateSubtitle: {
    color: "#D1D5DB",
    textAlign: "center",
    marginTop: 8,
  },
});
