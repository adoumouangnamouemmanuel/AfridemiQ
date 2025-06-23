"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useTheme } from "../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PremiumModal({
  visible,
  onClose,
  onUpgrade,
}: PremiumModalProps) {
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  const pulseAnimation = useSharedValue(1);
  pulseAnimation.value = withRepeat(withTiming(1.05), -1, true);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
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
      icon: "checkmark-circle",
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
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 0,
      width: "90%",
      maxHeight: "85%",
      overflow: "hidden",
    },
    header: {
      padding: 20,
      alignItems: "center",
      position: "relative",
    },
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    crownIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    content: {
      flex: 1,
    },
    plansContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    plansTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    planCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    selectedPlan: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "10",
    },
    popularBadge: {
      position: "absolute",
      top: -8,
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
      marginBottom: 16,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
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
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    upgradeButton: {
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginBottom: 12,
    },
    upgradeButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "white",
    },
    termsText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 16,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            <LinearGradient
              colors={[theme.colors.warning, theme.colors.warning + "80"]}
              style={styles.crownIcon}
            >
              <Ionicons name="diamond" size={30} color="white" />
            </LinearGradient>

            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              Unlock all features and accelerate your exam preparation
            </Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>

          <View style={styles.footer}>
            <Animated.View style={pulseStyle}>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={onUpgrade}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <Text style={styles.upgradeButtonText}>
                  Start Free Trial -{" "}
                  {selectedPlan === "yearly" ? "$59.99/year" : "$9.99/month"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.termsText}>
              7-day free trial, then{" "}
              {selectedPlan === "yearly" ? "$59.99/year" : "$9.99/month"}.
              Cancel anytime.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}