"use client";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../utils/ThemeContext";

interface QuizCardProps {
  title: string;
  subject: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: number;
  duration: number;
  completed?: boolean;
  onPress: () => void;
}

export default function QuizCard({
  title,
  subject,
  difficulty,
  questions,
  duration,
  completed = false,
  onPress,
}: QuizCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
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

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    completedIcon: {
      backgroundColor: theme.colors.success,
      borderRadius: 12,
      padding: 4,
    },
    subject: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    details: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    detailText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    difficulty: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: getDifficultyColor() + "20",
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: "600",
      color: getDifficultyColor(),
    },
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {completed && (
            <View style={styles.completedIcon}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>

        <Text style={styles.subject}>{subject}</Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons
              name="help-circle-outline"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.detailText}>{questions} questions</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.detailText}>{duration} min</Text>
          </View>

          <View style={styles.difficulty}>
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
