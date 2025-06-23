"use client";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import type { OnboardingData, ExamType } from "../../../types/user/user.types";
import { useCommonOnboarding } from "../../../styles/commonOnboarding";
import { useEffect } from "react";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

const allExams = [
  {
    code: "WAEC" as ExamType,
    name: "WAEC",
    fullName: "West African Examinations Council",
    description: "Senior Secondary Certificate Examination",
    icon: "document-text-outline",
    gradient: ["#3b82f6", "#1d4ed8"] as const,
    countries: ["nigeria", "ghana"],
  },
  {
    code: "NECO" as ExamType,
    name: "NECO",
    fullName: "National Examinations Council",
    description: "Senior School Certificate Examination",
    icon: "newspaper-outline",
    gradient: ["#10b981", "#059669"] as const,
    countries: ["nigeria"],
  },
  {
    code: "JAMB" as ExamType,
    name: "JAMB",
    fullName: "Joint Admissions and Matriculation Board",
    description: "Unified Tertiary Matriculation Examination",
    icon: "school-outline",
    gradient: ["#f59e0b", "#d97706"] as const,
    countries: ["nigeria"],
  },
  {
    code: "KCSE" as ExamType,
    name: "KCSE",
    fullName: "Kenya Certificate of Secondary Education",
    description: "National secondary education examination",
    icon: "library-outline",
    gradient: ["#8b5cf6", "#7c3aed"] as const,
    countries: ["kenya"],
  },
  {
    code: "BAC" as ExamType,
    name: "BAC",
    fullName: "Baccalauréat",
    description: "French academic qualification examination",
    icon: "medal-outline",
    gradient: ["#ef4444", "#dc2626"] as const,
    countries: ["cameroon", "senegal", "chad"],
  },
  {
    code: "BEPC" as ExamType,
    name: "BEPC",
    fullName: "Brevet d'Études du Premier Cycle",
    description: "Junior secondary certificate examination",
    icon: "ribbon-outline",
    gradient: ["#06b6d4", "#0891b2"] as const,
    countries: ["cameroon", "senegal", "chad"],
  },
];

export default function ExamSlide({ data, updateData, isActive }: SlideProps) {
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
  }, [isActive, containerOpacity, containerTranslateY]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  // Filter exams based on selected country
  const availableExams = allExams.filter((exam) =>
    exam.countries.includes(data.country as string)
  );

  const handleExamSelect = (examCode: ExamType) => {
    updateData("examType", examCode);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    examsContainer: {
      flex: 1,
    },
    examItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "transparent",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    selectedExam: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
    },
    examIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 20,
    },
    examInfo: {
      flex: 1,
    },
    examName: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    examFullName: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "600",
      marginBottom: 4,
    },
    examDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    selectedText: {
      color: theme.colors.primary,
    },
    checkContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Text style={commonStyles.title}>Target Exam</Text>
      <Text style={commonStyles.subtitle}>
        Choose the exam you&apos;re preparing for to get tailored study
        materials
      </Text>

      <View style={styles.examsContainer}>
        <FlatList
          data={availableExams}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const isSelected = data.examType === item.code;

            return (
              <TouchableOpacity
                style={[styles.examItem, isSelected && styles.selectedExam]}
                onPress={() => handleExamSelect(item.code)}
              >
                <LinearGradient
                  colors={item.gradient}
                  style={styles.examIconContainer}
                >
                  <Ionicons name={item.icon as any} size={32} color="white" />
                </LinearGradient>

                <View style={styles.examInfo}>
                  <Text
                    style={[styles.examName, isSelected && styles.selectedText]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.examFullName}>{item.fullName}</Text>
                  <Text style={styles.examDescription}>{item.description}</Text>
                </View>

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
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </Animated.View>
  );
}
