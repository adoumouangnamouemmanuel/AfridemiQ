"use client";

import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface OnboardingProgressProps {
  currentIndex: number;
  totalSlides: number;
}

// Separate component for each animated dot to avoid hook issues
const AnimatedDot = ({
  isActive,
  currentIndex,
  index,
  theme,
}: {
  isActive: boolean;
  currentIndex: number;
  index: number;
  theme: any;
}) => {
  const dotScale = useSharedValue(1);

  useEffect(() => {
    dotScale.value = withSpring(index === currentIndex ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [currentIndex, index, dotScale]);

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const styles = StyleSheet.create({
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
    },
    activeDot: {
      backgroundColor: theme.colors.primary,
      width: 24,
    },
  });

  return (
    <Animated.View
      style={[styles.dot, isActive && styles.activeDot, animatedDotStyle]}
    />
  );
};

export default function OnboardingProgress({
  currentIndex,
  totalSlides,
}: OnboardingProgressProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming((currentIndex / (totalSlides - 1)) * 100, {
      duration: 600,
    });
  }, [currentIndex, totalSlides, progress]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const styles = StyleSheet.create({
    container: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    dotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
      gap: 8,
    },
  });

  return (
    <View>
      <View style={styles.container}>
        <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
      </View>

      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSlides }).map((_, index) => (
          <AnimatedDot
            key={index}
            isActive={index === currentIndex}
            currentIndex={currentIndex}
            index={index}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}
