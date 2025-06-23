"use client";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../utils/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ExerciseCardProps {
  exercise: {
    id: string;
    title: string;
    subject: string;
    topic: string;
    questions: number;
    duration: number;
    difficulty: string;
    type: string;
    completed: boolean;
    score?: number;
    popularity: number;
  };
  onPress: () => void;
}

export default function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  const { theme, isDark } = useTheme();

  const getDifficultyColor = () => {
    switch (exercise.difficulty) {
      case "Easy":
        return "#4CAF50";
      case "Medium":
        return "#FF9800";
      case "Hard":
        return "#F44336";
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTypeIcon = () => {
    switch (exercise.type) {
      case "Quick Practice":
        return "flash";
      case "Topic Practice":
        return "book";
      case "Speed Test":
        return "timer";
      case "Topic Quiz":
        return "help-circle";
      default:
        return "create";
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      width: (SCREEN_WIDTH - 64) / 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 3,
      marginBottom: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    typeIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    completedBadge: {
      backgroundColor: "#4CAF50",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    completedText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    title: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      marginBottom: 6,
      lineHeight: 20,
    },
    subjectTopic: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
      marginBottom: 12,
    },
    stats: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    difficulty: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: getDifficultyColor() + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    difficultyDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: getDifficultyColor(),
      marginRight: 6,
    },
    difficultyText: {
      fontSize: 11,
      fontWeight: "600",
      color: getDifficultyColor(),
      fontFamily: "Inter-SemiBold",
    },
    popularity: {
      flexDirection: "row",
      alignItems: "center",
    },
    popularityText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginLeft: 4,
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <LinearGradient
          colors={[getDifficultyColor(), getDifficultyColor() + "80"]}
          style={styles.typeIconContainer}
        >
          <Ionicons name={getTypeIcon() as any} size={18} color="white" />
        </LinearGradient>
        {exercise.completed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Done</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{exercise.title}</Text>
      <Text style={styles.subjectTopic}>
        {exercise.subject} • {exercise.topic}
      </Text>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{exercise.questions}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{exercise.duration}m</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.difficulty}>
          <View style={styles.difficultyDot} />
          <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
        </View>
        <View style={styles.popularity}>
          <Ionicons name="heart" size={12} color={theme.colors.textSecondary} />
          <Text style={styles.popularityText}>{exercise.popularity}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
