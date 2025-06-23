"use client";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import type {
  OnboardingData,
  EducationLevel,
} from "../../../types/user/user.types";
import { useCommonOnboarding } from "../../../styles/commonOnboarding";
import { useEffect } from "react";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

const educationLevels = [
  {
    code: "junior_secondary" as EducationLevel,
    name: "Junior Secondary",
    description: "Grades 7-9 / JSS 1-3",
    icon: "school-outline",
    gradient: ["#3b82f6", "#1d4ed8"],
    ageRange: "Ages 12-15",
  },
  {
    code: "senior_secondary" as EducationLevel,
    name: "Senior Secondary",
    description: "Grades 10-12 / SSS 1-3",
    icon: "library-outline",
    gradient: ["#10b981", "#059669"],
    ageRange: "Ages 15-18",
  },
];

export default function EducationSlide({
  data,
  updateData,
  isActive,
}: SlideProps) {
  const { theme } = useTheme();
  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(30);
  const commonStyles = useCommonOnboarding();

  useEffect(() => {
    if (isActive) {
      containerOpacity.value = withSpring(1, { damping: 20, stiffness: 100 });
      containerTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 100,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const handleEducationSelect = (level: EducationLevel) => {
    updateData("educationLevel", level);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "center",
    },
    levelsContainer: {
      gap: 24,
    },
    levelItem: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 24,
      paddingHorizontal: 24,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: "transparent",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
    selectedLevel: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
    },
    levelHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    levelIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 20,
    },
    levelTitleContainer: {
      flex: 1,
    },
    levelName: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    levelAgeRange: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    levelDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 24,
      fontWeight: "500",
      marginBottom: 16,
    },
    selectedText: {
      color: theme.colors.primary,
    },
    checkContainer: {
      alignSelf: "flex-end",
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Text style={commonStyles.title}>Education Level</Text>
      <Text style={commonStyles.subtitle}>
        Select your current education level to get personalized content
      </Text>

      <View style={styles.levelsContainer}>
        {educationLevels.map((level) => {
          const isSelected = data.educationLevel === level.code;

          return (
            <TouchableOpacity
              key={level.code}
              style={[styles.levelItem, isSelected && styles.selectedLevel]}
              onPress={() => handleEducationSelect(level.code)}
            >
              <View style={styles.levelHeader}>
                <LinearGradient
                  colors={level.gradient as [string, string, ...string[]]}
                  style={styles.levelIconContainer}
                >
                  <Ionicons name={level.icon as any} size={32} color="white" />
                </LinearGradient>

                <View style={styles.levelTitleContainer}>
                  <Text
                    style={[
                      styles.levelName,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {level.name}
                  </Text>
                  <Text style={styles.levelAgeRange}>{level.ageRange}</Text>
                </View>
              </View>

              <Text style={styles.levelDescription}>{level.description}</Text>

              <View style={styles.checkContainer}>
                {isSelected && (
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                  </LinearGradient>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}
