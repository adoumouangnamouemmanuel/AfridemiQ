"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";

// Mock interactive tools data
const INTERACTIVE_TOOLS = [
  {
    _id: "tool_001",
    name: "Algebra Calculator",
    description:
      "Solve algebraic equations step-by-step with detailed explanations",
    category: "calculator",
    subjectId: "math_001",
    topicIds: ["topic_algebra"],
    icon: "calculator",
    color: "#3B82F6",
    url: "https://example.com/algebra-calculator",
    features: [
      "Step-by-step solutions",
      "Graph plotting",
      "Expression simplification",
    ],
    difficulty: "beginner",
    isOffline: false,
    isPremium: false,
    rating: 4.8,
    usageCount: 15420,
    estimatedTime: 10,
  },
  {
    _id: "tool_002",
    name: "Geometry Visualizer",
    description:
      "Interactive 3D geometry tool for exploring shapes and theorems",
    category: "visualization",
    subjectId: "math_001",
    topicIds: ["topic_geometry"],
    icon: "shapes",
    color: "#10B981",
    url: "https://example.com/geometry-viz",
    features: ["3D visualization", "Interactive proofs", "Measurement tools"],
    difficulty: "intermediate",
    isOffline: true,
    isPremium: false,
    rating: 4.9,
    usageCount: 8930,
    estimatedTime: 15,
  },
  {
    _id: "tool_003",
    name: "Function Grapher",
    description:
      "Plot and analyze mathematical functions with advanced features",
    category: "graphing",
    subjectId: "math_001",
    topicIds: ["topic_functions"],
    icon: "analytics",
    color: "#F59E0B",
    url: "https://example.com/function-grapher",
    features: ["Multiple functions", "Zoom & pan", "Derivative analysis"],
    difficulty: "advanced",
    isOffline: false,
    isPremium: true,
    rating: 4.7,
    usageCount: 5670,
    estimatedTime: 20,
  },
  {
    _id: "tool_004",
    name: "Statistics Simulator",
    description:
      "Simulate statistical experiments and analyze data distributions",
    category: "simulation",
    subjectId: "math_001",
    topicIds: ["topic_statistics"],
    icon: "bar-chart",
    color: "#8B5CF6",
    url: "https://example.com/stats-simulator",
    features: ["Random sampling", "Distribution plots", "Hypothesis testing"],
    difficulty: "intermediate",
    isOffline: true,
    isPremium: false,
    rating: 4.6,
    usageCount: 3240,
    estimatedTime: 25,
  },
  {
    _id: "tool_005",
    name: "Equation Solver",
    description:
      "Solve complex equations with multiple variables and constraints",
    category: "solver",
    subjectId: "math_001",
    topicIds: ["topic_algebra", "topic_calculus"],
    icon: "construct",
    color: "#EF4444",
    url: "https://example.com/equation-solver",
    features: ["System of equations", "Matrix operations", "Optimization"],
    difficulty: "advanced",
    isOffline: false,
    isPremium: true,
    rating: 4.9,
    usageCount: 7890,
    estimatedTime: 30,
  },
  {
    _id: "tool_006",
    name: "Math Quiz Generator",
    description: "Generate custom quizzes based on your learning progress",
    category: "practice",
    subjectId: "math_001",
    topicIds: ["topic_algebra", "topic_geometry"],
    icon: "help-circle",
    color: "#06B6D4",
    url: "https://example.com/quiz-generator",
    features: ["Adaptive difficulty", "Progress tracking", "Instant feedback"],
    difficulty: "beginner",
    isOffline: true,
    isPremium: false,
    rating: 4.5,
    usageCount: 12340,
    estimatedTime: 15,
  },
];

export default function InteractiveToolsScreen() {
  const router = useRouter();
  const { topicId, topicName } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  const categories = [
    "all",
    "calculator",
    "visualization",
    "graphing",
    "simulation",
    "solver",
    "practice",
  ];

  const filteredTools = INTERACTIVE_TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || tool.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleToolPress = (tool: (typeof INTERACTIVE_TOOLS)[0]) => {
    if (tool.isPremium) {
      // TODO: Check premium access
      console.log("Premium tool access required");
    }
    // TODO: Open interactive tool
    console.log(`Open tool: ${tool._id}`);
  };

  const renderToolCard = ({
    item: tool,
  }: {
    item: (typeof INTERACTIVE_TOOLS)[0];
  }) => {
    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => handleToolPress(tool)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[tool.color + "10", tool.color + "05"]}
            style={styles.toolCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.toolHeader}>
              <View
                style={[
                  styles.toolIcon,
                  { backgroundColor: tool.color + "20" },
                ]}
              >
                <Ionicons
                  name={tool.icon as any}
                  size={28}
                  color={tool.color}
                />
              </View>
              <View style={styles.toolBadges}>
                {tool.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="diamond" size={12} color="#F59E0B" />
                  </View>
                )}
                {tool.isOffline && (
                  <View style={styles.offlineBadge}>
                    <Ionicons name="download" size={12} color="#10B981" />
                  </View>
                )}
              </View>
            </View>

            <View style={styles.toolContent}>
              <Text style={styles.toolName}>{tool.name}</Text>
              <Text style={styles.toolDescription} numberOfLines={2}>
                {tool.description}
              </Text>

              <View style={styles.toolFeatures}>
                {tool.features.slice(0, 2).map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
                {tool.features.length > 2 && (
                  <Text style={styles.moreFeatures}>
                    +{tool.features.length - 2}
                  </Text>
                )}
              </View>

              <View style={styles.toolMeta}>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.metaText}>{tool.rating}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="people" size={14} color="#6B7280" />
                    <Text style={styles.metaText}>
                      {tool.usageCount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={14} color="#6B7280" />
                    <Text style={styles.metaText}>{tool.estimatedTime}m</Text>
                  </View>
                </View>

                <View style={styles.difficultyBadge}>
                  <Text style={[styles.difficultyText, { color: tool.color }]}>
                    {tool.difficulty.charAt(0).toUpperCase() +
                      tool.difficulty.slice(1)}
                  </Text>
                </View>
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
      marginBottom: 16,
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
    filtersContainer: {
      marginBottom: 0,
    },
    filterLabel: {
      fontSize: 12,
      color: "#64748B",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 0,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: "#F1F5F9",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    activeFilterChip: {
      backgroundColor: "#3B82F6",
      borderColor: "#3B82F6",
    },
    filterText: {
      fontSize: 12,
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
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    statLabel: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 4,
    },
    toolCard: {
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
      margin: 20,
    },
    toolCardGradient: {
      padding: 20,
      backgroundColor: "white",
    },
    toolHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    toolIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
    },
    toolBadges: {
      flexDirection: "row",
      gap: 8,
    },
    premiumBadge: {
      backgroundColor: "#FEF3C7",
      borderRadius: 12,
      padding: 6,
    },
    offlineBadge: {
      backgroundColor: "#D1FAE5",
      borderRadius: 12,
      padding: 6,
    },
    toolContent: {
      flex: 1,
    },
    toolName: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 8,
    },
    toolDescription: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
      marginBottom: 16,
    },
    toolFeatures: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
      flexWrap: "wrap",
    },
    featureTag: {
      backgroundColor: "#F1F5F9",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    featureText: {
      fontSize: 11,
      color: "#6B7280",
      fontWeight: "500",
      fontFamily: "Inter-Medium",
    },
    moreFeatures: {
      fontSize: 11,
      color: "#9CA3AF",
      fontFamily: "Inter-Regular",
      alignSelf: "center",
    },
    toolMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    metaRow: {
      flexDirection: "row",
      gap: 16,
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
    difficultyBadge: {
      backgroundColor: "#F8FAFC",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    difficultyText: {
      fontSize: 11,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
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
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748B" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Interactive Tools</Text>
            <Text style={styles.subtitle}>
              {topicName} • {filteredTools.length} tools available
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tools..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Category</Text>
          <View style={styles.filterRow}>
            {categories.slice(0, 4).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.activeFilterChip,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedCategory === category && styles.activeFilterText,
                  ]}
                >
                  {category === "all"
                    ? "All"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* <Text style={styles.filterLabel}>Difficulty</Text>
          <View style={styles.filterRow}>
            {difficulties.map((difficulty) => (
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
                    selectedDifficulty === difficulty &&
                      styles.activeFilterText,
                  ]}
                >
                  {difficulty === "all"
                    ? "All"
                    : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View> */}
        </View>
      </View>

      <View style={styles.content}>
        {/* <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{INTERACTIVE_TOOLS.length}</Text>
            <Text style={styles.statLabel}>Total Tools</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {INTERACTIVE_TOOLS.filter((t) => !t.isPremium).length}
            </Text>
            <Text style={styles.statLabel}>Free</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {INTERACTIVE_TOOLS.filter((t) => t.isOffline).length}
            </Text>
            <Text style={styles.statLabel}>Offline</Text>
          </View>
        </View> */}

        {filteredTools.length > 0 ? (
          <FlatList
            data={filteredTools}
            renderItem={renderToolCard}
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
              name="construct-outline"
              size={64}
              color="#E2E8F0"
              style={styles.emptyStateIcon}
            />
            <Text style={styles.emptyStateTitle}>No tools found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "Try adjusting your search terms or filters"
                : "Interactive tools will appear here"}
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
