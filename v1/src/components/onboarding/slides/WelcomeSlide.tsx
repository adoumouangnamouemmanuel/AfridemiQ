"use client";
import { View, Text, StyleSheet, Image } from "react-native";
import { useTheme } from "../../../utils/ThemeContext";
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 50,
    },
    logoImageContainer: {
      width: 150,
      height: 150,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    logoImage: {
      width: 130,
      height: 130,
      borderRadius: 35,
    },
    textContainer: {
      alignItems: "center",
    },
    welcomeText: {
      fontSize: 22,
      fontWeight: "600",
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: 12,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: theme.typography.h1.fontFamily,
    },
    title: {
      fontSize: 48,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 24,
      letterSpacing: -2,
      lineHeight: 56,
      fontFamily: theme.typography.h1.fontFamily,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 28,
      fontWeight: "600",
      paddingHorizontal: 20,
      fontStyle: "italic",
      fontFamily: theme.typography.h2.fontFamily,
      transform: [{ skewX: "-10deg" }], // Force italic appearance
      maxWidth: 320,
    },
  });

  return (
    <View style={styles.container}>
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
