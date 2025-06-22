"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../utils/ThemeContext";
import { useUser } from "../utils/UserContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import examsData from "../data/exams.json";

export default function ExamSelectorScreen() {
  const { theme } = useTheme();
  const { setUser } = useUser();
  const router = useRouter();
  const [selectedExam, setSelectedExam] = useState("");
  const [goalDate, setGoalDate] = useState(new Date());
  const [onboardingData, setOnboardingData] = useState({
    name: "",
    country: "",
  });

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const data = await AsyncStorage.getItem("onboardingData");
      if (data) {
        setOnboardingData(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading onboarding data:", error);
    }
  };

  const handleExamSelect = (examId: string) => {
    setSelectedExam(examId);
  };

  const handleContinue = async () => {
    if (!selectedExam) {
      Alert.alert(
        "Please select an exam",
        "Choose the exam you want to prepare for"
      );
      return;
    }

    try {
      const newUser = {
        id: Date.now().toString(),
        name: onboardingData.name || "Student",
        email: "",
        country: onboardingData.country || "Nigeria",
        selectedExam,
        goalDate: goalDate.toISOString(),
        xp: 0,
        level: 1,
        streak: 0,
        avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${
          onboardingData.name || "student"
        }`,
        badges: [],
        completedTopics: [],
        weakSubjects: [],
      };

      setUser(newUser);

      // Clear onboarding data
      await AsyncStorage.removeItem("onboardingData");

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error creating user:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const ExamCard = ({ exam, index }: { exam: any; index: number }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
      scale.value = withDelay(index * 100, withSpring(1));
      opacity.value = withDelay(index * 100, withSpring(1));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const isSelected = selectedExam === exam.id;

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[styles.examCard, isSelected && styles.selectedExamCard]}
          onPress={() => handleExamSelect(exam.id)}
        >
          <LinearGradient
            colors={
              isSelected
                ? [theme.colors.primary, theme.colors.secondary]
                : [theme.colors.surface, theme.colors.surface]
            }
            style={styles.examCardGradient}
          >
            <View style={styles.examCardHeader}>
              <View
                style={[
                  styles.examIcon,
                  { backgroundColor: exam.color + "20" },
                ]}
              >
                <Ionicons name={exam.icon} size={32} color={exam.color} />
              </View>
              {isSelected && (
                <View style={styles.selectedIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                </View>
              )}
            </View>

            <Text
              style={[styles.examTitle, isSelected && styles.selectedExamTitle]}
            >
              {exam.name}
            </Text>
            <Text
              style={[
                styles.examDescription,
                isSelected && styles.selectedExamDescription,
              ]}
            >
              {exam.description}
            </Text>

            <View style={styles.examDetails}>
              <View style={styles.examDetail}>
                <Ionicons
                  name="book-outline"
                  size={16}
                  color={isSelected ? "white" : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.examDetailText,
                    isSelected && styles.selectedExamDetailText,
                  ]}
                >
                  {exam.subjects.length} subjects
                </Text>
              </View>
              <View style={styles.examDetail}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={isSelected ? "white" : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.examDetailText,
                    isSelected && styles.selectedExamDetailText,
                  ]}
                >
                  {exam.duration}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    examsContainer: {
      marginBottom: theme.spacing.xl,
    },
    examCard: {
      marginVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    selectedExamCard: {
      borderColor: theme.colors.primary,
    },
    examCardGradient: {
      padding: theme.spacing.md,
    },
    examCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    examIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    selectedIcon: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 12,
      padding: 4,
    },
    examTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    selectedExamTitle: {
      color: "white",
    },
    examDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      lineHeight: 20,
    },
    selectedExamDescription: {
      color: "rgba(255,255,255,0.8)",
    },
    examDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    examDetail: {
      flexDirection: "row",
      alignItems: "center",
    },
    examDetailText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    selectedExamDetailText: {
      color: "rgba(255,255,255,0.8)",
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    continueButtonDisabled: {
      opacity: 0.5,
    },
    continueButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Exam</Text>
        <Text style={styles.subtitle}>
          {onboardingData.name ? `Hi ${onboardingData.name}! ` : ""}
          Select the exam you want to prepare for
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Available Exams</Text>
        <View style={styles.examsContainer}>
          {examsData.map((exam, index) => (
            <ExamCard key={exam.id} exam={exam} index={index} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedExam && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedExam}
        >
          <Text style={styles.continueButtonText}>Start Learning</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
