"use client";

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import type { UserProfile } from "../../services/user/api.profile.service";

interface StatsGridProps {
  user: UserProfile;
  theme: any;
}

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
  delay: number;
  theme: any;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color,
  delay,
  theme,
}) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 15 }));
    opacity.value = withDelay(delay, withSpring(1));
  }, [delay, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const styles = StyleSheet.create({
    card: {
      width: "48%",
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: color + "20",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    value: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 4,
      fontFamily: "Inter-ExtraBold",
    },
    label: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: "center",
      fontFamily: "Inter-Medium",
      fontWeight: "500",
    },
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
};

export const StatsGrid: React.FC<StatsGridProps> = ({ user, theme }) => {
  // TODO: Replace with actual API data when analytics endpoint is ready
  const studyTimeHours = 45; // Dummy data
  const averageScore = Math.round(user.progress.averageScore || 78); // Use actual data or fallback

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 24,
    },
  });

  return (
    <View style={styles.container}>
      <StatCard
        icon="flame"
        value={user.progress.streak.current}
        label="Day Streak"
        color={theme.colors.warning}
        delay={100}
        theme={theme}
      />
      <StatCard
        icon="trophy"
        value={user.progress.badges.length}
        label="Badges Earned"
        color={theme.colors.success}
        delay={200}
        theme={theme}
      />
      <StatCard
        icon="time"
        value={`${studyTimeHours}h`}
        label="Study Time"
        color={theme.colors.info}
        delay={300}
        theme={theme}
      />
      <StatCard
        icon="trending-up"
        value={`${averageScore}%`}
        label="Avg Score"
        color={theme.colors.primary}
        delay={400}
        theme={theme}
      />
    </View>
  );
};