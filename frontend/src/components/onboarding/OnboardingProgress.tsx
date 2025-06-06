import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import Animated, {
} from "react-native-reanimated";

interface OnboardingProgressProps {
  currentIndex: number;
  totalSlides: number;
}

export default function OnboardingProgress({
  currentIndex,
  totalSlides,
}: OnboardingProgressProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: theme.colors.primary,
      width: 24,
    },
  });

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <Animated.View
          key={index}
          style={[styles.dot, index === currentIndex && styles.activeDot]}
        />
      ))}
    </View>
  );
}
