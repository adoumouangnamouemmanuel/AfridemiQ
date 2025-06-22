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

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

const subjects: {
  id: string;
  name: string;
  icon: string;
  gradient: [string, string];
}[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    icon: "calculator",
    gradient: ["#3b82f6", "#1d4ed8"],
  },
  {
    id: "english",
    name: "English",
    icon: "book",
    gradient: ["#10b981", "#059669"],
  },
  {
    id: "physics",
    name: "Physics",
    icon: "flask",
    gradient: ["#f59e0b", "#d97706"],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "beaker",
    gradient: ["#8b5cf6", "#7c3aed"],
  },
  {
    id: "biology",
    name: "Biology",
    icon: "leaf",
    gradient: ["#ef4444", "#dc2626"],
  },
  {
    id: "geography",
    name: "Geography",
    icon: "globe",
    gradient: ["#06b6d4", "#0891b2"],
  },
  {
    id: "history",
    name: "History",
    icon: "time",
    gradient: ["#84cc16", "#65a30d"],
  },
  {
    id: "economics",
    name: "Economics",
    icon: "cash",
    gradient: ["#f97316", "#ea580c"],
  },
  {
    id: "government",
    name: "Government",
    icon: "business",
    gradient: ["#ec4899", "#db2777"],
  },
  {
    id: "literature",
    name: "Literature",
    icon: "library",
    gradient: ["#6366f1", "#4f46e5"],
  },
];

export default function SubjectsSlide({
  data,
  updateData,
  isActive,
}: SlideProps) {
  const { theme } = useTheme();

  const toggleSubject = (subjectId: string) => {
    const currentSubjects = [...data.subjects];
    if (currentSubjects.includes(subjectId)) {
      updateData(
        "subjects",
        currentSubjects.filter((id) => id !== subjectId)
      );
    } else {
      updateData("subjects", [...currentSubjects, subjectId]);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    selectionInfo: {
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: theme.colors.primary + "20",
      backgroundColor: theme.colors.primary + "08",
    },
    selectionText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: "600",
      textAlign: "center",
    },
    subjectsContainer: {
      flex: 1,
    },
    subjectItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: "white",
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: "rgba(0,0,0,0.05)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    selectedSubject: {
      borderColor: theme.colors.primary,
    //   backgroundColor: theme.colors.primary + "08",
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.2,
    },
    subjectIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    subjectName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    selectedText: {
      color: theme.colors.primary,
    },
    checkIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          {data.subjects.length} subject{data.subjects.length !== 1 ? "s" : ""}{" "}
          selected
        </Text>
      </View>

      <View style={styles.subjectsContainer}>
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.subjectItem,
                data.subjects.includes(item.id) && styles.selectedSubject,
              ]}
              onPress={() => toggleSubject(item.id)}
            >
              <LinearGradient
                colors={item.gradient}
                style={styles.subjectIconContainer}
              >
                <Ionicons name={item.icon as any} size={24} color="white" />
              </LinearGradient>
              <Text
                style={[
                  styles.subjectName,
                  data.subjects.includes(item.id) && styles.selectedText,
                ]}
              >
                {item.name}
              </Text>
              {data.subjects.includes(item.id) && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          numColumns={1}
        />
      </View>
    </View>
  );
}
