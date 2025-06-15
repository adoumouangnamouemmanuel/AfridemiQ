"use client";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/ThemeContext";

interface QuizCardProps {
  title: string;
  subject: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: number;
  duration: number;
  completed: boolean;
  xpReward: number;
  popularity: number;
  examRelevance?: number;
  weaknessMatch?: boolean;
  onPress: () => void;
}

export default function QuizCard({
  title,
  subject,
  difficulty,
  questions,
  duration,
  completed,
  xpReward,
  popularity,
  examRelevance = 0,
  weaknessMatch = false,
  onPress,
}: QuizCardProps) {
  const { theme, isDark } = useTheme();

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "Easy":
        return "#4ECDC4";
      case "Medium":
        return "#FFD93D";
      case "Hard":
        return "#FF6B6B";
      default:
        return theme.colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: weaknessMatch ? "#FF6B6B" : theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    titleSection: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    subject: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
    },
    badges: {
      flexDirection: "row",
      gap: 6,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignItems: "center",
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    weaknessBadge: {
      backgroundColor: isDark
        ? "rgba(255,107,107,0.2)"
        : "rgba(255,107,107,0.1)",
    },
    weaknessBadgeText: {
      color: "#FF6B6B",
    },
    relevanceBadge: {
      backgroundColor: isDark ? "rgba(76,175,80,0.2)" : "rgba(76,175,80,0.1)",
    },
    relevanceBadgeText: {
      color: "#4CAF50",
    },
    stats: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginLeft: 4,
      fontFamily: "Inter-Medium",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    difficulty: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    difficultyText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
      fontFamily: "Inter-SemiBold",
    },
    xpReward: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,215,0,0.2)" : "rgba(255,215,0,0.1)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    xpText: {
      fontSize: 14,
      color: "#FFD700",
      fontWeight: "600",
      marginLeft: 6,
      fontFamily: "Inter-SemiBold",
    },
    completedOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(76,175,80,0.1)",
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    completedText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#4CAF50",
      fontFamily: "Inter-Bold",
      marginTop: 8,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={completed}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subject}>{subject}</Text>
        </View>

        <View style={styles.badges}>
          {weaknessMatch && (
            <View style={[styles.badge, styles.weaknessBadge]}>
              <Text style={[styles.badgeText, styles.weaknessBadgeText]}>
                Weakness
              </Text>
            </View>
          )}
          {examRelevance > 80 && (
            <View style={[styles.badge, styles.relevanceBadge]}>
              <Text style={[styles.badgeText, styles.relevanceBadgeText]}>
                High Priority
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons
            name="help-circle-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.statText}>{questions} questions</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons
            name="time-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.statText}>{duration} min</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons
            name="people-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.statText}>{popularity}% took this</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.difficulty}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: getDifficultyColor(),
            }}
          />
          <Text
            style={[styles.difficultyText, { color: getDifficultyColor() }]}
          >
            {difficulty}
          </Text>
        </View>

        <View style={styles.xpReward}>
          <Ionicons name="diamond" size={16} color="#FFD700" />
          <Text style={styles.xpText}>+{xpReward} XP</Text>
        </View>
      </View>

      {completed && (
        <View style={styles.completedOverlay}>
          <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
          <Text style={styles.completedText}>Completed!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
