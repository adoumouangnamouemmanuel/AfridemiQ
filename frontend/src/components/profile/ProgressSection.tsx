"use client";

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import type { UserProfile } from "../../services/user/api.profile.service";

interface ProgressSectionProps {
  user: UserProfile;
  theme: any;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  user,
  theme,
}) => {
  const slideUp = useSharedValue(50);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    slideUp.value = withDelay(300, withSpring(0, { damping: 20 }));
    opacity.value = withDelay(300, withSpring(1));
  }, [opacity, slideUp]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
    opacity: opacity.value,
  }));

  // TODO: Replace with actual API data when detailed analytics endpoint is ready
  const progressData = {
    totalQuizzes: user.progress.totalQuizzes,
    averageScore: Math.round(user.progress.averageScore),
    subjectsMastered: Math.min(user.progress.completedTopics.length, 8), // Assuming 8 total subjects
    totalSubjects: 8,
    weeklyGoal: 5, // Dummy data
    weeklyProgress: 3, // Dummy data
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
      fontFamily: "Inter-Bold",
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    progressGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    progressItem: {
      width: "48%",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      marginBottom: 12,
    },
    progressValue: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.primary,
      marginBottom: 4,
      fontFamily: "Inter-ExtraBold",
    },
    progressLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
      fontFamily: "Inter-Medium",
    },
    goalSection: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    goalInfo: {
      flex: 1,
    },
    goalTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
      fontFamily: "Inter-SemiBold",
    },
    goalProgress: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
    },
    goalButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    goalButtonText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
      fontFamily: "Inter-SemiBold",
    },
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.sectionTitle}>Learning Progress</Text>
      <View style={styles.card}>
        <View style={styles.progressGrid}>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>
              {progressData.totalQuizzes}
            </Text>
            <Text style={styles.progressLabel}>Quizzes Completed</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>
              {progressData.averageScore}%
            </Text>
            <Text style={styles.progressLabel}>Average Score</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>
              {progressData.subjectsMastered}/{progressData.totalSubjects}
            </Text>
            <Text style={styles.progressLabel}>Subjects Mastered</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{user.progress.level}</Text>
            <Text style={styles.progressLabel}>Current Level</Text>
          </View>
        </View>

        <View style={styles.goalSection}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>Weekly Goal</Text>
            <Text style={styles.goalProgress}>
              {progressData.weeklyProgress}/{progressData.weeklyGoal} quizzes
              completed
            </Text>
          </View>
          <TouchableOpacity style={styles.goalButton}>
            <Ionicons name="flag" size={14} color="white" />
            <Text style={styles.goalButtonText}>Update Goal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};
