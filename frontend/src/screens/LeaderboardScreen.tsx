"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../utils/ThemeContext";
import { useUser } from "../utils/UserContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import LeaderboardRow from "../components/LeaderboardRow";
import leaderboardData from "../data/leaderboard.json";

export default function LeaderboardScreen() {
  const { theme } = useTheme();
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState("global");
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    { id: "global", label: "Global", icon: "globe" },
    { id: "country", label: "Country", icon: "flag" },
    { id: "friends", label: "Friends", icon: "people" },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getFilteredLeaderboard = () => {
    switch (selectedTab) {
      case "country":
        return leaderboardData.filter(
          (player) => player.country === user?.country
        );
      case "friends":
        // Mock friends data - in real app this would come from user's friends list
        return leaderboardData.slice(0, 5);
      default:
        return leaderboardData;
    }
  };

  const getCurrentUserRank = () => {
    const currentUser = leaderboardData.find(
      (player) => player.id === "current_user"
    );
    return currentUser ? currentUser.rank : null;
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

  const TopThreeCard = ({ players }: { players: any[] }) => (
    <AnimatedCard delay={100}>
      <View style={styles.topThreeContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.topThreeGradient}
        >
          <Text style={styles.topThreeTitle}>🏆 Top Performers</Text>

          <View style={styles.podiumContainer}>
            {/* Second Place */}
            {players[1] && (
              <View style={[styles.podiumPosition, styles.secondPlace]}>
                <View style={styles.podiumAvatar}>
                  <Text style={styles.podiumAvatarText}>
                    {players[1].name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.silverMedal}>
                  <Ionicons name="medal" size={24} color="#C0C0C0" />
                </View>
                <Text style={styles.podiumName}>{players[1].name}</Text>
                <Text style={styles.podiumXP}>
                  {players[1].xp.toLocaleString()} XP
                </Text>
              </View>
            )}

            {/* First Place */}
            {players[0] && (
              <View style={[styles.podiumPosition, styles.firstPlace]}>
                <View style={styles.crownContainer}>
                  <Ionicons name="trophy" size={32} color="#FFD700" />
                </View>
                <View style={styles.podiumAvatar}>
                  <Text style={styles.podiumAvatarText}>
                    {players[0].name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.goldMedal}>
                  <Ionicons name="trophy" size={28} color="#FFD700" />
                </View>
                <Text style={styles.podiumName}>{players[0].name}</Text>
                <Text style={styles.podiumXP}>
                  {players[0].xp.toLocaleString()} XP
                </Text>
              </View>
            )}

            {/* Third Place */}
            {players[2] && (
              <View style={[styles.podiumPosition, styles.thirdPlace]}>
                <View style={styles.podiumAvatar}>
                  <Text style={styles.podiumAvatarText}>
                    {players[2].name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.bronzeMedal}>
                  <Ionicons name="medal" size={24} color="#CD7F32" />
                </View>
                <Text style={styles.podiumName}>{players[2].name}</Text>
                <Text style={styles.podiumXP}>
                  {players[2].xp.toLocaleString()} XP
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </AnimatedCard>
  );

  const UserRankCard = () => {
    const currentUserRank = getCurrentUserRank();
    if (!currentUserRank || !user) return null;

    return (
      <AnimatedCard delay={200}>
        <View style={styles.userRankCard}>
          <Text style={styles.userRankTitle}>Your Ranking</Text>
          <View style={styles.userRankContent}>
            <View style={styles.userRankInfo}>
              <Text style={styles.userRankPosition}>#{currentUserRank}</Text>
              <Text style={styles.userRankLabel}>Global Rank</Text>
            </View>
            <View style={styles.userRankStats}>
              <View style={styles.userRankStat}>
                <Text style={styles.userRankStatValue}>{user.xp}</Text>
                <Text style={styles.userRankStatLabel}>XP</Text>
              </View>
              <View style={styles.userRankStat}>
                <Text style={styles.userRankStatValue}>{user.level}</Text>
                <Text style={styles.userRankStatLabel}>Level</Text>
              </View>
              <View style={styles.userRankStat}>
                <Text style={styles.userRankStatValue}>
                  {user.badges?.length}
                </Text>
                <Text style={styles.userRankStatLabel}>Badges</Text>
              </View>
            </View>
          </View>
        </View>
      </AnimatedCard>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 4,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
    },
    tabIcon: {
      marginRight: theme.spacing.xs,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text,
    },
    activeTabText: {
      color: "white",
    },
    content: {
      flex: 1,
    },
    topThreeContainer: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      overflow: "hidden",
    },
    topThreeGradient: {
      padding: theme.spacing.lg,
    },
    topThreeTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    podiumContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "flex-end",
      height: 200,
    },
    podiumPosition: {
      alignItems: "center",
      marginHorizontal: theme.spacing.sm,
    },
    firstPlace: {
      marginBottom: 0,
    },
    secondPlace: {
      marginBottom: 20,
    },
    thirdPlace: {
      marginBottom: 40,
    },
    crownContainer: {
      position: "absolute",
      top: -20,
      zIndex: 1,
    },
    podiumAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
      borderWidth: 3,
      borderColor: "white",
    },
    podiumAvatarText: {
      color: "white",
      fontSize: 24,
      fontWeight: "bold",
    },
    goldMedal: {
      position: "absolute",
      bottom: 60,
      right: -5,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      padding: 4,
    },
    silverMedal: {
      position: "absolute",
      bottom: 60,
      right: -5,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      padding: 4,
    },
    bronzeMedal: {
      position: "absolute",
      bottom: 60,
      right: -5,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      padding: 4,
    },
    podiumName: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
    podiumXP: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 12,
      textAlign: "center",
    },
    userRankCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    userRankTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: "center",
    },
    userRankContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    userRankInfo: {
      alignItems: "center",
    },
    userRankPosition: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.colors.primary,
    },
    userRankLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    userRankStats: {
      flexDirection: "row",
    },
    userRankStat: {
      alignItems: "center",
      marginLeft: theme.spacing.lg,
    },
    userRankStatValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    userRankStatLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    leaderboardList: {
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
    },
    emptyStateIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: "center",
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });

  const filteredLeaderboard = getFilteredLeaderboard();
  const topThree = filteredLeaderboard.slice(0, 3);
  const remainingPlayers = filteredLeaderboard.slice(3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>
          See how you rank against students across Africa
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={selectedTab === tab.id ? "white" : theme.colors.text}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {topThree?.length > 0 && <TopThreeCard players={topThree} />}

        <UserRankCard />

        {remainingPlayers?.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>All Rankings</Text>
            <View style={styles.leaderboardList}>
              {remainingPlayers.map((player, index) => (
                <LeaderboardRow
                  key={player.id}
                  rank={player.rank}
                  name={player.name}
                  avatar={player.avatar}
                  xp={player.xp}
                  country={player.country}
                  isCurrentUser={player.id === "current_user"}
                  index={index}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons
                name="podium-outline"
                size={64}
                color={theme.colors.textSecondary}
              />
            </View>
            <Text style={styles.emptyStateText}>No rankings available</Text>
            <Text style={styles.emptyStateSubtext}>
              Complete some quizzes to see your ranking!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}