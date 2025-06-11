"use client";

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import type { UserProfile } from "../../services/user/api.profile.service";

interface AchievementsSectionProps {
  user: UserProfile;
  theme: any;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  user,
  theme,
}) => {
  const slideUp = useSharedValue(50);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    slideUp.value = withDelay(200, withSpring(0, { damping: 20 }));
    opacity.value = withDelay(200, withSpring(1));
  }, [opacity, slideUp]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
    opacity: opacity.value,
  }));

  // TODO: Replace with actual achievements data from API when available
  const achievements: Achievement[] = [
    {
      id: "1",
      title: "First Steps",
      description: "Complete your first quiz",
      icon: "footsteps",
      color: "#10B981",
      earned: true,
      earnedDate: "2024-01-15",
    },
    {
      id: "2",
      title: "Streak Master",
      description: "Maintain a 7-day study streak",
      icon: "flame",
      color: "#F59E0B",
      earned: user.progress.streak.current >= 7,
      progress: user.progress.streak.current,
      maxProgress: 7,
    },
    {
      id: "3",
      title: "Quiz Champion",
      description: "Complete 50 quizzes",
      icon: "trophy",
      color: "#8B5CF6",
      earned: user.progress.totalQuizzes >= 50,
      progress: user.progress.totalQuizzes,
      maxProgress: 50,
    },
    {
      id: "4",
      title: "Perfect Score",
      description: "Get 100% on any quiz",
      icon: "star",
      color: "#EF4444",
      earned: user.progress.averageScore >= 100,
    },
    {
      id: "5",
      title: "Level Up",
      description: "Reach level 5",
      icon: "trending-up",
      color: "#3B82F6",
      earned: user.progress.level >= 5,
      progress: user.progress.level,
      maxProgress: 5,
    },
    {
      id: "6",
      title: "Badge Collector",
      description: "Earn 10 badges",
      icon: "medal",
      color: "#F97316",
      earned: user.progress.badges.length >= 10,
      progress: user.progress.badges.length,
      maxProgress: 10,
    },
  ];

  const earnedAchievements = achievements.filter((a) => a.earned);
  const totalAchievements = achievements.length;
  const completionPercentage = Math.round(
    (earnedAchievements.length / totalAchievements) * 100
  );

  const AchievementCard: React.FC<{
    achievement: Achievement;
    index: number;
  }> = ({ achievement, index }) => {
    const cardScale = useSharedValue(0.9);
    const cardOpacity = useSharedValue(0);

    React.useEffect(() => {
      cardScale.value = withDelay(index * 100, withSpring(1, { damping: 15 }));
      cardOpacity.value = withDelay(index * 100, withSpring(1));
    }, [cardOpacity, cardScale, index]);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
      opacity: cardOpacity.value,
    }));

    const cardStyles = StyleSheet.create({
      card: {
        width: 140,
        backgroundColor: achievement.earned
          ? theme.colors.surface
          : theme.colors.background,
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        alignItems: "center",
        borderWidth: 2,
        borderColor: achievement.earned
          ? achievement.color + "40"
          : theme.colors.border,
        opacity: achievement.earned ? 1 : 0.6,
      },
      iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: achievement.color + (achievement.earned ? "20" : "10"),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
      },
      title: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.colors.text,
        textAlign: "center",
        marginBottom: 4,
        fontFamily: "Inter-SemiBold",
      },
      description: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        textAlign: "center",
        lineHeight: 14,
        fontFamily: "Inter-Medium",
      },
      progressContainer: {
        marginTop: 8,
        alignItems: "center",
      },
      progressText: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontFamily: "Inter-Medium",
      },
      progressBar: {
        width: "100%",
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        marginTop: 4,
        overflow: "hidden",
      },
      progressFill: {
        height: "100%",
        backgroundColor: achievement.color,
        borderRadius: 2,
      },
      earnedDate: {
        fontSize: 10,
        color: achievement.color,
        marginTop: 4,
        fontFamily: "Inter-Medium",
      },
    });

    const progressPercentage =
      achievement.progress && achievement.maxProgress
        ? Math.min((achievement.progress / achievement.maxProgress) * 100, 100)
        : 0;

    return (
      <Animated.View style={[cardStyles.card, cardAnimatedStyle]}>
        <View style={cardStyles.iconContainer}>
          <Ionicons
            name={achievement.icon as any}
            size={24}
            color={
              achievement.earned
                ? achievement.color
                : theme.colors.textSecondary
            }
          />
        </View>
        <Text style={cardStyles.title}>{achievement.title}</Text>
        <Text style={cardStyles.description}>{achievement.description}</Text>

        {!achievement.earned &&
          achievement.progress !== undefined &&
          achievement.maxProgress && (
            <View style={cardStyles.progressContainer}>
              <Text style={cardStyles.progressText}>
                {achievement.progress}/{achievement.maxProgress}
              </Text>
              <View style={cardStyles.progressBar}>
                <View
                  style={[
                    cardStyles.progressFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
            </View>
          )}

        {achievement.earned && achievement.earnedDate && (
          <Text style={cardStyles.earnedDate}>
            Earned {new Date(achievement.earnedDate).toLocaleDateString()}
          </Text>
        )}
      </Animated.View>
    );
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
    statsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    statsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text,
      fontFamily: "Inter-ExtraBold",
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontFamily: "Inter-Medium",
    },
    achievementsGrid: {
      paddingLeft: 20,
    },
    viewAllButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 20,
      marginTop: 16,
    },
    viewAllButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
      fontFamily: "Inter-SemiBold",
    },
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.sectionTitle}>Achievements</Text>

      <View style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{earnedAchievements.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalAchievements}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completionPercentage}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.achievementsGrid}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {achievements.map((achievement, index) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            index={index}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.viewAllButton}>
        <Ionicons name="grid" size={16} color="white" />
        <Text style={styles.viewAllButtonText}>View All Achievements</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};