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

interface MissionCardProps {
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  icon: string;
  completed: boolean;
  onPress?: () => void;
}

export default function MissionCard({
  title,
  description,
  progress,
  target,
  reward,
  icon,
  completed,
  onPress,
}: MissionCardProps) {
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

  const progressPercentage = Math.min((progress / target) * 100, 100);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: completed ? theme.colors.success : theme.colors.border,
      opacity: completed ? 0.8 : 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    completedIcon: {
      backgroundColor: theme.colors.success,
      borderRadius: 16,
      padding: 4,
    },
    progressContainer: {
      marginVertical: theme.spacing.sm,
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
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    reward: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary + "20",
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
    },
    rewardText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
      marginLeft: theme.spacing.xs,
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
        disabled={completed}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={
              completed
                ? [theme.colors.success, theme.colors.success + "80"]
                : [theme.colors.primary, theme.colors.secondary]
            }
            style={styles.iconContainer}
          >
            <Ionicons name={icon as any} size={24} color="white" />
          </LinearGradient>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {completed && (
            <View style={styles.completedIcon}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>

        {!completed && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress} / {target} completed
            </Text>
          </View>
        )}

        <View style={styles.reward}>
          <Ionicons name="gift" size={16} color={theme.colors.primary} />
          <Text style={styles.rewardText}>{reward}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
