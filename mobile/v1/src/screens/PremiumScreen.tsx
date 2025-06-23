"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../utils/ThemeContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

export default function PremiumScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const insets = useSafeAreaInsets();

  // Animation values
  const buttonScale = useSharedValue(1);
  const featureOpacity = useSharedValue(0);
  const featureTranslateY = useSharedValue(20);

  // Start animations
  buttonScale.value = withRepeat(
    withSequence(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    true
  );

  // Animate features in
  featureOpacity.value = withTiming(1, { duration: 800 });
  featureTranslateY.value = withTiming(0, { duration: 800 });

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const featureAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featureOpacity.value,
    transform: [{ translateY: featureTranslateY.value }],
  }));

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$9.99",
      period: "/month",
      savings: null,
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "$59.99",
      period: "/year",
      savings: "Save 50%",
      popular: true,
    },
  ];

  const features = [
    {
      icon: "book",
      title: "Unlimited Practice Tests",
      description: "Access to all past exam papers and practice questions",
    },
    {
      icon: "bulb",
      title: "Detailed Explanations",
      description: "Step-by-step solutions for every question",
    },
    {
      icon: "analytics",
      title: "Advanced Analytics",
      description: "Track your progress with detailed performance insights",
    },
    {
      icon: "download",
      title: "Offline Access",
      description: "Download content to study without internet",
    },
    {
      icon: "people",
      title: "Priority Support",
      description: "Get help from our expert tutors",
    },
    {
      icon: "trophy",
      title: "Exclusive Content",
      description: "Access premium study materials and video lessons",
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: insets.top,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
    },
    content: {
      flex: 1,
    },
    heroSection: {
      padding: 24,
      alignItems: "center",
    },
    diamondIcon: {
      width: 80,
      height: 80,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      borderRadius: 40,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 12,
    },
    heroSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 24,
    },
    plansContainer: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    plansTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16,
    },
    planCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    selectedPlan: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "10",
    },
    popularBadge: {
      position: "absolute",
      top: -10,
      right: 16,
      backgroundColor: theme.colors.warning,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    popularText: {
      fontSize: 12,
      fontWeight: "600",
      color: "white",
    },
    planHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    planName: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },
    planPrice: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.primary,
    },
    planPeriod: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    planSavings: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.success,
    },
    featuresContainer: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    featuresTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    featureDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    testimonialsContainer: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    testimonialsTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16,
    },
    testimonialCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    testimonialText: {
      fontSize: 14,
      color: theme.colors.text,
      fontStyle: "italic",
      lineHeight: 22,
      marginBottom: 12,
    },
    testimonialAuthor: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    footer: {
      padding: 20,
      paddingBottom: Math.max(insets.bottom + 20, 40),
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    upgradeButton: {
      borderRadius: 12,
      padding: 18,
      alignItems: "center",
      marginBottom: 12,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    upgradeButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "white",
    },
    restoreButton: {
      alignItems: "center",
      paddingVertical: 12,
    },
    restoreText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    termsText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 16,
      marginTop: 12,
    },
    comparisonContainer: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    comparisonTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16,
    },
    comparisonTable: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: theme.colors.primary + "10",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tableHeaderCell: {
      flex: 1,
      padding: 12,
      alignItems: "center",
    },
    tableHeaderText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tableLastRow: {
      borderBottomWidth: 0,
    },
    tableCell: {
      flex: 1,
      padding: 12,
      alignItems: "center",
    },
    tableCellText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    guaranteeContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.success + "20",
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.success + "30",
    },
    guaranteeIcon: {
      marginRight: 16,
    },
    guaranteeText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.success,
      lineHeight: 20,
      fontWeight: "500",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ExamPrep Premium</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.diamondIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="diamond" size={40} color="white" />
          </LinearGradient>
          <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited access to all features and accelerate your exam
            preparation with premium tools and content.
          </Text>
        </View>

        <Animated.View style={featureAnimatedStyle}>
          <View style={styles.comparisonContainer}>
            <Text style={styles.comparisonTitle}>Free vs Premium</Text>
            <View style={styles.comparisonTable}>
              <View style={styles.tableHeader}>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Feature</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Free</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Premium</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellText}>Practice Tests</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellText}>Limited</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { color: theme.colors.success },
                    ]}
                  >
                    Unlimited
                  </Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellText}>Detailed Solutions</Text>
                </View>
                <View style={styles.tableCell}>
                  <Ionicons name="close" size={20} color={theme.colors.error} />
                </View>
                <View style={styles.tableCell}>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.success}
                  />
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellText}>
                    Performance Analytics
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellText}>Basic</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text
                    style={[
                      styles.tableCellText,
                      { color: theme.colors.success },
                    ]}
                  >
                    Advanced
                  </Text>
                </View>
              </View>
              <View style={[styles.tableRow, styles.tableLastRow]}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellText}>Offline Access</Text>
                </View>
                <View style={styles.tableCell}>
                  <Ionicons name="close" size={20} color={theme.colors.error} />
                </View>
                <View style={styles.tableCell}>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.success}
                  />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Choose Your Plan</Text>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.selectedPlan,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={{ alignItems: "flex-end" }}>
                  <View
                    style={{ flexDirection: "row", alignItems: "baseline" }}
                  >
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                  {plan.savings && (
                    <Text style={styles.planSavings}>{plan.savings}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View style={featureAnimatedStyle}>
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Premium Features</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons
                    name={feature.icon as any}
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.guaranteeContainer}>
          <Ionicons
            name="shield-checkmark"
            size={24}
            color={theme.colors.success}
            style={styles.guaranteeIcon}
          />
          <Text style={styles.guaranteeText}>
            7-day money-back guarantee. Not satisfied? Get a full refund, no
            questions asked.
          </Text>
        </View>

        <View style={styles.testimonialsContainer}>
          <Text style={styles.testimonialsTitle}>What Our Users Say</Text>
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              &quot;The detailed explanations helped me understand complex concepts.
              I improved my grades significantly!&quot;
            </Text>
            <Text style={styles.testimonialAuthor}>- Sarah K.</Text>
          </View>
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              &quot;The practice tests are exactly like the real exams. I felt so
              prepared on exam day.&quot;
            </Text>
            <Text style={styles.testimonialAuthor}>- Michael O.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.back()}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Text style={styles.upgradeButtonText}>
              Start Premium -{" "}
              {selectedPlan === "yearly" ? "$59.99/year" : "$9.99/month"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          Subscription automatically renews unless auto-renew is turned off at
          least 24 hours before the end of the current period. You can manage
          your subscription in your account settings.
        </Text>
      </View>
    </View>
  );
}
