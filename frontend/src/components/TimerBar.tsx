"use client";

import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../utils/ThemeContext";

interface TimerBarProps {
  duration: number; // in seconds
  timeLeft: number;
  onTimeUp?: () => void;
}

export default function TimerBar({
  duration,
  timeLeft,
  onTimeUp,
}: TimerBarProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(1);

  useEffect(() => {
    const progressValue = timeLeft / duration;
    progress.value = withTiming(progressValue, { duration: 1000 });

    if (timeLeft === 0 && onTimeUp) {
      onTimeUp();
    }
  }, [timeLeft, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.3, 1],
      [theme.colors.error, theme.colors.warning, theme.colors.success]
    );

    return {
      width: `${progress.value * 100}%`,
      backgroundColor,
    };
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const styles = StyleSheet.create({
    container: {
      marginVertical: theme.spacing.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    timeText: {
      fontSize: 16,
      fontWeight: "600",
      color: timeLeft < 60 ? theme.colors.error : theme.colors.text,
    },
    progressContainer: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      borderRadius: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Time Remaining</Text>
        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, animatedStyle]} />
      </View>
    </View>
  );
}
