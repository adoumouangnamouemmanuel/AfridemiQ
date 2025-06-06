"use client";

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WelcomeSlide from "./slides/WelcomeSlide";
import CountrySlide from "./slides/CountrySlide";
import ExamSlide from "./slides/ExamSlide";
import GoalDateSlide from "./slides/GoalDateSlide";
import SubjectsSlide from "./slides/SubjectsSlide";
import LearningStyleSlide from "./slides/LearningStyleSlide";
import CompletionSlide from "./slides/CompletionSlide";

const { width: screenWidth } = Dimensions.get("window");

export interface OnboardingData {
  name: string;
  country: string;
  exam: string;
  goalDate: Date;
  subjects: string[];
  learningStyle: string;
  studyTime: string;
  motivation: string;
}

const slides = [
  {
    Component: WelcomeSlide,
    title: "Welcome",
    subtitle: "Let's get started on your journey",
  },
  {
    Component: CountrySlide,
    title: "Location",
    subtitle: "Help us customize content for your region",
  },
  {
    Component: ExamSlide,
    title: "Target Exam",
    subtitle: "Choose the exam you're preparing for",
  },
  {
    Component: GoalDateSlide,
    title: "Timeline",
    subtitle: "When do you plan to take your exam?",
  },
  {
    Component: SubjectsSlide,
    title: "Subjects",
    subtitle: "Select the subjects you want to focus on",
  },
  {
    Component: LearningStyleSlide,
    title: "Learning Style",
    subtitle: "How do you learn most effectively?",
  },
  {
    Component: CompletionSlide,
    title: "All Set!",
    subtitle: "Your personalized study plan is ready",
  },
];

export default function OnboardingCarousel() {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    country: "",
    exam: "",
    goalDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // Default 6 months
    subjects: [],
    learningStyle: "",
    studyTime: "1-2 hours",
    motivation: "",
  });

  const translateX = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    loadUserData();
    // Animate progress bar
    progressWidth.value = withTiming(
      (currentIndex / (slides.length - 1)) * 100,
      {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }
    );
  }, [currentIndex, progressWidth]);

  React.useEffect(() => {
    // Animate slide transition
    translateX.value = withSpring(-currentIndex * screenWidth, {
      damping: 20,
      stiffness: 90,
    });
  }, [currentIndex, translateX]);

  const loadUserData = async () => {
    try {
      const tempUserData = await AsyncStorage.getItem("tempUserData");
      if (tempUserData) {
        const userData = JSON.parse(tempUserData);
        setData((prev) => ({ ...prev, name: userData.name }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentIndex) {
      case 0: // Welcome
        return true;
      case 1: // Country
        return data.country.length > 0;
      case 2: // Exam
        return data.exam.length > 0;
      case 3: // Goal Date
        return true;
      case 4: // Subjects
        return data.subjects.length > 0;
      case 5: // Learning Style
        return data.learningStyle.length > 0;
      case 6: // Completion
        return true;
      default:
        return false;
    }
  };

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = async () => {
    // Set default values and complete onboarding
    const defaultData = {
      ...data,
      country: data.country || "Nigeria",
      exam: data.exam || "waec",
      subjects:
        data.subjects.length > 0 ? data.subjects : ["mathematics", "english"],
      learningStyle: data.learningStyle || "visual",
    };

    try {
      await AsyncStorage.setItem("hasOnboarded", "true");
      await AsyncStorage.setItem("onboardingData", JSON.stringify(defaultData));

      const tempUserData = await AsyncStorage.getItem("tempUserData");
      if (tempUserData) {
        const userData = JSON.parse(tempUserData);
        const completeUserData = { ...userData, ...defaultData };
        await AsyncStorage.setItem("user", JSON.stringify(completeUserData));
        await AsyncStorage.removeItem("tempUserData");
      }

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      router.replace("/(tabs)/home");
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem("hasOnboarded", "true");
      await AsyncStorage.setItem("onboardingData", JSON.stringify(data));

      const tempUserData = await AsyncStorage.getItem("tempUserData");
      if (tempUserData) {
        const userData = JSON.parse(tempUserData);
        const completeUserData = { ...userData, ...data };
        await AsyncStorage.setItem("user", JSON.stringify(completeUserData));
        await AsyncStorage.removeItem("tempUserData");
      }

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      router.replace("/(tabs)/home");
    }
  };

  const animatedSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f8fafc",
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 8,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    stepIndicator: {
      flexDirection: "row",
      alignItems: "center",
    },
    stepText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    skipButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.05)",
    },
    skipText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    progressContainer: {
      height: 4,
      backgroundColor: "rgba(0,0,0,0.1)",
      borderRadius: 2,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    titleContainer: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      backgroundColor: "#f8fafc",
    },
    slideTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    slideSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontWeight: "500",
      lineHeight: 24,
    },
    slidesContainer: {
      flexDirection: "row",
      width: screenWidth * slides.length,
      flex: 1,
    },
    slide: {
      width: screenWidth,
      flex: 1,
    },
    footer: {
      paddingHorizontal: 24,
      paddingVertical: 20,
      backgroundColor: "#f8fafc",
      borderTopWidth: 1,
      borderTopColor: "rgba(0,0,0,0.05)",
    },
    navigationContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    backButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    backButtonDisabled: {
      opacity: 0.3,
    },
    nextButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 28,
      minWidth: 140,
      justifyContent: "center",
    },
    nextButtonEnabled: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    nextButtonDisabled: {
      backgroundColor: "rgba(0,0,0,0.1)",
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: "700",
      marginRight: 8,
    },
    nextButtonTextEnabled: {
      color: "white",
    },
    nextButtonTextDisabled: {
      color: "rgba(0,0,0,0.4)",
    },
  });

  const isLastSlide = currentIndex === slides.length - 1;
  const isFirstSlide = currentIndex === 0;
  const canContinue = canProceed();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              {currentIndex + 1} of {slides.length}
            </Text>
          </View>

          {currentIndex > 0 && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.slideTitle}>{slides[currentIndex].title}</Text>
        <Text style={styles.slideSubtitle}>
          {slides[currentIndex].subtitle}
        </Text>
      </View>

      {/* Slides */}
      <Animated.View style={[styles.slidesContainer, animatedSlideStyle]}>
        {slides.map(({ Component }, index) => (
          <View key={index} style={styles.slide}>
            <Component
              data={data}
              updateData={updateData}
              isActive={index === currentIndex}
            />
          </View>
        ))}
      </Animated.View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.backButton,
              isFirstSlide && styles.backButtonDisabled,
            ]}
            onPress={prevSlide}
            disabled={isFirstSlide}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isFirstSlide ? "rgba(0,0,0,0.3)" : theme.colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              canContinue
                ? styles.nextButtonEnabled
                : styles.nextButtonDisabled,
            ]}
            onPress={nextSlide}
            disabled={!canContinue}
          >
            <Text
              style={[
                styles.nextButtonText,
                canContinue
                  ? styles.nextButtonTextEnabled
                  : styles.nextButtonTextDisabled,
              ]}
            >
              {isLastSlide ? "Get Started" : "Continue"}
            </Text>
            <Ionicons
              name={isLastSlide ? "rocket" : "arrow-forward"}
              size={20}
              color={canContinue ? "white" : "rgba(0,0,0,0.4)"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
