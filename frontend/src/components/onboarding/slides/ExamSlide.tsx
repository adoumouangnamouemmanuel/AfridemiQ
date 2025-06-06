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
import type { OnboardingData } from "../OnboardingCarousel";

import type { ColorValue } from "react-native";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

const exams: {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: readonly [ColorValue, ColorValue, ...ColorValue[]];
}[] = [
  {
    id: "waec",
    name: "WAEC",
    description: "West African Examinations Council",
    icon: "document-text",
    gradient: ["#3b82f6", "#1d4ed8"],
  },
  {
    id: "jamb",
    name: "JAMB",
    description: "Joint Admissions and Matriculation Board",
    icon: "school",
    gradient: ["#10b981", "#059669"],
  },
  {
    id: "neco",
    name: "NECO",
    description: "National Examinations Council",
    icon: "newspaper",
    gradient: ["#f59e0b", "#d97706"],
  },
  {
    id: "bece",
    name: "BECE",
    description: "Basic Education Certificate Examination",
    icon: "book",
    gradient: ["#8b5cf6", "#7c3aed"],
  },
  {
    id: "igcse",
    name: "IGCSE",
    description: "International General Certificate",
    icon: "globe",
    gradient: ["#ef4444", "#dc2626"],
  },
  {
    id: "sat",
    name: "SAT",
    description: "Scholastic Assessment Test",
    icon: "calculator",
    gradient: ["#06b6d4", "#0891b2"],
  },
  {
    id: "other",
    name: "Other",
    description: "Other examination not listed",
    icon: "add-circle",
    gradient: ["#6b7280", "#4b5563"],
  },
];

export default function ExamSlide({ data, updateData, isActive }: SlideProps) {
  const { theme } = useTheme();

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
      backgroundColor: "white",
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: "rgba(0,0,0,0.05)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    selectedExam: {
      borderColor: theme.colors.primary,
    //   backgroundColor: theme.colors.primary + "08",
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.3,
    },
    examIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    examInfo: {
      flex: 1,
    },
    examName: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    examDescription: {
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

  return (
    <View style={styles.container}>
      <View style={styles.examsContainer}>
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.examItem,
                data.exam === item.id && styles.selectedExam,
              ]}
              onPress={() => updateData("exam", item.id)}
            >
              <LinearGradient
                colors={item.gradient}
                style={styles.examIconContainer}
              >
                <Ionicons name={item.icon as any} size={28} color="white" />
              </LinearGradient>
              <View style={styles.examInfo}>
                <Text
                  style={[
                    styles.examName,
                    data.exam === item.id && styles.selectedText,
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.examDescription}>{item.description}</Text>
              </View>
              {data.exam === item.id && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={18} color="white" />
                </View>
              )}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}
