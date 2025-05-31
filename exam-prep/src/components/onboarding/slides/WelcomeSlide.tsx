"use client";

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import type { OnboardingData } from "../OnboardingCarousel";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

export default function WelcomeSlide({ isActive }: SlideProps) {
  const { theme } = useTheme();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const featureOpacity1 = useSharedValue(0);
  const featureOpacity2 = useSharedValue(0);
  const featureOpacity3 = useSharedValue(0);

  React.useEffect(() => {
    if (isActive) {
      // Logo animation
      logoOpacity.value = withTiming(1, { duration: 800 });
      logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });

      // Text animation
      textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));

      // Feature animations with staggered delay
      featureOpacity1.value = withDelay(600, withTiming(1, { duration: 500 }));
      featureOpacity2.value = withDelay(800, withTiming(1, { duration: 500 }));
      featureOpacity3.value = withDelay(1000, withTiming(1, { duration: 500 }));
    }
  }, [
    isActive,
    logoOpacity,
    logoScale,
    textOpacity,
    featureOpacity1,
    featureOpacity2,
    featureOpacity3,
  ]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const featureAnimatedStyle1 = useAnimatedStyle(() => ({
    opacity: featureOpacity1.value,
  }));

  const featureAnimatedStyle2 = useAnimatedStyle(() => ({
    opacity: featureOpacity2.value,
  }));

  const featureAnimatedStyle3 = useAnimatedStyle(() => ({
    opacity: featureOpacity3.value,
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 20,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 40,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    logoIcon: {
      fontSize: 60,
      color: "white",
    },
    textContainer: {
      alignItems: "center",
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    featuresContainer: {
      width: "100%",
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
    },
    featureIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    featureDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });

  const features = [
    {
      icon: "school",
      color: "#3b82f6",
      title: "Personalized Learning",
      description: "Study plans tailored to your needs",
      style: featureAnimatedStyle1,
    },
    {
      icon: "trophy",
      color: "#10b981",
      title: "Track Your Progress",
      description: "See your improvement over time",
      style: featureAnimatedStyle2,
    },
    {
      icon: "people",
      color: "#f59e0b",
      title: "Study Together",
      description: "Connect with other students",
      style: featureAnimatedStyle3,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>📚</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={styles.title}>Welcome to StudyPro</Text>
          <Text style={styles.subtitle}>
            Your personalized exam preparation journey starts here. Let&apos;s set up
            your profile to get started!
          </Text>
        </Animated.View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Animated.View
              key={index}
              style={[styles.featureItem, feature.style]}
            >
              <View
                style={[
                  styles.featureIconContainer,
                  { backgroundColor: `${feature.color}20` },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color={feature.color}
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
