"use client";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import questionsData from "../data/questions.json";
import subjectsData from "../data/subjects.json";
import topicsData from "../data/topics.json";
import { useTheme } from "../utils/ThemeContext";
import { useUser } from "../utils/UserContext";

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
      {topic.sections?.map((section, index) => (
        <AnimatedCard key={section.id} delay={100 * (index + 1)}>
          <View style={styles.studyCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {/* Theory Content */}
            {section.content.theory.map((item, idx) => (
              <View key={idx} style={styles.theoryItem}>
                {item.type === "text" && (
                  <Text style={styles.theoryText}>{item.content}</Text>
                )}
                {item.type === "formula" && (
                  <View style={styles.formulaContainer}>
                    <Text style={styles.formulaText}>{item.content}</Text>
                    <Text style={styles.formulaExplanation}>{item.explanation}</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Examples */}
            {section.content.examples.map((example, idx) => (
              <View key={idx} style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>{example.title}</Text>
                <Text style={styles.exampleContent}>{example.content}</Text>
                <View style={styles.solutionContainer}>
                  <Text style={styles.solutionLabel}>Solution:</Text>
                  <Text style={styles.solutionText}>{example.solution}</Text>
                </View>
              </View>
            ))}

            {/* Videos */}
            {section.content.videos.map((video, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.videoContainer}
                onPress={() => {
                  // Handle video playback
                  Alert.alert("Video Player", "Video playback coming soon!");
                }}
              >
                <View style={styles.videoThumbnail}>
                  <Ionicons name="play-circle" size={48} color="white" />
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <Text style={styles.videoDuration}>{video.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedCard>
      ))}

      {/* Resources */}
      {topic.resources && (
        <AnimatedCard delay={100 * (topic.sections?.length || 0) + 1}>
          <View style={styles.resourcesCard}>
            <Text style={styles.sectionTitle}>Resources</Text>
            
            {/* Documents */}
            {topic.resources.documents.map((doc, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.resourceItem}
                onPress={() => {
                  // Handle document opening
                  Alert.alert("Document Viewer", "Document viewer coming soon!");
                }}
              >
                <Ionicons name="document-text" size={24} color={theme.colors.primary} />
                <Text style={styles.resourceTitle}>{doc.title}</Text>
              </TouchableOpacity>
            ))}

            {/* Past Papers */}
            {topic.resources.pastPapers.map((paper, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.resourceItem}
                onPress={() => {
                  // Handle past paper opening
                  Alert.alert("Past Paper Viewer", "Past paper viewer coming soon!");
                }}
              >
                <Ionicons name="time" size={24} color={theme.colors.secondary} />
                <Text style={styles.resourceTitle}>{paper.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedCard>
      )}
    </ScrollView>
  );

  const renderPractice = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Exercises */}
      {topic?.practice?.exercises.map((exercise, index) => (
        <AnimatedCard key={exercise.id} delay={100 * (index + 1)}>
          <View style={styles.practiceCard}>
            <Text style={styles.exerciseTitle}>{exercise.title}</Text>
            <Text style={styles.exerciseDifficulty}>
              Difficulty: {exercise.difficulty}
            </Text>
            
            {exercise.questions.map((question, idx) => (
              <View key={idx} style={styles.questionContainer}>
                <Text style={styles.questionText}>{question.question}</Text>
                <View style={styles.solutionContainer}>
                  <Text style={styles.solutionLabel}>Solution:</Text>
                  <Text style={styles.solutionText}>{question.solution}</Text>
                  <Text style={styles.explanationText}>{question.explanation}</Text>
                </View>
              </View>
            ))}
          </View>
        </AnimatedCard>
      ))}

      {/* Quizzes */}
      {topic?.practice?.quizzes.map((quiz, index) => (
        <AnimatedCard key={quiz.id} delay={100 * (topic.practice.exercises.length + index + 1)}>
          <View style={styles.quizCard}>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <TouchableOpacity
              style={styles.startQuizButton}
              onPress={handleStartQuiz}
            >
              <Text style={styles.startQuizButtonText}>Start Quiz</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>
      ))}
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
    theoryItem: {
      marginBottom: theme.spacing.md,
    },
    theoryText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
    },
    formulaContainer: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.sm,
    },
    formulaText: {
      fontSize: 18,
      fontFamily: "monospace",
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: theme.spacing.xs,
    },
    formulaExplanation: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    exampleContainer: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.sm,
    },
    exampleTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    exampleContent: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    solutionContainer: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    solutionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    solutionText: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    explanationText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontStyle: "italic",
    },
    videoContainer: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.sm,
      overflow: "hidden",
    },
    videoThumbnail: {
      width: 120,
      height: 80,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    videoInfo: {
      flex: 1,
      padding: theme.spacing.md,
    },
    videoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    videoDuration: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    resourcesCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    resourceItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    resourceTitle: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: theme.spacing.md,
    },
    exerciseTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    exerciseDifficulty: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    questionContainer: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    questionText: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    quizCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    quizTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    startQuizButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: "center",
    },
    startQuizButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    practiceCard: {
      marginBottom: theme.spacing.md,
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
