"use client";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useTheme } from "../../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import type { OnboardingData } from "../../../types/user/user.types";
import { useEffect } from "react";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

export default function WelcomeSlide({ isActive }: SlideProps) {
  const { theme } = useTheme();

  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(-180);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);
  const featuresOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      logoScale.value = withDelay(
        200,
        withSpring(1, { damping: 15, stiffness: 100 })
      );
      logoRotation.value = withDelay(
        400,
        withSpring(0, { damping: 20, stiffness: 80 })
      );
      textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
      textTranslateY.value = withDelay(
        600,
        withSpring(0, { damping: 20, stiffness: 100 })
      );
      featuresOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 0,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    logoImageContainer: {
      width: 130,
      height: 130,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 8,
    },
    logoImage: {
      width: 120,
      height: 120,
      borderRadius: 30,
    },
    textContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    welcomeText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: 8,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    title: {
      fontSize: 35,
      fontWeight: "900",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 15,
      letterSpacing: -1.5,
      lineHeight: 48,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      fontWeight: "500",
      paddingHorizontal: 10,
      fontStyle: "italic",
    },
    featuresContainer: {
      width: "100%",
      gap: 14,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      paddingVertical: 15,
      paddingHorizontal: 24,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    featureIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 20,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 6,
    },
    featureDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      fontWeight: "500",
    },
  });

  const features = [
    {
      icon: "school-outline",
      title: "African Excellence",
      description: "Exam preparation tailored for African educational systems",
      gradient: ["#3b82f6", "#1d4ed8"] as const,
    },
    {
      icon: "analytics-outline",
      title: "Smart Analytics",
      description: "Track your progress with intelligent performance insights",
      gradient: ["#10b981", "#059669"] as const,
    },
    {
      icon: "people-outline",
      title: "Community Learning",
      description: "Connect with ambitious students across Africa",
      gradient: ["#f59e0b", "#d97706"] as const,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoImageContainer}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.title}>AfridemiQ</Text>
          <Text style={styles.subtitle}>
            &quot;Where African Academic Intelligence Meets Excellence&quot;
            {"\n"}
            Unlock your potential. Master your exams.
          </Text>
        </Animated.View>

        <Animated.View
          style={[styles.featuresContainer, featuresAnimatedStyle]}
        >
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureIconContainer}
              >
                <Ionicons name={feature.icon as any} size={28} color="white" />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
