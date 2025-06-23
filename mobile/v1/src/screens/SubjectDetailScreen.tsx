"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import subjectsData from "../data/subjects.json";
import topicsData from "../data/topics.json";

export default function SubjectDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState("topics");

  const subject = subjectsData.find((s) => s.id === id);
  const topics = topicsData.filter((t) => t.subjectId === id);

  if (!subject) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Subject not found</Text>
      </SafeAreaView>
    );
  }

  const completedTopics = topics.filter((t) => t.completed).length;
  const totalTopics = topics.length;
  const overallProgress =
    totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  const tabs = [
    { id: "topics", label: "Topics", icon: "list" },
    { id: "notes", label: "Notes", icon: "document-text" },
    { id: "videos", label: "Videos", icon: "play-circle" },
  ];

  const handleTopicPress = (topicId: string) => {
    router.push(`/(routes)/topic/${topicId}`);
  };

  const TopicCard = ({ topic, index }: { topic: any; index: number }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
      scale.value = withDelay(index * 100, withSpring(1));
      opacity.value = withDelay(index * 100, withSpring(1));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const getDifficultyColor = () => {
      switch (topic.difficulty) {
        case "Easy":
          return theme.colors.success;
        case "Medium":
          return theme.colors.warning;
        case "Hard":
          return theme.colors.error;
        default:
          return theme.colors.primary;
      }
    };

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={styles.topicCard}
          onPress={() => handleTopicPress(topic.id)}
        >
          <View style={styles.topicHeader}>
            <View style={styles.topicInfo}>
              <Text style={styles.topicTitle}>{topic.name}</Text>
              <Text style={styles.topicDescription}>{topic.description}</Text>
            </View>
            {topic.completed && (
              <View style={styles.completedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.success}
                />
              </View>
            )}
          </View>

          <View style={styles.topicDetails}>
            <View style={styles.topicDetail}>
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.topicDetailText}>
                {topic.estimatedTime} min
              </Text>
            </View>

            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor() + "20" },
              ]}
            >
              <Text
                style={[styles.difficultyText, { color: getDifficultyColor() }]}
              >
                {topic.difficulty}
              </Text>
            </View>
          </View>

          {topic.progress > 0 && !topic.completed && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={[styles.progressFill, { width: `${topic.progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {topic.progress}% complete
              </Text>
            </View>
          )}
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
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    backButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.md,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      flex: 1,
    },
    subjectCard: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    subjectIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    subjectName: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
      marginBottom: theme.spacing.sm,
    },
    subjectDescription: {
      fontSize: 16,
      color: "rgba(255,255,255,0.8)",
      marginBottom: theme.spacing.lg,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
    statLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      marginTop: 4,
    },
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 4,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
    },
    tabIcon: {
      marginRight: theme.spacing.xs,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text,
    },
    activeTabText: {
      color: "white",
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    topicCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    topicHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.sm,
    },
    topicInfo: {
      flex: 1,
    },
    topicTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    topicDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    completedBadge: {
      marginLeft: theme.spacing.sm,
    },
    topicDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    topicDetail: {
      flexDirection: "row",
      alignItems: "center",
    },
    topicDetailText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: "600",
    },
    progressContainer: {
      marginTop: theme.spacing.sm,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: "hidden",
      marginBottom: 4,
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "right",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: theme.spacing.xxl,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
  });

  const renderContent = () => {
    switch (selectedTab) {
      case "topics":
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {topics.map((topic, index) => (
              <TopicCard key={topic.id} topic={topic} index={index} />
            ))}
          </ScrollView>
        );
      case "notes":
        return (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>Study notes coming soon!</Text>
          </View>
        );
      case "videos":
        return (
          <View style={styles.emptyState}>
            <Ionicons
              name="play-circle-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>
              Video lessons coming soon!
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subject.name}</Text>
        </View>

        <LinearGradient
          colors={[subject.color, subject.color + "80"]}
          style={styles.subjectCard}
        >
          <View style={styles.subjectIcon}>
            <Ionicons name={subject.icon as any} size={32} color="white" />
          </View>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <Text style={styles.subjectDescription}>{subject.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(overallProgress)}%
              </Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedTopics}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalTopics}</Text>
              <Text style={styles.statLabel}>Total Topics</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={selectedTab === tab.id ? "white" : theme.colors.text}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}