"use client";

import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../utils/ThemeContext";

interface XPBarProps {
  currentXP: number;
  level: number;
  showLevel?: boolean;
}

export default function XPBar({
  currentXP,
  level,
  showLevel = true,
}: XPBarProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  const xpForCurrentLevel = (level - 1) * 1000;
  const xpForNextLevel = level * 1000;
  const progressPercentage = ((currentXP - xpForCurrentLevel) / 1000) * 100;

  useEffect(() => {
    progress.value = withTiming(progressPercentage / 100, { duration: 1000 });
    scale.value = withSpring(1.05, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });
  }, [currentXP]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const styles = StyleSheet.create({
    container: {
      marginVertical: theme.spacing.sm,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    levelText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    xpText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    progressContainer: {
      height: 12,
      backgroundColor: theme.colors.border,
      borderRadius: 6,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      borderRadius: 6,
    },
    progressText: {
      textAlign: "center",
      marginTop: theme.spacing.xs,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {showLevel && (
        <View style={styles.header}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.xpText}>{currentXP} XP</Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <Animated.View style={animatedProgressStyle}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressBar}
          />
        </Animated.View>
      </View>

      <Text style={styles.progressText}>
        {Math.round(progressPercentage)}% to Level {level + 1}
      </Text>
    </Animated.View>
  );
}
