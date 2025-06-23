"use client";

import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ProfileScreenSkeletonProps {
  theme: any;
  isDark?: boolean;
}

export const ProfileScreenSkeleton: React.FC<ProfileScreenSkeletonProps> = ({
  theme,
  isDark = false,
}) => {
  // Animation values for shimmer effect
  const shimmerValue = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const tabsOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    // Start shimmer animation
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1, // Infinite repeat
      true // Reverse
    );

    // Staggered appearance animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    tabsOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    contentOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    contentTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, [
    headerOpacity,
    tabsOpacity,
    contentOpacity,
    contentTranslateY,
    shimmerValue,
  ]);

  // Shimmer animation style
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.3,
      transform: [
        {
          translateX: withTiming(
            shimmerValue.value * SCREEN_WIDTH * 2 - SCREEN_WIDTH,
            { duration: 1000 }
          ),
        },
      ],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const tabsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tabsOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  // Pulse animation for avatar
  const avatarPulse = useSharedValue(1);

  useEffect(() => {
    avatarPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [avatarPulse]);

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarPulse.value }],
  }));

  // Get gradient colors based on theme
  const getGradientColors = (): [string, string, ...string[]] => {
    return isDark
      ? ["#1E40AF", "#3B82F6", "#60A5FA"]
      : ["#4F46E5", "#3B82F6", "#0EA5E9"];
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    headerContainer: {
      marginHorizontal: 16,
      marginTop: 16,
      height: 320,
      borderRadius: 28,
      overflow: "hidden",
      elevation: 8,
      shadowColor: isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.25,
      shadowRadius: 16,
    },
    headerGradient: {
      flex: 1,
      padding: 24,
    },
    headerContent: {
      flex: 1,
    },
    avatarRow: {
      flexDirection: "row",
      marginBottom: 24,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(255,255,255,0.2)",
      marginRight: 20,
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.3)",
    },
    textColumn: {
      flex: 1,
      justifyContent: "center",
    },
    namePlaceholder: {
      height: 28,
      width: "80%",
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 8,
      marginBottom: 12,
    },
    detailsPlaceholder: {
      height: 16,
      width: "60%",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 6,
      marginBottom: 8,
    },
    smallDetailPlaceholder: {
      height: 14,
      width: "40%",
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 6,
      marginBottom: 8,
    },
    badgePlaceholder: {
      height: 24,
      width: "50%",
      backgroundColor: "rgba(16, 185, 129, 0.25)",
      borderRadius: 12,
      marginTop: 8,
    },
    statsContainer: {
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 20,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.25)",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statValuePlaceholder: {
      height: 24,
      width: 30,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 6,
      marginBottom: 8,
    },
    statLabelPlaceholder: {
      height: 12,
      width: 40,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 4,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    actionButtonPlaceholder: {
      flex: 1,
      height: 48,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.3)",
    },
    premiumButtonPlaceholder: {
      backgroundColor: "rgba(255, 215, 0, 0.25)",
      borderColor: "rgba(255, 215, 0, 0.5)",
    },
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 4,
      marginHorizontal: 16,
      marginVertical: 16,
      height: 60,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    tabPlaceholder: {
      flex: 1,
      borderRadius: 12,
      margin: 4,
    },
    activeTabPlaceholder: {
      backgroundColor: "#3B82F6",
    },
    inactiveTabPlaceholder: {
      backgroundColor: "transparent",
    },
    sectionTitle: {
      height: 24,
      width: "40%",
      backgroundColor: theme.colors.border,
      borderRadius: 8,
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    cardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    cardItem: {
      flex: 1,
      alignItems: "center",
    },
    cardValuePlaceholder: {
      height: 24,
      width: 40,
      backgroundColor: theme.colors.border,
      borderRadius: 6,
      marginBottom: 8,
    },
    cardLabelPlaceholder: {
      height: 12,
      width: 60,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
    },
    progressCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    progressTitlePlaceholder: {
      height: 20,
      width: "50%",
      backgroundColor: theme.colors.border,
      borderRadius: 6,
    },
    progressValuePlaceholder: {
      height: 20,
      width: "20%",
      backgroundColor: theme.colors.border,
      borderRadius: 6,
    },
    progressBarContainer: {
      height: 12,
      backgroundColor: theme.colors.border,
      borderRadius: 6,
      marginBottom: 16,
    },
    shimmerGradient: {
      width: "200%",
      height: "100%",
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    decorativeCircle1: {
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(255,255,255,0.1)",
      top: -50,
      right: -30,
    },
    decorativeCircle2: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.06)"
        : "rgba(255,255,255,0.08)",
      bottom: -30,
      left: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.container}>
        {/* Header Skeleton */}
        <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Decorative elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            <View style={styles.headerContent}>
              <View style={styles.avatarRow}>
                <Animated.View
                  style={[styles.avatarPlaceholder, avatarAnimatedStyle]}
                />
                <View style={styles.textColumn}>
                  <View style={styles.namePlaceholder} />
                  <View style={styles.detailsPlaceholder} />
                  <View style={styles.smallDetailPlaceholder} />
                  <View style={styles.badgePlaceholder} />
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <View style={styles.statValuePlaceholder} />
                    <View style={styles.statLabelPlaceholder} />
                  </View>
                  <View style={styles.statItem}>
                    <View style={styles.statValuePlaceholder} />
                    <View style={styles.statLabelPlaceholder} />
                  </View>
                  <View style={styles.statItem}>
                    <View style={styles.statValuePlaceholder} />
                    <View style={styles.statLabelPlaceholder} />
                  </View>
                  <View style={styles.statItem}>
                    <View style={styles.statValuePlaceholder} />
                    <View style={styles.statLabelPlaceholder} />
                  </View>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <View style={styles.actionButtonPlaceholder} />
                <View
                  style={[
                    styles.actionButtonPlaceholder,
                    styles.premiumButtonPlaceholder,
                  ]}
                />
              </View>
            </View>
          </LinearGradient>

          {/* Shimmer effect */}
          <Animated.View style={shimmerAnimatedStyle}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </Animated.View>

        {/* Tabs Skeleton */}
        <Animated.View style={[styles.tabsContainer, tabsAnimatedStyle]}>
          <View style={[styles.tabPlaceholder, styles.activeTabPlaceholder]} />
          <View
            style={[styles.tabPlaceholder, styles.inactiveTabPlaceholder]}
          />
          <View
            style={[styles.tabPlaceholder, styles.inactiveTabPlaceholder]}
          />
          <View
            style={[styles.tabPlaceholder, styles.inactiveTabPlaceholder]}
          />
        </Animated.View>

        {/* Content Skeleton */}
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <View style={styles.sectionTitle} />

          {/* Stats Card */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardItem}>
                <View style={styles.cardValuePlaceholder} />
                <View style={styles.cardLabelPlaceholder} />
              </View>
              <View style={styles.cardItem}>
                <View style={styles.cardValuePlaceholder} />
                <View style={styles.cardLabelPlaceholder} />
              </View>
              <View style={styles.cardItem}>
                <View style={styles.cardValuePlaceholder} />
                <View style={styles.cardLabelPlaceholder} />
              </View>
            </View>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressTitlePlaceholder} />
              <View style={styles.progressValuePlaceholder} />
            </View>
            <View style={styles.progressBarContainer} />
            <View style={styles.progressHeader}>
              <View style={styles.progressTitlePlaceholder} />
              <View style={styles.progressValuePlaceholder} />
            </View>
            <View style={styles.progressBarContainer} />
          </View>

          {/* Another Card */}
          <View style={styles.card}>
            <View style={styles.progressHeader}>
              <View style={styles.progressTitlePlaceholder} />
            </View>
            <View style={styles.cardRow}>
              <View style={styles.cardItem}>
                <View style={styles.cardValuePlaceholder} />
                <View style={styles.cardLabelPlaceholder} />
              </View>
              <View style={styles.cardItem}>
                <View style={styles.cardValuePlaceholder} />
                <View style={styles.cardLabelPlaceholder} />
              </View>
            </View>
          </View>

          {/* Shimmer effect for content */}
          <Animated.View style={shimmerAnimatedStyle}>
            <LinearGradient
              colors={["transparent", "rgba(200,200,200,0.2)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};
