"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../utils/ThemeContext";
import { useUser } from "../utils/UserContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import SubjectProgressCard from "../components/SubjectProgressCard";
import subjectsData from "../data/subjects.json";
import topicsData from "../data/topics.json";

export default function StudyScreen() {
  const { theme } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Subjects", icon: "apps" },
    { id: "in_progress", label: "In Progress", icon: "play-circle" },
    { id: "completed", label: "Completed", icon: "checkmark-circle" },
    { id: "not_started", label: "Not Started", icon: "ellipse-outline" },
  ];

  const getSubjectProgress = (subjectId: string) => {
    const subjectTopics = topicsData.filter(
      (topic) => topic.subjectId === subjectId
    );
    const completedTopics = subjectTopics.filter((topic) => topic.completed);
    const totalTopics = subjectTopics?.length;
    const progress =
      totalTopics > 0 ? (completedTopics?.length / totalTopics) * 100 : 0;

    return {
      progress,
      totalTopics,
      completedTopics: completedTopics?.length,
    };
  };

  const getFilteredSubjects = () => {
    let filtered = subjectsData.filter((subject) => {
      // Filter by exam
      if (user?.selectedExam && !subject.examIds.includes(user.selectedExam)) {
        return false;
      }

      // Filter by search query
      if (
        searchQuery &&
        !subject.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    // Filter by progress status
    if (selectedFilter !== "all") {
      filtered = filtered.filter((subject) => {
        const { progress } = getSubjectProgress(subject.id);

        switch (selectedFilter) {
          case "completed":
            return progress === 100;
          case "in_progress":
            return progress > 0 && progress < 100;
          case "not_started":
            return progress === 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const handleSubjectPress = (subjectId: string) => {
    router.push(`/(routes)/subject/${subjectId}`);
  };

  const AnimatedCard = ({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) => {
    const translateY = useSharedValue(50);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
      translateY.value = withDelay(delay, withSpring(0));
      opacity.value = withDelay(delay, withSpring(1));
    }, [delay, opacity, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: theme.spacing.md,
    },
    filtersContainer: {
      marginBottom: theme.spacing.lg,
    },
    filtersScroll: {
      paddingHorizontal: theme.spacing.lg,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterIcon: {
      marginRight: theme.spacing.xs,
    },
    filterText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text,
    },
    filterTextActive: {
      color: "white",
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.xs,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: theme.spacing.xxl,
    },
    emptyStateIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });

  const filteredSubjects = getFilteredSubjects();

  // Calculate overall stats
  const totalSubjects = subjectsData.filter((s) =>
    user?.selectedExam ? s.examIds.includes(user.selectedExam) : true
  )?.length;
  const completedSubjects = filteredSubjects.filter(
    (s) => getSubjectProgress(s.id).progress === 100
  )?.length;
  const inProgressSubjects = filteredSubjects.filter((s) => {
    const progress = getSubjectProgress(s.id).progress;
    return progress > 0 && progress < 100;
  })?.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study</Text>
        <Text style={styles.subtitle}>
          Master your subjects with interactive lessons and quizzes
        </Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={
                  selectedFilter === filter.id ? "white" : theme.colors.text
                }
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedCard delay={100}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalSubjects}</Text>
              <Text style={styles.statLabel}>Total Subjects</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedSubjects}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{inProgressSubjects}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>
        </AnimatedCard>

        <Text style={styles.sectionTitle}>Your Subjects</Text>

        {filteredSubjects?.length === 0 ? (
          <AnimatedCard delay={200}>
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons
                  name="book-outline"
                  size={64}
                  color={theme.colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyStateText}>No subjects found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          </AnimatedCard>
        ) : (
          filteredSubjects.map((subject, index) => {
            const subjectStats = getSubjectProgress(subject.id);
            return (
              <AnimatedCard key={subject.id} delay={200 + index * 100}>
                <SubjectProgressCard
                  subject={subject.name}
                  icon={subject.icon}
                  progress={subjectStats.progress}
                  totalTopics={subjectStats.totalTopics}
                  completedTopics={subjectStats.completedTopics}
                  onPress={() => handleSubjectPress(subject.id)}
                />
              </AnimatedCard>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}