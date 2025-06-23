"use client";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { OnboardingData } from "../OnboardingCarousel";

import type { ColorValue } from "react-native";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

const goalOptions: {
  id: string;
  label: string;
  description: string;
  months: number;
  icon: string;
  gradient: [ColorValue, ColorValue];
}[] = [
  {
    id: "3months",
    label: "3 months",
    description: "Intensive preparation",
    months: 3,
    icon: "flash",
    gradient: ["#ef4444", "#dc2626"],
  },
  {
    id: "6months",
    label: "6 months",
    description: "Balanced approach",
    months: 6,
    icon: "trending-up",
    gradient: ["#f59e0b", "#d97706"],
  },
  {
    id: "1year",
    label: "1 year",
    description: "Comprehensive study",
    months: 12,
    icon: "calendar",
    gradient: ["#10b981", "#059669"],
  },
  {
    id: "flexible",
    label: "I'm flexible",
    description: "No specific timeline",
    months: 0, // Special case for flexible
    icon: "time",
    gradient: ["#6366f1", "#4f46e5"],
  },
];

export default function GoalDateSlide({
  data,
  updateData,
}: SlideProps) {
  const { theme } = useTheme();

  const handleGoalSelect = (optionId: string, months: number) => {
    // Check if this option is already selected
    const currentSelectedId = getCurrentSelectedId();

    if (currentSelectedId === optionId) {
      // If already selected, unselect by setting to a neutral date
      const neutralDate = new Date();
      neutralDate.setMonth(neutralDate.getMonth() + 6);
      updateData("goalDate", neutralDate);
    } else {
      // Select this option
      if (optionId === "flexible") {
        // For flexible, we'll use a special marker
        const flexibleDate = new Date();
        flexibleDate.setMonth(flexibleDate.getMonth() + 999); // Far future to indicate flexible
        updateData("goalDate", flexibleDate);
      } else {
        const goalDate = new Date();
        goalDate.setMonth(goalDate.getMonth() + months);
        updateData("goalDate", goalDate);
      }
    }
  };

  const getCurrentSelectedId = () => {
    const currentMonths = Math.round(
      (data.goalDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );

    // Check for flexible (very far future)
    if (currentMonths > 100) {
      return "flexible";
    }

    // Check for specific months with tolerance
    if (Math.abs(currentMonths - 3) <= 1) return "3months";
    if (Math.abs(currentMonths - 6) <= 1) return "6months";
    if (Math.abs(currentMonths - 12) <= 1) return "1year";

    return null;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    optionsContainer: {
      flex: 1,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 24,
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: "rgba(0,0,0,0.1)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    optionItemDefault: {
      backgroundColor: "#f8fafc",
    },
    selectedOption: {
      borderColor: theme.colors.primary,
      backgroundColor: "#f8fafc",
    },
    optionIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 20,
    },
    optionInfo: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    selectedText: {
      color: theme.colors.primary,
    },
    checkIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const selectedId = getCurrentSelectedId();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.optionsContainer}
        showsVerticalScrollIndicator={true}
      >
        {goalOptions.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                isSelected ? styles.selectedOption : styles.optionItemDefault,
              ]}
              onPress={() => handleGoalSelect(option.id, option.months)}
            >
              <LinearGradient
                colors={option.gradient}
                style={styles.optionIconContainer}
              >
                <Ionicons name={option.icon as any} size={30} color="white" />
              </LinearGradient>
              <View style={styles.optionInfo}>
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
              {isSelected && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={18} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
