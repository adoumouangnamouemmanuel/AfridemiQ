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

interface WinsSectionProps {
  user: UserProfile;
  theme: any;
}

interface Win {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  category: "academic" | "streak" | "social" | "milestone";
}

export const AchievementsSection: React.FC<WinsSectionProps> = ({ user, theme }) => {
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

  // TODO: Replace with actual wins data from API when available
  const wins: Win[] = [
    {
      id: "1",
      title: "First Steps",
      description: "Completed your first quiz",
      icon: "footsteps",
      color: "#10B981",
      earned: true,
      earnedDate: "2024-01-15",
      category: "milestone",
    },
    {
      id: "2",
      title: "Week Warrior",
      description: "Maintained a 7-day study streak",
      icon: "flame",
      color: "#F59E0B",
      // earned: user.progress.streak.current >= 7,
      // progress: user.progress.streak.current,
      earned: 2 >= 7, // Assuming 2 is the current streak length
      progress: 5, // Example progress
      maxProgress: 7,
      category: "streak",
    },
    {
      id: "3",
      title: "Quiz Master",
      description: "Completed 50 quizzes",
      icon: "trophy",
      color: "#8B5CF6",
      // earned: user.progress.totalQuizzes >= 50,
      // progress: user.progress.totalQuizzes,

      earned: user.progress.totalQuizzesTaken >= 50,
      progress: user.progress.totalQuizzesTaken,
      maxProgress: 50,
      category: "academic",
    },
    {
      id: "4",
      title: "Perfect Score",
      description: "Achieved 100% on any quiz",
      icon: "star",
      color: "#EF4444",
      earned: user.progress.averageScore >= 100,
      category: "academic",
    },
    {
      id: "5",
      title: "Level Champion",
      description: "Reached level 10",
      icon: "trending-up",
      color: "#3B82F6",
      // earned: user.progress.level >= 10,
      // progress: user.progress.level,

      earned: 1 >= 10,
      progress: 1,
      maxProgress: 10,
      category: "milestone",
    },
    {
      id: "6",
      title: "Badge Collector",
      description: "Earned 15 badges",
      icon: "medal",
      color: "#F97316",
      earned: user.progress.badges.length >= 15,
//       progress: user.progress.badges.length,
      maxProgress: 15,
      category: "milestone",
    },
    {
      id: "7",
      title: "Study Streak",
      description: "30-day study streak",
      icon: "calendar",
      color: "#06B6D4",
      earned: user.progress.streak.longest >= 30,
      progress: user.progress.streak.longest,
      maxProgress: 30,
      category: "streak",
    },
    {
      id: "8",
      title: "Subject Expert",
      description: "Mastered 5 subjects",
      icon: "library",
      color: "#84CC16",
      earned: user.progress.completedTopics.length >= 5,
      progress: user.progress.completedTopics.length,
      maxProgress: 5,
      category: "academic",
    },
  ];

  const earnedWins = wins.filter((w) => w.earned);
  const totalWins = wins.length;
  const completionPercentage = Math.round(
    (earnedWins.length / totalWins) * 100
  );

  // Group wins by category
  const winsByCategory = wins.reduce((acc, win) => {
    if (!acc[win.category]) {
      acc[win.category] = [];
    }
    acc[win.category].push(win);
    return acc;
  }, {} as Record<string, Win[]>);

  const categoryInfo = {
    academic: { title: "Academic Wins", icon: "school", color: "#3B82F6" },
    streak: { title: "Consistency Wins", icon: "flame", color: "#F59E0B" },
    social: { title: "Social Wins", icon: "people", color: "#10B981" },
    milestone: { title: "Milestone Wins", icon: "flag", color: "#8B5CF6" },
  };

  const WinCard: React.FC<{ win: Win; index: number }> = ({ win, index }) => {
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
        width: 160,
        backgroundColor: win.earned
          ? theme.colors.surface
          : theme.colors.background,
        borderRadius: 20,
        padding: 16,
        marginRight: 12,
        alignItems: "center",
        borderWidth: 2,
        borderColor: win.earned ? win.color + "40" : theme.colors.border,
        opacity: win.earned ? 1 : 0.7,
        elevation: win.earned ? 6 : 2,
        shadowColor: win.earned ? win.color : "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: win.earned ? 0.3 : 0.1,
        shadowRadius: 8,
      },
      iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: win.color + (win.earned ? "25" : "15"),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        borderWidth: 2,
        borderColor: win.earned ? win.color + "50" : win.color + "30",
      },
      title: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.colors.text,
        textAlign: "center",
        marginBottom: 6,
        fontFamily: "Inter-Bold",
      },
      description: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        textAlign: "center",
        lineHeight: 14,
        fontFamily: "Inter-Medium",
        marginBottom: 8,
      },
      progressContainer: {
        alignItems: "center",
        width: "100%",
      },
      progressText: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontFamily: "Inter-SemiBold",
        marginBottom: 4,
      },
      progressBar: {
        width: "100%",
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        overflow: "hidden",
      },
      progressFill: {
        height: "100%",
        backgroundColor: win.color,
        borderRadius: 2,
      },
      earnedDate: {
        fontSize: 10,
        color: win.color,
        marginTop: 6,
        fontFamily: "Inter-SemiBold",
        textAlign: "center",
      },
      earnedBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: win.color,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
      },
    });

    const progressPercentage =
      win.progress && win.maxProgress
        ? Math.min((win.progress / win.maxProgress) * 100, 100)
        : 0;

    return (
      <Animated.View style={[cardStyles.card, cardAnimatedStyle]}>
        {win.earned && (
          <View style={cardStyles.earnedBadge}>
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}

        <View style={cardStyles.iconContainer}>
          <Ionicons
            name={win.icon as any}
            size={28}
            color={win.earned ? win.color : theme.colors.textSecondary}
          />
        </View>

        <Text style={cardStyles.title}>{win.title}</Text>
        <Text style={cardStyles.description}>{win.description}</Text>

        {!win.earned && win.progress !== undefined && win.maxProgress && (
          <View style={cardStyles.progressContainer}>
            <Text style={cardStyles.progressText}>
              {win.progress}/{win.maxProgress}
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

        {win.earned && win.earnedDate && (
          <Text style={cardStyles.earnedDate}>
            Won {new Date(win.earnedDate).toLocaleDateString()}
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
    categorySection: {
      marginBottom: 24,
    },
    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    categoryIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    winsGrid: {
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
    todoNote: {
      backgroundColor: theme.colors.warning + "15",
      borderRadius: 12,
      padding: 12,
      marginTop: 16,
      borderWidth: 1,
      borderColor: theme.colors.warning + "30",
    },
    todoText: {
      fontSize: 12,
      color: theme.colors.warning,
      fontFamily: "Inter-Medium",
      textAlign: "center",
    },
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.sectionTitle}>Your Wins 🏆</Text>

      <View style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{earnedWins.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalWins}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completionPercentage}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </View>

      {Object.entries(winsByCategory).map(([category, categoryWins]) => {
        const info = categoryInfo[category as keyof typeof categoryInfo];
        return (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: info.color + "20" },
                ]}
              >
                <Ionicons
                  name={info.icon as any}
                  size={18}
                  color={info.color}
                />
              </View>
              <Text style={styles.categoryTitle}>{info.title}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.winsGrid}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {categoryWins.map((win, index) => (
                <WinCard key={win.id} win={win} index={index} />
              ))}
            </ScrollView>
          </View>
        );
      })}

      <TouchableOpacity style={styles.viewAllButton}>
        <Ionicons name="trophy" size={16} color="white" />
        <Text style={styles.viewAllButtonText}>View All Wins</Text>
      </TouchableOpacity>

      {/* TODO Note */}
      <View style={styles.todoNote}>
        <Text style={styles.todoText}>
          🚧 TODO: Implement dynamic wins system with database integration. Add
          more win categories and personalized achievements based on user
          progress.
        </Text>
      </View>
    </Animated.View>
  );
};
