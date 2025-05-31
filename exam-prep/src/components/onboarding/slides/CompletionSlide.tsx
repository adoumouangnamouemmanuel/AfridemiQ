"use client";

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
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
import type { OnboardingData } from "../OnboardingCarousel";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

export default function CompletionSlide({ data, isActive }: SlideProps) {
  const { theme } = useTheme();

  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const confettiScale = useSharedValue(0);

  React.useEffect(() => {
    if (isActive) {
      // Icon animation
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

      // Text animation
      textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
      textTranslateY.value = withDelay(
        600,
        withSpring(0, { damping: 20, stiffness: 100 })
      );

      // Confetti animation
      confettiScale.value = withDelay(
        800,
        withSpring(1, { damping: 15, stiffness: 150 })
      );
    }
  }, [isActive, iconScale, iconRotation, textOpacity, textTranslateY, confettiScale]);

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    contentContainer: {
      alignItems: "center",
      paddingTop: 20,
      paddingBottom: 40,
    },
    confettiContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 20,
    },
    confetti: {
      fontSize: 30,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 40,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
    },
    title: {
      fontSize: 32,
      fontWeight: "900",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 16,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      fontWeight: "500",
      marginBottom: 32,
    },
    summaryContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 24,
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
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
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    summaryText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: "500",
      flex: 1,
    },
  });

  const getExamName = () => {
    const examMap: { [key: string]: string } = {
      waec: "WAEC",
      jamb: "JAMB",
      neco: "NECO",
      bece: "BECE",
      igcse: "IGCSE",
      sat: "SAT",
      other: "Other",
    };
    return examMap[data.exam] || data.exam.toUpperCase();
  };

  const summaryItems = [
    { icon: "location", text: `From ${data.country}` },
    { icon: "school", text: `Preparing for ${getExamName()}` },
    { icon: "book", text: `${data.subjects.length} subjects selected` },
    { icon: "eye", text: `${data.learningStyle} learner` },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        <Animated.View
          style={[styles.confettiContainer, confettiAnimatedStyle]}
        >
          <Text style={styles.confetti}>🎉</Text>
          <Text style={styles.confetti}>🎊</Text>
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
          <Text style={styles.title}>You&apos;re All Set!</Text>
          <Text style={styles.subtitle}>
            Your personalized learning journey is ready to begin. Let&apos;s ace that
            exam!
          </Text>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Your Profile Summary</Text>
            {summaryItems.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <View style={styles.summaryIcon}>
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.summaryText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
