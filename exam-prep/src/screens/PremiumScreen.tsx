"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

export default function PremiumScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$9.99",
      period: "/month",
      savings: null,
      popular: false,
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "$59.99",
      period: "/year",
      savings: "Save 50%",
      popular: true,
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "$199.99",
      period: "one-time",
      savings: "Best Value",
      popular: false,
    },
  ];

  const features = [
    {
      icon: "infinite",
      title: "Unlimited Quizzes",
      description: "Access to all quiz questions and practice tests",
      free: false,
    },
    {
      icon: "analytics",
      title: "Advanced Analytics",
      description: "Detailed performance insights and progress tracking",
      free: false,
    },
    {
      icon: "download",
      title: "Offline Mode",
      description: "Download content for offline studying",
      free: false,
    },
    {
      icon: "school",
      title: "Expert Explanations",
      description: "Detailed explanations for every question",
      free: false,
    },
    {
      icon: "trophy",
      title: "Priority Support",
      description: "Get help faster with premium support",
      free: false,
    },
    {
      icon: "remove-circle",
      title: "Ad-Free Experience",
      description: "Study without interruptions",
      free: false,
    },
    {
      icon: "people",
      title: "Study Groups",
      description: "Join exclusive study groups and competitions",
      free: false,
    },
    {
      icon: "calendar",
      title: "Custom Study Plans",
      description: "AI-powered personalized study schedules",
      free: false,
    },
  ];

  const handleSubscribe = () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    Alert.alert(
      "Subscribe to Premium",
      `You're about to subscribe to the ${plan?.name} plan for ${plan?.price}${plan?.period}. This will unlock all premium features.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Subscribe",
          onPress: () => {
            Alert.alert(
              "Success! 🎉",
              "Welcome to ExamPrep Premium! All features are now unlocked."
            );
            router.back();
          },
        },
      ]
    );
  };

  const handleRestorePurchases = () => {
    Alert.alert("Restore Purchases", "No previous purchases found.");
  };

  const AnimatedCard = ({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) => {
    const translateY = useSharedValue(50);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
      translateY.value = withDelay(delay, withSpring(0));
      opacity.value = withDelay(delay, withSpring(1));
    }, [delay, opacity, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
  };

  const PlanCard = ({ plan, index }: { plan: any; index: number }) => {
    const isSelected = selectedPlan === plan.id;

    return (
      <AnimatedCard delay={200 + index * 100}>
        <TouchableOpacity
          style={[
            styles.planCard,
            isSelected && styles.planCardSelected,
            plan.popular && styles.planCardPopular,
          ]}
          onPress={() => setSelectedPlan(plan.id)}
        >
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Most Popular</Text>
            </View>
          )}

          <View style={styles.planHeader}>
            <Text style={styles.planName}>{plan.name}</Text>
            {plan.savings && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>{plan.savings}</Text>
              </View>
            )}
          </View>

          <View style={styles.planPricing}>
            <Text style={styles.planPrice}>{plan.price}</Text>
            <Text style={styles.planPeriod}>{plan.period}</Text>
          </View>

          <View style={styles.planSelection}>
            <View
              style={[
                styles.radioButton,
                isSelected && styles.radioButtonSelected,
              ]}
            >
              {isSelected && <View style={styles.radioButtonInner} />}
            </View>
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  const FeatureItem = ({ feature, index }: { feature: any; index: number }) => (
    <AnimatedCard delay={400 + index * 50}>
      <View style={styles.featureItem}>
        <View style={styles.featureIcon}>
          <Ionicons
            name={feature.icon as any}
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDescription}>{feature.description}</Text>
        </View>
        <View style={styles.featureStatus}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.success}
          />
        </View>
      </View>
    </AnimatedCard>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    backButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.md,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    heroSection: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    heroIcon: {
      alignSelf: "center",
      marginBottom: theme.spacing.lg,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "white",
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    heroSubtitle: {
      fontSize: 16,
      color: "rgba(255,255,255,0.9)",
      textAlign: "center",
      lineHeight: 24,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      textAlign: "center",
    },
    plansContainer: {
      marginBottom: theme.spacing.xl,
    },
    planCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      position: "relative",
    },
    planCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "10",
    },
    planCardPopular: {
      borderColor: theme.colors.secondary,
    },
    popularBadge: {
      position: "absolute",
      top: -10,
      left: theme.spacing.lg,
      backgroundColor: theme.colors.secondary,
      borderRadius: 12,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 4,
    },
    popularBadgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    planHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    planName: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
    },
    savingsBadge: {
      backgroundColor: theme.colors.success + "20",
      borderRadius: 8,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    savingsText: {
      color: theme.colors.success,
      fontSize: 12,
      fontWeight: "600",
    },
    planPricing: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: theme.spacing.md,
    },
    planPrice: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    planPeriod: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    planSelection: {
      alignItems: "flex-end",
    },
    radioButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    radioButtonSelected: {
      borderColor: theme.colors.primary,
    },
    radioButtonInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    featuresContainer: {
      marginBottom: theme.spacing.xl,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    featureIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
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
    featureStatus: {
      marginLeft: theme.spacing.sm,
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    subscribeButton: {
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    subscribeButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
    },
    restoreButton: {
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
    },
    restoreButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: "500",
    },
    disclaimer: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    disclaimerText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ExamPrep Premium</Text>
        </View>

        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.heroSection}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="diamond" size={64} color="white" />
          </View>
          <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited access to all features and accelerate your exam
            preparation with premium tools and content.
          </Text>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedCard delay={100}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        </AnimatedCard>

        <View style={styles.plansContainer}>
          {plans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </View>

        <AnimatedCard delay={300}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
        </AnimatedCard>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <FeatureItem key={index} feature={feature} index={index} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSubscribe}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.subscribeButton}
          >
            <Text style={styles.subscribeButtonText}>
              Start Premium - {plans.find((p) => p.id === selectedPlan)?.price}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Subscription automatically renews unless auto-renew is turned off at
            least 24 hours before the end of the current period. You can manage
            your subscription in your account settings.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
