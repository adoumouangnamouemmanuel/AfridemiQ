"use client";

import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { OnboardingData } from "../../../types/user/user.types";
import { useCommonOnboarding } from "../../../styles/commonOnboarding";
import { useEffect } from "react";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
  // TODO: Remove this temporary prop when series is added to OnboardingData type
  tempSeries?: string;
}

export default function CompletionSlide({
  data,
  isActive,
  // TODO: Remove this when backend is ready
  tempSeries = "",
}: SlideProps) {
  const { theme } = useTheme();

  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const confettiScale = useSharedValue(0);
  const commonStyles = useCommonOnboarding();

  useEffect(() => {
    if (isActive) {
      iconScale.value = withDelay(
        200,
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      iconRotation.value = withDelay(
        400,
        withSequence(
          withTiming(360, { duration: 600 }),
          withTiming(0, { duration: 0 })
        )
      );
      textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
      textTranslateY.value = withDelay(
        600,
        withSpring(0, { damping: 20, stiffness: 100 })
      );
      confettiScale.value = withDelay(
        800,
        withSpring(1, { damping: 15, stiffness: 150 })
      );
    }
  }, [
    isActive,
    iconScale,
    iconRotation,
    textOpacity,
    textTranslateY,
    confettiScale,
  ]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  const getCountryName = () => {
    const countryMap: { [key: string]: string } = {
      nigeria: "Nigeria",
      ghana: "Ghana",
      kenya: "Kenya",
      cameroon: "Cameroon",
      senegal: "Senegal",
      chad: "Chad",
    };
    return countryMap[data.country] || data.country;
  };

  const getExamName = () => {
    const examMap: { [key: string]: string } = {
      waec: "WAEC",
      jamb: "JAMB",
      neco: "NECO",
      kcse: "KCSE",
      bac: "BAC",
      bepc: "BEPC",
    };
    return examMap[data.examType] || data.examType.toUpperCase();
  };

  const getSeriesName = () => {
    const seriesMap: { [key: string]: string } = {
      // BAC Series
      series_a: "Series A (Literature)",
      series_c: "Series C (Pure Sciences)",
      series_d: "Series D (Life Sciences)",
      // WAEC/NECO Series
      science: "Science Track",
      commercial: "Commercial Track",
      arts: "Arts Track",
      // JAMB Series
      science_tech: "Science & Technology",
      arts_social: "Arts & Social Sciences",
      commercial_mgmt: "Commercial & Management",
      // KCSE Series
      sciences: "Sciences Cluster",
      humanities: "Arts & Humanities",
      technical: "Technical & Applied",
    };
    // TODO: Change to data.series when backend is ready
    return seriesMap[tempSeries] || tempSeries;
  };

  const getEducationName = () => {
    const educationMap: { [key: string]: string } = {
      junior_secondary: "Junior Secondary",
      senior_secondary: "Senior Secondary",
    };
    return educationMap[data.educationLevel] || data.educationLevel;
  };

  const getLanguageName = () => {
    const languageMap: { [key: string]: string } = {
      english: "English",
      french: "French",
    };
    return languageMap[data.preferredLanguage] || data.preferredLanguage;
  };

  // Build summary items based on available data
  const summaryItems = [
    { icon: "language", text: `Learning in ${getLanguageName()}` },
    { icon: "location", text: `From ${getCountryName()}` },
    { icon: "school", text: `${getEducationName()} Level` },
    { icon: "document-text", text: `Preparing for ${getExamName()}` },
    // TODO: Change tempSeries to data.series when backend is ready
    ...(tempSeries && data.examType !== "BEPC"
      ? [{ icon: "library", text: getSeriesName() }]
      : []),
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "center",
    },
    contentContainer: {
      alignItems: "center",
    },
    confettiContainer: {
      position: "absolute",
      top: -60,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
    },
    confetti: {
      fontSize: 24,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 32,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 16,
    },
    summaryContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    summaryItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    summaryIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    summaryText: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: "600",
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Animated.View
          style={[styles.confettiContainer, confettiAnimatedStyle]}
        >
          <Text style={styles.confetti}>🎉</Text>
          <Text style={styles.confetti}>🎊</Text>
          <Text style={styles.confetti}>✨</Text>
          <Text style={styles.confetti}>🎉</Text>
          <Text style={styles.confetti}>🎊</Text>
        </Animated.View>

        <Animated.View style={[iconAnimatedStyle]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.iconContainer}
          >
            <Ionicons name="checkmark-circle" size={70} color="white" />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[textAnimatedStyle, { width: "100%" }]}>
          <Text style={commonStyles.title}>You&apos;re All Set!</Text>
          <Text style={commonStyles.subtitle}>
            Your personalized learning journey is ready to begin. Let&apos;s ace
            that exam together!
          </Text>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Your Learning Profile</Text>
            {summaryItems.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <View style={styles.summaryIcon}>
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.summaryText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
