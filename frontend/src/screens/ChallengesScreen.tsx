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
import MissionCard from "../components/MissionCard";
import missionsData from "../data/missions.json";

export default function ChallengesScreen() {
  const { theme } = useTheme();
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState("missions");

  const tabs = [
    { id: "missions", label: "Missions", icon: "flag" },
    { id: "battles", label: "Friend Battles", icon: "people" },
    { id: "tournaments", label: "Tournaments", icon: "trophy" },
  ];

  const dailyMissions = missionsData.filter((m) => m.type === "daily");
  const weeklyMissions = missionsData.filter((m) => m.type === "weekly");
  const achievements = missionsData.filter((m) => m.type === "achievement");

  const handleMissionPress = (missionId: string) => {
    const mission = missionsData.find((m) => m.id === missionId);
    if (mission && !mission.completed) {
      Alert.alert(
        mission.title,
        `${mission.description}\n\nProgress: ${mission.progress}/${mission.target}\nReward: ${mission.reward}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start Mission",
            onPress: () => console.log("Starting mission:", missionId),
          },
        ]
      );
    }
  };

  const handleChallengeFriend = () => {
    Alert.alert(
      "Challenge a Friend",
      "Invite your friends to compete in quiz battles!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Invite Friends",
          onPress: () => console.log("Inviting friends"),
        },
      ]
    );
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
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
  };

  const FriendBattleCard = ({
    friend,
    delay = 0,
  }: {
    friend: any;
    delay?: number;
  }) => (
    <AnimatedCard delay={delay}>
      <TouchableOpacity style={styles.battleCard}>
        <View style={styles.battleHeader}>
          <View style={styles.friendInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{friend.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendStats}>
                Level {friend.level} • {friend.xp} XP
              </Text>
            </View>
          </View>
          <View style={styles.battleStatus}>
            <Text style={styles.statusText}>{friend.status}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.challengeButton}
          onPress={handleChallengeFriend}
        >
          <Text style={styles.challengeButtonText}>Challenge</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </AnimatedCard>
  );

  const TournamentCard = ({
    tournament,
    delay = 0,
  }: {
    tournament: any;
    delay?: number;
  }) => (
    <AnimatedCard delay={delay}>
      <View style={styles.tournamentCard}>
        <LinearGradient
          colors={[tournament.color, tournament.color + "80"]}
          style={styles.tournamentGradient}
        >
          <View style={styles.tournamentHeader}>
            <Ionicons name={tournament.icon} size={32} color="white" />
            <Text style={styles.tournamentTitle}>{tournament.name}</Text>
          </View>
          <Text style={styles.tournamentDescription}>
            {tournament.description}
          </Text>
          <View style={styles.tournamentStats}>
            <View style={styles.tournamentStat}>
              <Text style={styles.tournamentStatValue}>
                {tournament.participants}
              </Text>
              <Text style={styles.tournamentStatLabel}>Participants</Text>
            </View>
            <View style={styles.tournamentStat}>
              <Text style={styles.tournamentStatValue}>{tournament.prize}</Text>
              <Text style={styles.tournamentStatLabel}>Prize</Text>
            </View>
            <View style={styles.tournamentStat}>
              <Text style={styles.tournamentStatValue}>
                {tournament.timeLeft}
              </Text>
              <Text style={styles.tournamentStatLabel}>Time Left</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Tournament</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </AnimatedCard>
  );

  const renderMissions = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard delay={100}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color={theme.colors.warning} />
            <Text style={styles.statValue}>{user?.streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color={theme.colors.success} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>850</Text>
            <Text style={styles.statLabel}>XP This Week</Text>
          </View>
        </View>
      </AnimatedCard>

      <Text style={styles.sectionTitle}>Daily Missions</Text>
      {dailyMissions.map((mission, index) => (
        <AnimatedCard key={mission.id} delay={200 + index * 100}>
          <MissionCard
            title={mission.title}
            description={mission.description}
            progress={mission.progress}
            target={mission.target}
            reward={mission.reward}
            icon={mission.icon}
            completed={mission.completed}
            onPress={() => handleMissionPress(mission.id)}
          />
        </AnimatedCard>
      ))}

      <Text style={styles.sectionTitle}>Weekly Challenges</Text>
      {weeklyMissions.map((mission, index) => (
        <AnimatedCard key={mission.id} delay={500 + index * 100}>
          <MissionCard
            title={mission.title}
            description={mission.description}
            progress={mission.progress}
            target={mission.target}
            reward={mission.reward}
            icon={mission.icon}
            completed={mission.completed}
            onPress={() => handleMissionPress(mission.id)}
          />
        </AnimatedCard>
      ))}

      <Text style={styles.sectionTitle}>Achievements</Text>
      {achievements.map((mission, index) => (
        <AnimatedCard key={mission.id} delay={800 + index * 100}>
          <MissionCard
            title={mission.title}
            description={mission.description}
            progress={mission.progress}
            target={mission.target}
            reward={mission.reward}
            icon={mission.icon}
            completed={mission.completed}
            onPress={() => handleMissionPress(mission.id)}
          />
        </AnimatedCard>
      ))}
    </ScrollView>
  );

  const renderBattles = () => {
    const friends = [
      { id: 1, name: "Adaora", level: 12, xp: 8500, status: "Online" },
      { id: 2, name: "Kwame", level: 15, xp: 12000, status: "In Quiz" },
      { id: 3, name: "Fatima", level: 10, xp: 7200, status: "Offline" },
      { id: 4, name: "Thabo", level: 14, xp: 9800, status: "Online" },
    ];

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <AnimatedCard delay={100}>
          <View style={styles.battleStatsCard}>
            <Text style={styles.battleStatsTitle}>Battle Stats</Text>
            <View style={styles.battleStatsGrid}>
              <View style={styles.battleStat}>
                <Text style={styles.battleStatValue}>15</Text>
                <Text style={styles.battleStatLabel}>Wins</Text>
              </View>
              <View style={styles.battleStat}>
                <Text style={styles.battleStatValue}>3</Text>
                <Text style={styles.battleStatLabel}>Losses</Text>
              </View>
              <View style={styles.battleStat}>
                <Text style={styles.battleStatValue}>83%</Text>
                <Text style={styles.battleStatLabel}>Win Rate</Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

        <Text style={styles.sectionTitle}>Challenge Friends</Text>
        {friends.map((friend, index) => (
          <FriendBattleCard
            key={friend.id}
            friend={friend}
            delay={200 + index * 100}
          />
        ))}

        <AnimatedCard delay={600}>
          <TouchableOpacity
            style={styles.inviteFriendsCard}
            onPress={handleChallengeFriend}
          >
            <Ionicons
              name="person-add"
              size={32}
              color={theme.colors.primary}
            />
            <Text style={styles.inviteFriendsTitle}>Invite More Friends</Text>
            <Text style={styles.inviteFriendsDescription}>
              Challenge your classmates and study together!
            </Text>
          </TouchableOpacity>
        </AnimatedCard>
      </ScrollView>
    );
  };

  const renderTournaments = () => {
    const tournaments = [
      {
        id: 1,
        name: "Mathematics Championship",
        description: "Weekly math tournament for all levels",
        participants: 1247,
        prize: "500 XP + Badge",
        timeLeft: "2d 14h",
        color: theme.colors.primary,
        icon: "calculator",
      },
      {
        id: 2,
        name: "Science Quiz Battle",
        description: "Physics, Chemistry, and Biology combined",
        participants: 892,
        prize: "300 XP + Badge",
        timeLeft: "5d 8h",
        color: theme.colors.success,
        icon: "flask",
      },
      {
        id: 3,
        name: "Language Masters",
        description: "English and Literature competition",
        participants: 654,
        prize: "400 XP + Badge",
        timeLeft: "1d 3h",
        color: theme.colors.secondary,
        icon: "book",
      },
    ];

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <AnimatedCard delay={100}>
          <View style={styles.tournamentInfoCard}>
            <Text style={styles.tournamentInfoTitle}>Tournament Rules</Text>
            <Text style={styles.tournamentInfoText}>
              • Tournaments run for limited time periods{"\n"}• Compete against
              students from across Africa{"\n"}• Earn exclusive badges and XP
              rewards{"\n"}• Rankings update in real-time
            </Text>
          </View>
        </AnimatedCard>

        <Text style={styles.sectionTitle}>Active Tournaments</Text>
        {tournaments.map((tournament, index) => (
          <TournamentCard
            key={tournament.id}
            tournament={tournament}
            delay={200 + index * 150}
          />
        ))}
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "missions":
        return renderMissions();
      case "battles":
        return renderBattles();
      case "tournaments":
        return renderTournaments();
      default:
        return null;
    }
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
      paddingHorizontal: theme.spacing.lg,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.xs,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    battleCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    battleHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    friendInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    avatarText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    friendName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    friendStats: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    battleStatus: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.success + "20",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.colors.success,
    },
    challengeButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      alignItems: "center",
    },
    challengeButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    battleStatsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    battleStatsTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: "center",
    },
    battleStatsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    battleStat: {
      alignItems: "center",
    },
    battleStatValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    battleStatLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    inviteFriendsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: "dashed",
    },
    inviteFriendsTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    inviteFriendsDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    tournamentCard: {
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      overflow: "hidden",
    },
    tournamentGradient: {
      padding: theme.spacing.lg,
    },
    tournamentHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    tournamentTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    tournamentDescription: {
      fontSize: 14,
      color: "rgba(255,255,255,0.8)",
      marginBottom: theme.spacing.lg,
    },
    tournamentStats: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    tournamentStat: {
      alignItems: "center",
    },
    tournamentStatValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: "white",
    },
    tournamentStatLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      marginTop: 4,
    },
    joinButton: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    joinButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    tournamentInfoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tournamentInfoTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    tournamentInfoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
        <Text style={styles.subtitle}>
          Complete missions, battle friends, and join tournaments
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

      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}