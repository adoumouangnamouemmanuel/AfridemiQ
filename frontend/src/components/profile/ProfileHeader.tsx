"use client";

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import type { UserProfile } from "../../types/user/user.types";

interface ProfileHeaderProps {
  user: UserProfile;
  onUpgradeToPremium: () => void;
  onEditProfile: () => void;
  theme: any;
  isDark?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onUpgradeToPremium,
  onEditProfile,
  theme,
  isDark = false,
}) => {
  // Animation values
  const slideIn = useSharedValue(-50);
  const fadeIn = useSharedValue(0);
  const scaleIn = useSharedValue(0.9);
  const rotateAvatar = useSharedValue(0);
  const statsSlideUp = useSharedValue(30);
  const statsOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.95);

  useEffect(() => {
    // Sequence animations for a more polished feel
    slideIn.value = withDelay(
      100,
      withSpring(0, { damping: 18, stiffness: 80 })
    );
    fadeIn.value = withDelay(150, withSpring(1, { damping: 20 }));
    scaleIn.value = withDelay(250, withSpring(1, { damping: 14 }));
    rotateAvatar.value = withDelay(300, withSpring(1, { damping: 12 }));
    statsSlideUp.value = withDelay(400, withSpring(0, { damping: 20 }));
    statsOpacity.value = withDelay(450, withSpring(1));
    buttonScale.value = withDelay(550, withSpring(1, { damping: 15 }));
  }, [
    slideIn,
    fadeIn,
    scaleIn,
    rotateAvatar,
    statsSlideUp,
    statsOpacity,
    buttonScale,
  ]);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideIn.value }],
    opacity: fadeIn.value,
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleIn.value },
      {
        rotateZ: `${interpolate(
          rotateAvatar.value,
          [0, 1],
          [-10, 0],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: statsSlideUp.value }],
    opacity: statsOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get background color based on theme
  const getBackgroundColor = () => {
    return isDark ? "#1E3A8A" : "#3B82F6";
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 28,
      overflow: "hidden",
      elevation: 8,
      shadowColor: isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.25,
      shadowRadius: 16,
    },
    backgroundWrapper: {
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: getBackgroundColor(),
    },
    contentContainer: {
      padding: 24,
    },
    glassEffect: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 80,
      opacity: isDark ? 0.5 : 0.7,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    avatarContainer: {
      position: "relative",
      marginRight: 20,
    },
    avatarGlow: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.4)"
        : "rgba(255, 255, 255, 0.3)",
      top: -5,
      left: -5,
    },
    avatarOuterRing: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: isDark ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.8)",
      padding: 3,
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.7 : 0.5,
      shadowRadius: 10,
      elevation: 10,
    },
    avatarInnerRing: {
      width: "100%",
      height: "100%",
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: isDark ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.6)",
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.3)"
        : "rgba(255, 255, 255, 0.2)",
      overflow: "hidden",
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 45,
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.4)"
        : "rgba(59, 130, 246, 0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: "white",
      fontSize: 32,
      fontWeight: "800",
      fontFamily: "Inter-Bold",
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    editAvatarButton: {
      position: "absolute",
      bottom: -4,
      right: -4,
      backgroundColor: isDark ? theme.colors.surface : "white",
      borderRadius: 18,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#3B82F6",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    profileInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: "800",
      color: "white",
      marginBottom: 6,
      fontFamily: "Inter-Bold",
      letterSpacing: -0.5,
      textShadowColor: "rgba(0, 0, 0, 0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    userDetailsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    userDetails: {
      fontSize: 13,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Inter-SemiBold",
      fontWeight: "600",
    },
    separator: {
      color: "rgba(255,255,255,0.6)",
      marginHorizontal: 6,
      fontSize: 15,
    },
    countryContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    countryIcon: {
      marginRight: 6,
      color: "rgba(255,255,255,0.9)",
    },
    countryText: {
      fontSize: 13,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Inter-SemiBold",
      fontWeight: "600",
    },
    verificationBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark
        ? "rgba(16, 185, 129, 0.3)"
        : "rgba(16, 185, 129, 0.25)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      marginTop: 8,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(16, 185, 129, 0.5)"
        : "rgba(16, 185, 129, 0.4)",
    },
    verificationText: {
      color: isDark ? "#34D399" : "#10B981",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
      fontFamily: "Inter-SemiBold",
    },
    statsContainer: {
      marginTop: 8,
      marginBottom: 20,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.1)"
        : "rgba(255,255,255,0.15)",
      borderRadius: 20,
      padding: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.25)",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: "800",
      color: "white",
      fontFamily: "Inter-Bold",
      textShadowColor: "rgba(0, 0, 0, 0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    statLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.9)",
      marginTop: 4,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
    },
    actionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    actionButton: {
      flex: 1,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.15)"
        : "rgba(255,255,255,0.2)",
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.3)",
      minHeight: 44,
    },
    premiumButton: {
      backgroundColor: isDark
        ? "rgba(255, 215, 0, 0.2)"
        : "rgba(255, 215, 0, 0.25)",
      borderColor: isDark ? "rgba(255, 215, 0, 0.4)" : "rgba(255, 215, 0, 0.5)",
    },
    actionButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
      fontFamily: "Inter-SemiBold",
    },
    premiumButtonText: {
      color: "#FFD700",
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
    levelBadge: {
      position: "absolute",
      top: -5,
      right: -5,
      backgroundColor: "#3B82F6",
      borderRadius: 14,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 2,
      borderColor: isDark ? "rgba(255,255,255,0.9)" : "white",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    levelText: {
      color: "white",
      fontSize: 12,
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
  });

  return (
    <Animated.View style={[styles.container, headerAnimatedStyle]}>
      <View style={styles.backgroundWrapper}>
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Glass effect at the top */}
        {Platform.OS === "ios" && (
          <BlurView
            intensity={20}
            tint={isDark ? "dark" : "light"}
            style={styles.glassEffect}
          />
        )}

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Animated.View
              style={[styles.avatarContainer, avatarAnimatedStyle]}
            >
              <View style={styles.avatarGlow} />
              <View style={styles.avatarOuterRing}>
                <View style={styles.avatarInnerRing}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(user.name)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lvl {user.progress.level}</Text>
              </View>

              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={onEditProfile}
              >
                <Ionicons
                  name="camera"
                  size={18}
                  color={isDark ? theme.colors.primary : "#3B82F6"}
                />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={styles.userDetailsRow}>
                <Text style={styles.userDetails}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.userDetails}>
                  {user.progress.xp.toLocaleString()} XP
                </Text>
              </View>

              <View style={styles.countryContainer}>
                <Ionicons
                  name="location"
                  size={14}
                  style={styles.countryIcon}
                />
                <Text style={styles.countryText}>{user.country}</Text>
              </View>

              {user.isPhoneVerified && (
                <View style={styles.verificationBadge}>
                  <Ionicons
                    name="shield-checkmark"
                    size={14}
                    color={isDark ? "#34D399" : "#10B981"}
                  />
                  <Text style={styles.verificationText}>Verified Account</Text>
                </View>
              )}
            </View>
          </View>

          <Animated.View style={[styles.statsContainer, statsAnimatedStyle]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {user.progress.streak.current}
                </Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {user.progress.badges.length}
                </Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {user.progress.completedTopics.length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {user.progress.weakSubjects.length}
                </Text>
                <Text style={styles.statLabel}>Focus Areas</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.actionsRow}>
            <Animated.View style={[{ flex: 1 }, buttonAnimatedStyle]}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onEditProfile}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={18} color="white" />
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </Animated.View>

            {!user.isPremium && (
              <Animated.View style={[{ flex: 1 }, buttonAnimatedStyle]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.premiumButton]}
                  onPress={onUpgradeToPremium}
                  activeOpacity={0.8}
                >
                  <Ionicons name="star" size={18} color="#FFD700" />
                  <Text
                    style={[styles.actionButtonText, styles.premiumButtonText]}
                  >
                    Go Premium
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
