"use client";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../utils/ThemeContext";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
}

interface BadgeGridProps {
  badges: Badge[];
}

export default function BadgeGrid({ badges }: BadgeGridProps) {
  const { theme } = useTheme();

  const BadgeItem = ({ badge, index }: { badge: Badge; index: number }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
      scale.value = withDelay(index * 100, withSpring(1));
      opacity.value = withDelay(index * 100, withSpring(1));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const styles = StyleSheet.create({
      badgeContainer: {
        width: "30%",
        aspectRatio: 1,
        margin: "1.5%",
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.sm,
        alignItems: "center",
        justifyContent: "center",
        opacity: badge.earned ? 1 : 0.4,
      },
      badgeIcon: {
        marginBottom: theme.spacing.xs,
      },
      badgeName: {
        fontSize: 12,
        fontWeight: "600",
        color: "white",
        textAlign: "center",
      },
      badgeDescription: {
        fontSize: 10,
        color: "white",
        textAlign: "center",
        opacity: 0.8,
      },
    });

    return (
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={
            badge.earned
              ? [badge.color, badge.color + "80"]
              : [theme.colors.border, theme.colors.border]
          }
          style={styles.badgeContainer}
        >
          <View style={styles.badgeIcon}>
            <Ionicons
              name={badge.icon as any}
              size={24}
              color={badge.earned ? "white" : theme.colors.textSecondary}
            />
          </View>
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{badge.description}</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.md,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: "center",
    },
    badgesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    earnedCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
  });

  const earnedBadges = badges.filter((badge) => badge.earned).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievements</Text>
      <Text style={styles.earnedCount}>
        {earnedBadges} of {badges.length} badges earned
      </Text>

      <View style={styles.badgesContainer}>
        {badges.map((badge, index) => (
          <BadgeItem key={badge.id} badge={badge} index={index} />
        ))}
      </View>
    </View>
  );
}
