"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../utils/ThemeContext";
import { useUser } from "../utils/UserContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import XPBar from "../components/XPBar";
import BadgeGrid from "../components/BadgeGrid";
import { LogoutButton } from "../components/auth/Logout";
import achievementsData from "../data/achievements.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, setUser } = useUser();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: "person" },
    { id: "achievements", label: "Achievements", icon: "trophy" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          setUser(null);
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const handleUpgradeToPremium = () => {
    router.push("/(routes)/premium");
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

  const StatCard = ({ icon, value, label, color }: any) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard delay={100}>
        <View style={styles.statsGrid}>
          <StatCard
            icon="flame"
            value={user?.streak || 0}
            label="Day Streak"
            color={theme.colors.warning}
          />
          <StatCard
            icon="trophy"
            value={user?.badges?.length || 0}
            label="Badges"
            color={theme.colors.success}
          />
          <StatCard
            icon="time"
            value="45h"
            label="Study Time"
            color={theme.colors.info}
          />
          <StatCard
            icon="checkmark-circle"
            value={user?.completedTopics?.length || 0}
            label="Completed"
            color={theme.colors.primary}
          />
        </View>
      </AnimatedCard>

      <AnimatedCard delay={200}>
        <XPBar currentXP={user?.xp || 0} level={user?.level || 1} />
      </AnimatedCard>

      <AnimatedCard delay={300}>
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Study Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Average Score</Text>
              <Text style={styles.progressValue}>78%</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Quizzes Completed</Text>
              <Text style={styles.progressValue}>45</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Subjects Mastered</Text>
              <Text style={styles.progressValue}>3/8</Text>
            </View>
          </View>
        </View>
      </AnimatedCard>

      <AnimatedCard delay={400}>
        <View style={styles.weakSubjectsSection}>
          <Text style={styles.sectionTitle}>Areas for Improvement</Text>
          <View style={styles.weakSubjectsList}>
            {(user?.subjects || ["Physics", "Chemistry"]).map(
              (subject, index) => (
                <View key={index} style={styles.weakSubjectItem}>
                  <Ionicons
                    name="trending-down"
                    size={16}
                    color={theme.colors.error}
                  />
                  <Text style={styles.weakSubjectText}>{subject}</Text>
                  <TouchableOpacity style={styles.improveButton}>
                    <Text style={styles.improveButtonText}>Practice</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        </View>
      </AnimatedCard>
    </ScrollView>
  );

  const renderAchievements = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard delay={100}>
        <BadgeGrid
          badges={achievementsData.map((a) =>
            a.earnedDate === null ? { ...a, earnedDate: undefined } : a
          )}
        />
      </AnimatedCard>

      <AnimatedCard delay={200}>
        <View style={styles.achievementStats}>
          <Text style={styles.sectionTitle}>Achievement Progress</Text>
          <View style={styles.achievementStatsGrid}>
            <View style={styles.achievementStatItem}>
              <Text style={styles.achievementStatValue}>
                {achievementsData.filter((a) => a.earned)?.length}
              </Text>
              <Text style={styles.achievementStatLabel}>Earned</Text>
            </View>
            <View style={styles.achievementStatItem}>
              <Text style={styles.achievementStatValue}>
                {achievementsData?.length}
              </Text>
              <Text style={styles.achievementStatLabel}>Total</Text>
            </View>
            <View style={styles.achievementStatItem}>
              <Text style={styles.achievementStatValue}>
                {Math.round(
                  (achievementsData.filter((a) => a.earned)?.length /
                    achievementsData?.length) *
                    100
                )}
                %
              </Text>
              <Text style={styles.achievementStatLabel}>Complete</Text>
            </View>
          </View>
        </View>
      </AnimatedCard>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard delay={100}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={isDark ? "white" : theme.colors.textSecondary}
              />
            }
          />
          <SettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={() =>
              Alert.alert("Notifications", "Notification settings coming soon!")
            }
          />
          <SettingItem
            icon="volume-high"
            title="Sound Effects"
            subtitle="Enable or disable sound effects"
            onPress={() => Alert.alert("Sound", "Sound settings coming soon!")}
          />
          <SettingItem
            icon="language"
            title="Language"
            subtitle="Choose your preferred language"
            onPress={() =>
              Alert.alert("Language", "Language settings coming soon!")
            }
          />
        </View>
      </AnimatedCard>

      <AnimatedCard delay={200}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon="person"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() =>
              Alert.alert("Profile", "Profile editing coming soon!")
            }
          />
          <SettingItem
            icon="shield-checkmark"
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() =>
              Alert.alert("Privacy", "Privacy settings coming soon!")
            }
          />
          <SettingItem
            icon="download"
            title="Download Data"
            subtitle="Export your learning data"
            onPress={() => Alert.alert("Download", "Data export coming soon!")}
          />
        </View>
      </AnimatedCard>

      <AnimatedCard delay={300}>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon="help-circle"
            title="Help & FAQ"
            subtitle="Get answers to common questions"
            onPress={() => Alert.alert("Help", "Help center coming soon!")}
          />
          <SettingItem
            icon="mail"
            title="Contact Support"
            subtitle="Get help from our support team"
            onPress={() =>
              Alert.alert("Support", "Contact support coming soon!")
            }
          />
          <SettingItem
            icon="star"
            title="Rate App"
            subtitle="Rate ExamPrep Africa on the app store"
            onPress={() => Alert.alert("Rate", "App rating coming soon!")}
          />
        </View>
      </AnimatedCard>

      <AnimatedCard delay={400}>
        {/* <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity> */}
        <LogoutButton />
      </AnimatedCard>
    </ScrollView>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case "overview":
        return renderOverview();
      case "achievements":
        return renderAchievements();
      case "settings":
        return renderSettings();
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
      paddingTop: theme.spacing.md,
    },
    profileCard: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.lg,
      borderWidth: 3,
      borderColor: "white",
    },
    avatarText: {
      color: "white",
      fontSize: 32,
      fontWeight: "bold",
    },
    profileInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
      marginBottom: 4,
    },
    userDetails: {
      fontSize: 14,
      color: "rgba(255,255,255,0.8)",
      marginBottom: 4,
    },
    premiumButton: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      alignSelf: "flex-start",
      marginTop: theme.spacing.sm,
    },
    premiumButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
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
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    statCard: {
      width: "48%",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: "center",
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: 20,
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
    },
    progressSection: {
      marginBottom: theme.spacing.lg,
    },
    progressCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    progressItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    progressLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    progressValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    weakSubjectsSection: {
      marginBottom: theme.spacing.lg,
    },
    weakSubjectsList: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    weakSubjectItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.sm,
    },
    weakSubjectText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    improveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    improveButtonText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    achievementStats: {
      marginBottom: theme.spacing.lg,
    },
    achievementStatsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    achievementStatItem: {
      alignItems: "center",
    },
    achievementStatValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    achievementStatLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    settingsSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
    },
    settingSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.error + "20",
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    logoutText: {
      color: theme.colors.error,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: theme.spacing.sm,
    },
  });

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: theme.colors.textSecondary }}>
            Please log in to view your profile
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.profileCard}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userDetails}>
                {user.country} • Level {user.level}
              </Text>
              <Text style={styles.userDetails}>
                {user.selectedExam?.toUpperCase()} Student
              </Text>
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={handleUpgradeToPremium}
              >
                <Text style={styles.premiumButtonText}>
                  ⭐ Upgrade to Premium
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
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