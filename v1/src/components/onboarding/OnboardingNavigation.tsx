"use client";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";

interface OnboardingNavigationProps {
  currentIndex: number;
  totalSlides: number;
  canProceed: boolean;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  isLoading?: boolean;
}

export default function OnboardingNavigation({
  currentIndex,
  totalSlides,
  canProceed,
  onNext,
  onPrev,
  onComplete,
  isLoading = false,
}: OnboardingNavigationProps) {
  const { theme } = useTheme();
  const buttonScale = useSharedValue(1);

  const isLastSlide = currentIndex === totalSlides - 1;
  const isFirstSlide = currentIndex === 0;

  useEffect(() => {
    buttonScale.value = withSpring(canProceed ? 1 : 0.95, {
      damping: 15,
      stiffness: 150,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canProceed]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    backButton: {
      width: 48,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      opacity: isFirstSlide ? 0.3 : 1,
    },
    nextButtonContainer: {
      borderRadius: 28,
      overflow: "hidden",
      minWidth: 140,
      height: 56,
    },
    nextButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      gap: 8,
    },
    nextButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "white",
    },
    nextButtonTextDisabled: {
      color: theme.colors.textSecondary,
    },
  });

  const gradientColors = canProceed
    ? [theme.colors.primary, theme.colors.secondary] as const
    : [theme.colors.border, theme.colors.border] as const;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onPrev}
        disabled={isFirstSlide}
      >
        {!isFirstSlide && (
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        )}
      </TouchableOpacity>

      <Animated.View style={[styles.nextButtonContainer, animatedButtonStyle]}>
        <LinearGradient
          colors={gradientColors}
          style={styles.nextButtonContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            style={styles.nextButton}
            onPress={isLastSlide ? onComplete : onNext}
            disabled={!canProceed || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text
                  style={[
                    styles.nextButtonText,
                    !canProceed && styles.nextButtonTextDisabled,
                  ]}
                >
                  {isLastSlide ? "Complete" : "Continue"}
                </Text>
                <Ionicons
                  name={isLastSlide ? "checkmark" : "arrow-forward"}
                  size={20}
                  color={canProceed ? "white" : theme.colors.textSecondary}
                />
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
