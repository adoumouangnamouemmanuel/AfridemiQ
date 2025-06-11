"use client";

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import type { UserProfile } from "../../services/user/api.profile.service";


interface ProfileHeaderProps {
  user: UserProfile;
  onUpgradeToPremium: () => void;
  onEditProfile: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onUpgradeToPremium,
  onEditProfile,
}) => {
  const slideIn = useSharedValue(-100);
  const fadeIn = useSharedValue(0);
  const scaleIn = useSharedValue(0.8);

  React.useEffect(() => {
    slideIn.value = withDelay(100, withSpring(0, { damping: 20 }));
    fadeIn.value = withDelay(200, withSpring(1));
    scaleIn.value = withDelay(300, withSpring(1, { damping: 15 }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideIn.value }],
    opacity: fadeIn.value,
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleIn.value }],
  }));

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 24,
      overflow: "hidden",
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    gradient: {
      padding: 24,
      paddingTop: 40,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    avatarContainer: {
      position: "relative",
      marginRight: 20,
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: "rgba(255,255,255,0.25)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: "rgba(255,255,255,0.3)",
    },
    avatarText: {
      color: "white",
      fontSize: 32,
      fontWeight: "800",
      fontFamily: "Inter-Bold",
    },
    editAvatarButton: {
      position: "absolute",
      bottom: -2,
      right: -2,
      backgroundColor: "rgba(255,255,255,0.9)",
      borderRadius: 16,
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "white",
    },
    profileInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 26,
      fontWeight: "800",
      color: "white",
      marginBottom: 6,
      fontFamily: "Inter-Bold",
      letterSpacing: -0.5,
    },
    userDetailsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    userDetails: {
      fontSize: 15,
      color: "rgba(255,255,255,0.85)",
      fontFamily: "Inter-SemiBold",
      fontWeight: "600",
    },
    separator: {
      color: "rgba(255,255,255,0.6)",
      marginHorizontal: 6,
      fontSize: 15,
    },
    countryText: {
      fontSize: 15,
      color: "rgba(255,255,255,0.85)",
      marginBottom: 4,
      fontFamily: "Inter-SemiBold",
      fontWeight: "600",
    },
    verificationBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(16, 185, 129, 0.2)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 8,
      alignSelf: "flex-start",
    },
    verificationText: {
      color: "#10B981",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
      fontFamily: "Inter-SemiBold",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statValue: {
      fontSize: 22,
      fontWeight: "800",
      color: "white",
      fontFamily: "Inter-Bold",
    },
    statLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      marginTop: 2,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
    },
    actionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    actionButton: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.3)",
    },
    premiumButton: {
      backgroundColor: "rgba(255, 215, 0, 0.2)",
      borderColor: "rgba(255, 215, 0, 0.5)",
    },
    actionButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
      fontFamily: "Inter-SemiBold",
    },
    premiumButtonText: {
      color: "#FFD700",
    },
  });

  return (
    <Animated.View style={[styles.container, headerAnimatedStyle]}>
      <LinearGradient
        colors={["#3B82F6", "#1D4ED8", "#1E40AF"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Animated.View style={[styles.avatarContainer, avatarAnimatedStyle]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={onEditProfile}
            >
              <Ionicons name="camera" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.userDetailsRow}>
              <Text style={styles.userDetails}>
                Level {user.progress.level}
              </Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.userDetails}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>
            </View>
            <Text style={styles.countryText}>{user.country}</Text>
            {user.isPhoneVerified && (
              <View style={styles.verificationBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.verificationText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.progress.xp.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>XP Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.progress.streak.current}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.progress.badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.progress.completedTopics.length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onEditProfile}>
            <Ionicons name="person-outline" size={16} color="white" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          {!user.isPremium && (
            <TouchableOpacity
              style={[styles.actionButton, styles.premiumButton]}
              onPress={onUpgradeToPremium}
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={[styles.actionButtonText, styles.premiumButtonText]}>
                Go Premium
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
