"use client";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OnboardingNavigationProps {
  currentIndex: number;
  totalSlides: number;
  canProceed: boolean;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
}

export default function OnboardingNavigation({
  currentIndex,
  totalSlides,
  canProceed,
  onNext,
  onPrev,
  onComplete,
}: OnboardingNavigationProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const isLastSlide = currentIndex === totalSlides - 1;
  const isFirstSlide = currentIndex === 0;

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingBottom: Math.max(insets.bottom, 20),
      paddingTop: 16,
    },
    backButton: {
      width: 48,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 24,
      backgroundColor: isFirstSlide ? "transparent" : "rgba(255,255,255,0.2)",
    },
    nextButton: {
      backgroundColor: canProceed ? "white" : "rgba(255,255,255,0.3)",
      borderRadius: 24,
      paddingHorizontal: 32,
      paddingVertical: 14,
      minWidth: 140,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: canProceed ? 0.2 : 0,
      shadowRadius: 8,
      elevation: canProceed ? 4 : 0,
    },
    nextButtonText: {
      color: canProceed ? theme.colors.primary : "rgba(255,255,255,0.6)",
      fontSize: 16,
      fontWeight: "700",
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onPrev}
        disabled={isFirstSlide}
      >
        {!isFirstSlide && (
          <Ionicons name="arrow-back" size={24} color="white" />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={isLastSlide ? onComplete : onNext}
        disabled={!canProceed}
      >
        <Text style={styles.nextButtonText}>
          {isLastSlide ? "Get Started" : "Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
