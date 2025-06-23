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
import type { OnboardingData } from "../../../types/user/user.types";
import { useCommonOnboarding } from "../../../styles/commonOnboarding";
import { useEffect } from "react";
// import { useEffect } from "react" // Removed duplicate import

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
  // TODO: Remove these temporary props when series is added to OnboardingData type
  tempSeries?: string;
  updateTempSeries?: (value: string) => void;
}

interface SeriesOption {
  code: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  gradient: [string, string];
  coreSubjects: string[];
}

// TODO: Backend integration needed - Add series support to API
const getSeriesForExam = (examType: string): SeriesOption[] => {
  switch (examType) {
    case "BAC":
      return [
        {
          code: "series_a",
          name: "Series A",
          fullName: "Série A - Littérature",
          description: "Literature, Philosophy, Languages, History",
          icon: "library-outline",
          gradient: ["#f59e0b", "#d97706"],
          coreSubjects: ["Literature", "Philosophy", "Languages"],
        },
        {
          code: "series_c",
          name: "Series C",
          fullName: "Série C - Sciences Exactes",
          description: "Pure Sciences: Physics, Chemistry, Mathematics",
          icon: "flask-outline",
          gradient: ["#3b82f6", "#1d4ed8"],
          coreSubjects: ["Physics", "Chemistry", "Mathematics"],
        },
        {
          code: "series_d",
          name: "Series D",
          fullName: "Série D - Sciences Naturelles",
          description: "Life Sciences: Biology, Chemistry, Physics",
          icon: "leaf-outline",
          gradient: ["#10b981", "#059669"],
          coreSubjects: ["Biology", "Chemistry", "Physics"],
        },
      ];

    case "WAEC":
    case "NECO":
      return [
        {
          code: "science",
          name: "Science",
          fullName: "Science Track",
          description: "Physics, Chemistry, Biology, Mathematics",
          icon: "flask-outline",
          gradient: ["#3b82f6", "#1d4ed8"],
          coreSubjects: ["Physics", "Chemistry", "Biology", "Mathematics"],
        },
        {
          code: "commercial",
          name: "Commercial",
          fullName: "Commercial Track",
          description: "Accounting, Economics, Commerce, Mathematics",
          icon: "trending-up-outline",
          gradient: ["#10b981", "#059669"],
          coreSubjects: ["Accounting", "Economics", "Commerce"],
        },
        {
          code: "arts",
          name: "Arts",
          fullName: "Arts Track",
          description: "Literature, History, Government, Geography",
          icon: "book-outline",
          gradient: ["#f59e0b", "#d97706"],
          coreSubjects: ["Literature", "History", "Government"],
        },
      ];

    case "JAMB":
      return [
        {
          code: "science_tech",
          name: "Science & Technology",
          fullName: "Science & Technology",
          description: "Engineering, Medicine, Pure Sciences",
          icon: "flask-outline",
          gradient: ["#3b82f6", "#1d4ed8"],
          coreSubjects: ["Physics", "Chemistry", "Biology", "Mathematics"],
        },
        {
          code: "arts_social",
          name: "Arts & Social Sciences",
          fullName: "Arts & Social Sciences",
          description: "Law, Languages, Social Sciences",
          icon: "people-outline",
          gradient: ["#f59e0b", "#d97706"],
          coreSubjects: ["Literature", "Government", "History"],
        },
        {
          code: "commercial_mgmt",
          name: "Commercial & Management",
          fullName: "Commercial & Management Sciences",
          description: "Business, Accounting, Economics",
          icon: "briefcase-outline",
          gradient: ["#10b981", "#059669"],
          coreSubjects: ["Economics", "Accounting", "Commerce"],
        },
      ];

    case "KCSE":
      return [
        {
          code: "sciences",
          name: "Sciences",
          fullName: "Science Cluster",
          description: "Physics, Chemistry, Biology, Mathematics",
          icon: "flask-outline",
          gradient: ["#3b82f6", "#1d4ed8"],
          coreSubjects: ["Physics", "Chemistry", "Biology", "Mathematics"],
        },
        {
          code: "humanities",
          name: "Arts & Humanities",
          fullName: "Arts & Humanities Cluster",
          description: "History, Geography, Literature, Languages",
          icon: "book-outline",
          gradient: ["#f59e0b", "#d97706"],
          coreSubjects: ["History", "Geography", "Literature"],
        },
        {
          code: "technical",
          name: "Technical & Applied",
          fullName: "Technical & Applied Sciences",
          description: "Technical subjects and Applied Sciences",
          icon: "construct-outline",
          gradient: ["#8b5cf6", "#7c3aed"],
          coreSubjects: ["Technical Drawing", "Applied Sciences"],
        },
      ];

    default:
      return [];
  }
};

export default function SeriesSlide({
  data,
  updateData,
  isActive,
  // TODO: Remove these when backend is ready
  tempSeries = "",
  updateTempSeries,
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
  }, [isActive, containerOpacity, containerTranslateY]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const seriesOptions = getSeriesForExam(data.examType);

  const handleSeriesSelect = (seriesCode: string) => {
    // TODO: Change to updateData("series", seriesCode) when backend is ready
    if (updateTempSeries) {
      updateTempSeries(seriesCode);
    }
  };

  const getExamDisplayName = () => {
    const examNames: { [key: string]: string } = {
      bac: "BAC",
      waec: "WAEC",
      neco: "NECO",
      jamb: "JAMB",
      kcse: "KCSE",
    };
    return examNames[data.examType] || data.examType.toUpperCase();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    seriesContainer: {
      flex: 1,
    },
    seriesItem: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 15,
      paddingHorizontal: 15,
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
    selectedSeries: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
    },
    seriesHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    seriesIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 20,
    },
    seriesInfo: {
      flex: 1,
    },
    seriesName: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    seriesFullName: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "600",
      marginBottom: 4,
    },
    seriesDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    coreSubjectsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 0,
    },
    subjectTag: {
      backgroundColor: theme.colors.border,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    selectedSubjectTag: {
      backgroundColor: theme.colors.primary + "20",
    },
    subjectText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    selectedSubjectText: {
      color: theme.colors.primary,
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
      <Text style={commonStyles.title}>{getExamDisplayName()} Series</Text>
      <Text style={commonStyles.subtitle}>
        Choose your academic series to get specialized study materials and
        practice questions
      </Text>

      <View style={styles.seriesContainer}>
        <FlatList
          data={seriesOptions}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const isSelected = tempSeries === item.code;
            // TODO: Change to data.series === item.code when backend is ready

            return (
              <TouchableOpacity
                style={[styles.seriesItem, isSelected && styles.selectedSeries]}
                onPress={() => handleSeriesSelect(item.code)}
              >
                <View style={styles.seriesHeader}>
                  <LinearGradient
                    colors={item.gradient}
                    style={styles.seriesIconContainer}
                  >
                    <Ionicons name={item.icon as any} size={32} color="white" />
                  </LinearGradient>

                  <View style={styles.seriesInfo}>
                    <Text
                      style={[
                        styles.seriesName,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.seriesFullName}>{item.fullName}</Text>
                    <Text style={styles.seriesDescription}>
                      {item.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.coreSubjectsContainer}>
                  {item.coreSubjects.map((subject, index) => (
                    <View
                      key={index}
                      style={[
                        styles.subjectTag,
                        isSelected && styles.selectedSubjectTag,
                      ]}
                    >
                      <Text
                        style={[
                          styles.subjectText,
                          isSelected && styles.selectedSubjectText,
                        ]}
                      >
                        {subject}
                      </Text>
                    </View>
                  ))}
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
