"use client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../utils/ThemeContext";

interface SubjectProgressCardProps {
  subject: string;
  icon: string;
  progress: number;
  totalTopics: number;
  completedTopics: number;
  onPress: () => void;
}

export default function SubjectProgressCard({
  subject,
  icon,
  progress,
  totalTopics,
  completedTopics,
  onPress,
}: SubjectProgressCardProps) {
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

  const getSubjectColor = () => {
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.info,
      theme.colors.warning,
    ];
    return colors[subject.length % colors.length];
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
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    subjectName: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    progressContainer: {
      marginBottom: theme.spacing.sm,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: theme.spacing.xs,
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
    stats: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
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
          <LinearGradient
            colors={[getSubjectColor(), getSubjectColor() + "80"]}
            style={styles.iconContainer}
          >
            <Ionicons name={icon as any} size={24} color="white" />
          </LinearGradient>
          <Text style={styles.subjectName}>{subject}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[getSubjectColor(), getSubjectColor() + "80"]}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress)}% Complete
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedTopics}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalTopics}</Text>
            <Text style={styles.statLabel}>Total Topics</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {totalTopics - completedTopics}
            </Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
