"use client";

import { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../../utils/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { apiService } from "../../services/api.service";
import { authService } from "../../services/auth.service";
import type {
  OnboardingData,
  Language,
  Country,
  EducationLevel,
  ExamType,
} from "../../types/user/user.types";

// Import slides
import WelcomeSlide from "./slides/WelcomeSlide";
import LanguageSlide from "./slides/LanguageSlide";
import CountrySlide from "./slides/CountrySlide";
import EducationSlide from "./slides/EducationSlide";
import ExamSlide from "./slides/ExamSlide";
import SeriesSlide from "./slides/SeriesSlide";
import CompletionSlide from "./slides/CompletionSlide";
import OnboardingProgress from "./OnboardingProgress";
import OnboardingNavigation from "./OnboardingNavigation";

const { width: screenWidth } = Dimensions.get("window");

const baseSlides = [
  { Component: WelcomeSlide, key: "welcome" },
  { Component: LanguageSlide, key: "language" },
  { Component: CountrySlide, key: "country" },
  { Component: EducationSlide, key: "education" },
  { Component: ExamSlide, key: "exam" },
];

const seriesSlide = { Component: SeriesSlide, key: "series" };
const completionSlide = { Component: CompletionSlide, key: "completion" };

export default function OnboardingCarousel() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    preferredLanguage: "english" as Language,
    country: "" as Country,
    educationLevel: "" as EducationLevel,
    examType: "" as ExamType,
    // TODO: Add series field to OnboardingData type when backend is ready
    // series: "",
  });

  // TODO: Remove this temporary state when series is added to OnboardingData type
  const [tempSeries, setTempSeries] = useState("");

  const translateX = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);

  // Determine if series slide is needed (BEPC doesn't need series)
  const needsSeriesSlide = data.examType && data.examType !== "BEPC";

  // Build slides array dynamically
  const slides = [
    ...baseSlides,
    ...(needsSeriesSlide ? [seriesSlide] : []),
    completionSlide,
  ];

  useEffect(() => {
    translateX.value = withSpring(-currentIndex * screenWidth, {
      damping: 20,
      stiffness: 90,
    });
  }, [currentIndex, translateX]);

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset series when exam changes
      if (field === "examType") {
        // TODO: Reset series in OnboardingData when backend is ready
        setTempSeries("");
      }

      return newData;
    });
  };

  // TODO: Remove this temporary function when series is added to OnboardingData
  const updateTempSeries = (value: string) => {
    setTempSeries(value);
  };

  const canProceed = (): boolean => {
    switch (currentIndex) {
      case 0: // Welcome
        return true;
      case 1: // Language
        return !!data.preferredLanguage;
      case 2: // Country
        return !!data.country;
      case 3: // Education
        return !!data.educationLevel;
      case 4: // Exam
        return !!data.examType;
      case 5: // Series (if needed) or Completion
        if (needsSeriesSlide && currentIndex === 5) {
          // TODO: Change to !!data.series when backend is ready
          return !!tempSeries;
        }
        return true;
      case 6: // Completion (when series slide exists)
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

  const handleComplete = async () => {
    setIsLoading(true);
    backgroundOpacity.value = withTiming(0.5, { duration: 300 });

    try {
      // TODO: Include series in completion data when backend supports it
      const completionData = {
        ...data,
        // TODO: Add series: tempSeries when OnboardingData type includes series
      };
      await apiService.completeOnboarding(completionData);

      // Update user data in storage
      const currentUser = await apiService.getCurrentUser();
      if (currentUser) {
        const updatedUser = authService.transformUserData({
          ...currentUser,
          ...data,
          onboardingCompleted: true,
        });
        const authData = await authService.getAuthData();
        await authService.storeAuthData(
          updatedUser,
          authData.token || "",
          authData.refreshToken || undefined
        );
      }

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Onboarding completion failed:", error);
      router.replace("/(tabs)/home");
    } finally {
      setIsLoading(false);
      backgroundOpacity.value = withTiming(1, { duration: 300 });
    }
  };

  const animatedSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    backgroundGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    content: {
      flex: 1,
    },
    progressContainer: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 10,
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
    navigationContainer: {
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
  });

  const gradientColors = isDark
    ? (["#0f172a", "#1e293b", "#334155"] as const)
    : (["#f8fafc", "#f1f5f9", "#e2e8f0"] as const);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <Animated.View
        style={[styles.backgroundGradient, animatedBackgroundStyle]}
      >
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.content} edges={["top", "bottom"]}>
        <View style={styles.progressContainer}>
          <OnboardingProgress
            currentIndex={currentIndex}
            totalSlides={slides.length}
          />
        </View>

        <Animated.View style={[styles.slidesContainer, animatedSlideStyle]}>
          {slides.map(({ Component }, index) => (
            <View key={index} style={styles.slide}>
              <Component
                data={data}
                updateData={updateData}
                isActive={index === currentIndex}
                // TODO: Remove tempSeries props when series is added to OnboardingData
                tempSeries={tempSeries}
                updateTempSeries={updateTempSeries}
              />
            </View>
          ))}
        </Animated.View>

        <View style={styles.navigationContainer}>
          <OnboardingNavigation
            currentIndex={currentIndex}
            totalSlides={slides.length}
            canProceed={canProceed()}
            onNext={nextSlide}
            onPrev={prevSlide}
            onComplete={handleComplete}
            isLoading={isLoading}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
