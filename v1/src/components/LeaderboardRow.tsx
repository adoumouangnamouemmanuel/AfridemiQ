"use client";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../utils/ThemeContext";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  country: string;
  isCurrentUser?: boolean;
  index: number;
}

export default function LeaderboardRow({
  rank,
  name,
  avatar,
  xp,
  country,
  isCurrentUser = false,
  index,
}: LeaderboardRowProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(300);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withDelay(index * 100, withSpring(0));
    opacity.value = withDelay(index * 100, withSpring(1));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Ionicons name="trophy" size={24} color="#FFD700" />;
      case 2:
        return <Ionicons name="medal" size={24} color="#C0C0C0" />;
      case 3:
        return <Ionicons name="medal" size={24} color="#CD7F32" />;
      default:
        return (
          <View style={styles.rankNumber}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        );
    }
  };

  const getContainerStyle = () => {
    if (isCurrentUser) {
      return [styles.container, styles.currentUserContainer];
    }
    return styles.container;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    currentUserContainer: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    rankContainer: {
      width: 40,
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    rankNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    rankText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.text,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: theme.spacing.md,
      backgroundColor: theme.colors.border,
    },
    userInfo: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: "600",
      color: isCurrentUser ? theme.colors.primary : theme.colors.text,
    },
    country: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    xpContainer: {
      alignItems: "flex-end",
    },
    xp: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    xpLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });

  const ContainerComponent = isCurrentUser
    ? ({ children, style }: any) => (
        <LinearGradient
          colors={[theme.colors.primary + "10", theme.colors.surface]}
          style={style}
        >
          {children}
        </LinearGradient>
      )
    : View;

  return (
    <Animated.View style={animatedStyle}>
      <ContainerComponent style={getContainerStyle()}>
        <View style={styles.rankContainer}>{getRankIcon()}</View>

        <Image source={{ uri: avatar }} style={styles.avatar} />

        <View style={styles.userInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.country}>{country}</Text>
        </View>

        <View style={styles.xpContainer}>
          <Text style={styles.xp}>{xp.toLocaleString()}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </ContainerComponent>
    </Animated.View>
  );
}
