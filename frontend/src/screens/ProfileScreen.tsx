"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../utils/ThemeContext";
import { useUser } from "../utils/UserContext";

// Import modular components
import { LogoutButton } from "../components/auth/Logout";
import { AchievementsSection } from "../components/profile/AchievementsSection";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProgressSection } from "../components/profile/ProgressSection";
import { SettingsSection } from "../components/profile/SettingsSection";
import { StatsGrid } from "../components/profile/StatsGrid";
import { WeakSubjectsSection } from "../components/profile/WeakSubjectsSection";

// Import API service
import { profileApiService } from "../services/user/api.profile.service";
import type { UserProfile } from "../types/user/user.types";
import { AboutSection } from "../components/profile/AboutSection";

const HEADER_HEIGHT = 320;

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user: contextUser, setUser } = useUser();
  const router = useRouter();

  // Local state for profile data
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTokenError, setHasTokenError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Animation values
  const fadeIn = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: "person" },
    { id: "about", label: "About", icon: "person-outline" },
    { id: "achievements", label: "Wins", icon: "trophy" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  // Initialize animations
  useEffect(() => {
    fadeIn.value = withDelay(100, withSpring(1));
  }, [fadeIn]);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Import apiService at the top of the file or dynamically here
  // import { apiService } from "../services/api.service";
  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setHasTokenError(false);
      setIsRetrying(false);

      const profile = await profileApiService.getProfile();
      setProfileData(profile);

      // Update context user with fresh data
      if (contextUser) {
        const updatedContextUser = {
          ...contextUser,
          name: profile.name,
          email: profile.email,
          country: profile.country,
          xp: profile.progress.xp,
          level: profile.progress.level,
          streak: profile.progress.streak.current,
          badges: profile.progress.badges,
          completedTopics: profile.progress.completedTopics,
          weakSubjects: profile.progress.weakSubjects,
          isPremium: profile.isPremium,
        };
        setUser(updatedContextUser);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);

      // Check if it's a token expiration error
      if (
        error instanceof Error &&
        (error.message.includes("Token expiré") ||
          error.message.includes("Session expired") ||
          error.message.includes("expired"))
      ) {
        // Try silent refresh first
        setIsRetrying(true);
        // Dynamically import apiService if not imported at the top
        const { apiService } = await import("../services/api.service");
        const refreshed = await apiService.silentRefresh();

        if (refreshed) {
          // Retry loading profile after successful refresh
          try {
            const isTokenValid = await apiService.checkTokenValidity();
            if (!isTokenValid) {
              console.log(
                "🔄 PROFILE: Token invalid, refreshing before profile load"
              );
              const refreshed = await apiService.silentRefresh();
              if (!refreshed) {
                throw new Error("Session expired");
              }
            }
            const profile = await profileApiService.getProfile();
            setProfileData(profile);
            setIsRetrying(false);
            return;
          } catch (retryError) {
            console.error("Retry after refresh failed:", retryError);
          }
        }

        setHasTokenError(true);
        setIsRetrying(false);
      } else {
        Alert.alert(
          "Error",
          "Failed to load profile data. Please check your connection."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProfileData();
    setIsRefreshing(false);
  };

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setProfileData(updatedUser);

    // Update context user
    if (contextUser) {
      const updatedContextUser = {
        ...contextUser,
        name: updatedUser.name,
        email: updatedUser.email,
        country: updatedUser.country,
        xp: updatedUser.progress.xp,
        level: updatedUser.progress.level,
        streak: updatedUser.progress.streak.current,
        badges: updatedUser.progress.badges,
        completedTopics: updatedUser.progress.completedTopics,
        weakSubjects: updatedUser.progress.weakSubjects,
        isPremium: updatedUser.isPremium,
      };
      setUser(updatedContextUser);
    }
  };

  const handleUpgradeToPremium = () => {
    router.push("/(routes)/premium");
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleForceLogout = async () => {
    try {
      // Import authService and apiService
      const { authService } = await import("../services/auth.service");

      // Clear all auth data
      await authService.clearAuthData();

      // Clear user context
      setUser(null);

      // Navigate to login
      router.replace("/auth/login");
    } catch (error) {
      console.error("Force logout error:", error);
      // Even if there's an error, navigate to login
      router.replace("/auth/login");
    }
  };

  // Scroll handler for header animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;

      // Calculate header opacity based on scroll
      const opacity = interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT * 0.5, HEADER_HEIGHT],
        [1, 0.8, 0.3],
        "clamp"
      );
      headerOpacity.value = opacity;
    },
  });

  // Animation styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_HEIGHT],
          [0, -HEADER_HEIGHT * 0.3],
          "clamp"
        ),
      },
    ],
  }));

  // Render content based on selected tab
  const renderContent = () => {
    if (!profileData) return null;

    switch (selectedTab) {
      case "overview":
        return (
          <>
            <StatsGrid user={profileData} theme={theme} />
            <ProgressSection user={profileData} theme={theme} />
            <WeakSubjectsSection user={profileData} theme={theme} />
          </>
        );
      case "about":
        return (
          <AboutSection
            user={profileData}
            theme={theme}
            onEditProfile={handleEditProfile}
          />
        );
      case "achievements":
        return <AchievementsSection user={profileData} theme={theme} />;
      case "settings":
        return (
          <>
            <SettingsSection
              user={profileData}
              theme={theme}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onUserUpdate={handleUserUpdate}
            />
            <View style={styles.logoutContainer}>
              <LogoutButton
                style={styles.logoutButton}
                textStyle={styles.logoutButtonText}
                title="Sign Out"
              />
            </View>
          </>
        );
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    headerContainer: {
      height: HEADER_HEIGHT,
      position: "relative",
      marginTop: 0,
    },
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 4,
      marginHorizontal: 16,
      marginVertical: 16,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderRadius: 12,
      minHeight: 44,
    },
    activeTab: {
      backgroundColor: "#3B82F6",
      elevation: 2,
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    tabIcon: {
      marginBottom: 2,
    },
    tabText: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
    },
    activeTabText: {
      color: "white",
    },
    content: {
      paddingHorizontal: 20,
    },
    logoutContainer: {
      paddingVertical: 24,
    },
    logoutButton: {
      backgroundColor: theme.colors.error + "15",
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.error + "30",
    },
    logoutButtonText: {
      color: theme.colors.error,
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginTop: 16,
      fontFamily: "Inter-SemiBold",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    errorText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      textAlign: "center",
      marginBottom: 20,
      fontFamily: "Inter-SemiBold",
    },
    retryButton: {
      backgroundColor: "#3B82F6",
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    retryButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 12,
    },
    logoutButtonAlt: {
      backgroundColor: theme.colors.error + "15",
      borderColor: theme.colors.error + "30",
      borderWidth: 1,
    },
    logoutButtonTextAlt: {
      color: theme.colors.error,
    },
  });

  // Loading state
  if (isLoading || isRetrying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons
            name="person-circle"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.loadingText}>
            {isRetrying ? "Refreshing session..." : "Loading your profile..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state - no user data
  if (!contextUser || !profileData) {
    if (hasTokenError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons
              name="refresh-circle"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.errorText}>
              Your session needs to be refreshed. This happens occasionally for
              security.
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadProfileData}
              >
                <Text style={styles.retryButtonText}>Refresh Session</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.retryButton, styles.logoutButtonAlt]}
                onPress={handleForceLogout}
              >
                <Text
                  style={[styles.retryButtonText, styles.logoutButtonTextAlt]}
                >
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.errorText}>
            Unable to load your profile. Please check your connection and try
            again.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadProfileData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.retryButton, styles.logoutButtonAlt]}
              onPress={handleForceLogout}
            >
              <Text
                style={[styles.retryButtonText, styles.logoutButtonTextAlt]}
              >
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        {/* Remove the back button since we now have the tab header */}
        {/* <Animated.View
          style={[styles.backButtonContainer, backButtonAnimatedStyle]}
        >
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="#3B82F6"
              style={styles.backButtonIcon}
            />
          </TouchableOpacity>
        </Animated.View> */}

        {/* Scrollable Content - Add paddingTop to account for tab header */}
        <Animated.ScrollView
          style={[styles.scrollContainer, { paddingTop: 0 }]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          {/* Profile Header */}
          <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
            <ProfileHeader
              user={profileData}
              onUpgradeToPremium={handleUpgradeToPremium}
              onEditProfile={handleEditProfile}
            />
          </Animated.View>

          {/* Tab Navigation */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
                onPress={() => setSelectedTab(tab.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={18}
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

          {/* Tab Content */}
          <View style={styles.content}>{renderContent()}</View>
        </Animated.ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
