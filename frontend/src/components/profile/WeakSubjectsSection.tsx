"use client";

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import type { UserProfile } from "../../services/user/api.profile.service";

interface WeakSubjectsSectionProps {
  user: UserProfile;
  theme: any;
}

export const WeakSubjectsSection: React.FC<WeakSubjectsSectionProps> = ({
  user,
  theme,
}) => {
  const slideUp = useSharedValue(50);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    slideUp.value = withDelay(400, withSpring(0, { damping: 20 }));
    opacity.value = withDelay(400, withSpring(1));
  }, [opacity, slideUp]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
    opacity: opacity.value,
  }));

  // Use actual weak subjects or fallback to dummy data
  const weakSubjects =
    user.progress.weakSubjects.length > 0
      ? user.progress.weakSubjects
      : ["Physics", "Chemistry"]; // Dummy fallback

  const handlePracticeSubject = (subject: string) => {
    // TODO: Navigate to practice screen for specific subject
    console.log(`Practice ${subject}`);
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
    emptyState: {
      alignItems: "center",
      paddingVertical: 32,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.success + "20",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      fontFamily: "Inter-Medium",
    },
    subjectItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      marginBottom: 12,
    },
    subjectIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.error + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    subjectInfo: {
      flex: 1,
    },
    subjectName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
      fontFamily: "Inter-SemiBold",
    },
    subjectScore: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
    },
    practiceButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    practiceButtonText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
      fontFamily: "Inter-SemiBold",
    },
  });

  if (weakSubjects.length === 0) {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={styles.sectionTitle}>Areas for Improvement</Text>
        <View style={styles.card}>
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-circle"
                size={32}
                color={theme.colors.success}
              />
            </View>
            <Text style={styles.emptyTitle}>Great Job!</Text>
            <Text style={styles.emptySubtitle}>
              You&apos;re performing well in all subjects. Keep up the excellent
              work!
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.sectionTitle}>Areas for Improvement</Text>
      <View style={styles.card}>
        {weakSubjects.map((subject, index) => (
          <View key={index} style={styles.subjectItem}>
            <View style={styles.subjectIcon}>
              <Ionicons
                name="trending-down"
                size={20}
                color={theme.colors.error}
              />
            </View>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{subject}</Text>
              <Text style={styles.subjectScore}>Needs more practice</Text>
            </View>
            <TouchableOpacity
              style={styles.practiceButton}
              onPress={() => handlePracticeSubject(subject)}
            >
              <Ionicons name="play" size={12} color="white" />
              <Text style={styles.practiceButtonText}>Practice</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};