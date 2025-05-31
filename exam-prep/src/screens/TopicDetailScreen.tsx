"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../utils/ThemeContext";
import { useUser } from "../utils/UserContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import topicsData from "../data/topics.json";
import subjectsData from "../data/subjects.json";
import questionsData from "../data/questions.json";

export default function TopicDetailScreen() {
  const { theme } = useTheme();
  const { addXP } = useUser();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState("overview");

  const topic = topicsData.find((t) => t.id === id);
  const subject = topic
    ? subjectsData.find((s) => s.id === topic.subjectId)
    : null;
  const topicQuestions = questionsData.filter((q) => q.topicId === id);

  if (!topic || !subject) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Topic not found</Text>
      </SafeAreaView>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "information-circle" },
    { id: "study", label: "Study", icon: "book" },
    { id: "practice", label: "Practice", icon: "fitness" },
  ];

  const handleStartQuiz = () => {
    if (topicQuestions.length === 0) {
      Alert.alert(
        "No Questions Available",
        "Questions for this topic are coming soon!"
      );
      return;
    }
    router.push(`/(routes)/quiz/${topic.id}`);
  };

  const handleMarkComplete = () => {
    Alert.alert(
      "Mark as Complete",
      "Are you sure you want to mark this topic as complete?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: () => {
            addXP(50);
            Alert.alert(
              "Congratulations! 🎉",
              "You've completed this topic and earned 50 XP!"
            );
          },
        },
      ]
    );
  };

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
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard delay={100}>
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>About This Topic</Text>
          <Text style={styles.description}>{topic.description}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons
                name="time-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {topic.estimatedTime} minutes
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons
                name="bar-chart-outline"
                size={20}
                color={getDifficultyColor()}
              />
              <Text style={styles.detailLabel}>Difficulty</Text>
              <Text
                style={[styles.detailValue, { color: getDifficultyColor() }]}
              >
                {topic.difficulty}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={theme.colors.info}
              />
              <Text style={styles.detailLabel}>Questions</Text>
              <Text style={styles.detailValue}>
                {topicQuestions.length} available
              </Text>
            </View>
          </View>
        </View>
      </AnimatedCard>

      <AnimatedCard delay={200}>
        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={[styles.progressFill, { width: `${topic.progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{topic.progress}% Complete</Text>
          </View>

          {topic.completed ? (
            <View style={styles.completedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.colors.success}
              />
              <Text style={styles.completedText}>Completed! 🎉</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleMarkComplete}
            >
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedCard>
    </ScrollView>
  );

  const renderStudy = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard delay={100}>
        <View style={styles.studyCard}>
          <Ionicons
            name="book-outline"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={styles.studyTitle}>Study Materials</Text>
          <Text style={styles.studyDescription}>
            Comprehensive study materials for {topic.name} are being prepared.
          </Text>
          <TouchableOpacity style={styles.comingSoonButton} disabled>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </TouchableOpacity>
        </View>
      </AnimatedCard>

      <AnimatedCard delay={200}>
        <View style={styles.studyCard}>
          <Ionicons
            name="play-circle-outline"
            size={48}
            color={theme.colors.secondary}
          />
          <Text style={styles.studyTitle}>Video Lessons</Text>
          <Text style={styles.studyDescription}>
            Interactive video lessons to help you master {topic.name}.
          </Text>
          <TouchableOpacity style={styles.comingSoonButton} disabled>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </TouchableOpacity>
        </View>
      </AnimatedCard>
    </ScrollView>
  );

  const renderPractice = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard delay={100}>
        <View style={styles.practiceCard}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.quizCard}
          >
            <Ionicons name="help-circle" size={48} color="white" />
            <Text style={styles.quizTitle}>Topic Quiz</Text>
            <Text style={styles.quizDescription}>
              Test your knowledge with {topicQuestions.length} questions
            </Text>
            <TouchableOpacity
              style={styles.startQuizButton}
              onPress={handleStartQuiz}
            >
              <Text style={styles.startQuizText}>Start Quiz</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </AnimatedCard>

      <AnimatedCard delay={200}>
        <View style={styles.practiceCard}>
          <View style={styles.flashcardCard}>
            <Ionicons
              name="layers-outline"
              size={48}
              color={theme.colors.accent}
            />
            <Text style={styles.flashcardTitle}>Flashcards</Text>
            <Text style={styles.flashcardDescription}>
              Review key concepts with interactive flashcards
            </Text>
            <TouchableOpacity style={styles.comingSoonButton} disabled>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedCard>
    </ScrollView>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case "overview":
        return renderOverview();
      case "study":
        return renderStudy();
      case "practice":
        return renderPractice();
      default:
        return null;
    }
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
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    topicCard: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    topicHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    topicIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    topicInfo: {
      flex: 1,
    },
    topicName: {
      fontSize: 22,
      fontWeight: "bold",
      color: "white",
    },
    subjectName: {
      fontSize: 14,
      color: "rgba(255,255,255,0.8)",
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
    infoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 24,
      marginBottom: theme.spacing.lg,
    },
    detailsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    detailItem: {
      alignItems: "center",
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: 2,
    },
    progressCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    progressContainer: {
      marginBottom: theme.spacing.lg,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: theme.spacing.sm,
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    completedBadge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.success + "20",
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    completedText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.success,
      marginLeft: theme.spacing.sm,
    },
    completeButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    completeButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    studyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    studyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    studyDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: theme.spacing.lg,
    },
    comingSoonButton: {
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    comingSoonText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: "500",
    },
    practiceCard: {
      marginBottom: theme.spacing.md,
    },
    quizCard: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      alignItems: "center",
    },
    quizTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    quizDescription: {
      fontSize: 14,
      color: "rgba(255,255,255,0.8)",
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    startQuizButton: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
    },
    startQuizText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    flashcardCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    flashcardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    flashcardDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: theme.spacing.lg,
    },
  });

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
          style={styles.topicCard}
        >
          <View style={styles.topicHeader}>
            <View style={styles.topicIcon}>
              <Ionicons name={subject.icon as any} size={24} color="white" />
            </View>
            <View style={styles.topicInfo}>
              <Text style={styles.topicName}>{topic.name}</Text>
              <Text style={styles.subjectName}>{subject.name}</Text>
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
