"use client";

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import {
  profileApiService,
  type UserProfile,
} from "../../services/user/api.profile.service";
import { router } from "expo-router";

interface SettingsSectionProps {
  user: UserProfile;
  theme: any;
  isDark: boolean;
  onToggleTheme: () => void;
  onUserUpdate: (updatedUser: UserProfile) => void;
}

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  theme: any;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  theme,
}) => {
  const styles = StyleSheet.create({
    item: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
      fontFamily: "Inter-Medium",
    },
  });

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} disabled={!onPress}>
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement ||
        (onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        ))}
    </TouchableOpacity>
  );
};

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  user,
  theme,
  isDark,
  onToggleTheme,
  onUserUpdate,
}) => {
  const slideUp = useSharedValue(50);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    slideUp.value = withDelay(500, withSpring(0, { damping: 20 }));
    opacity.value = withDelay(500, withSpring(1));
  }, [opacity, slideUp]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
    opacity: opacity.value,
  }));

  const handleToggleNotifications = async (value: boolean) => {
    try {
      const updatedUser = await profileApiService.updatePreferences({
        preferences: {
          notifications: {
            ...user.preferences.notifications,
            general: value,
          },
        },
      });
      onUserUpdate(updatedUser);
    } catch (error) {
      console.error("Failed to update notifications:", error);
      Alert.alert("Error", "Failed to update notification settings");
    }
  };

  const handleToggleSoundEffects = async (value: boolean) => {
    try {
      const updatedUser = await profileApiService.updatePreferences({
        preferences: {
          ...user.preferences,
          autoPlayAudio: value,
        },
      });
      onUserUpdate(updatedUser);
    } catch (error) {
      console.error("Failed to update sound settings:", error);
      Alert.alert("Error", "Failed to update sound settings");
    }
  };

  const handleToggleHints = async (value: boolean) => {
    try {
      const updatedUser = await profileApiService.updatePreferences({
        preferences: {
          ...user.preferences,
          enableHints: value,
        },
      });
      onUserUpdate(updatedUser);
    } catch (error) {
      console.error("Failed to update hints setting:", error);
      Alert.alert("Error", "Failed to update hints setting");
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
      fontFamily: "Inter-Bold",
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
      fontFamily: "Inter-SemiBold",
    },
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.sectionTitle}>Settings</Text>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Preferences</Text>
        <SettingItem
          icon="moon"
          title="Dark Mode"
          subtitle="Switch between light and dark themes"
          theme={theme}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={onToggleTheme}
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
          subtitle="Receive study reminders and updates"
          theme={theme}
          rightElement={
            <Switch
              value={user.preferences.notifications.general}
              onValueChange={handleToggleNotifications}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                user.preferences.notifications.general
                  ? "white"
                  : theme.colors.textSecondary
              }
            />
          }
        />
        <SettingItem
          icon="volume-high"
          title="Sound Effects"
          subtitle="Enable audio feedback and sounds"
          theme={theme}
          rightElement={
            <Switch
              value={user.preferences.autoPlayAudio}
              onValueChange={handleToggleSoundEffects}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                user.preferences.autoPlayAudio
                  ? "white"
                  : theme.colors.textSecondary
              }
            />
          }
        />
        <SettingItem
          icon="help-circle"
          title="Show Hints"
          subtitle="Display helpful hints during quizzes"
          theme={theme}
          rightElement={
            <Switch
              value={user.preferences.enableHints}
              onValueChange={handleToggleHints}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                user.preferences.enableHints
                  ? "white"
                  : theme.colors.textSecondary
              }
            />
          }
        />
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Account</Text>
        <SettingItem
          icon="person"
          title="Edit Profile"
          subtitle="Update your personal information"
          theme={theme}
          onPress={() =>
            router.push("/(routes)/profile/edit-profile")
          }
        />
        <SettingItem
          icon="shield-checkmark"
          title="Privacy & Security"
          subtitle="Manage your privacy settings"
          theme={theme}
          onPress={() =>
            Alert.alert("Privacy", "Privacy settings coming soon!")
          }
        />
        <SettingItem
          icon="download"
          title="Download Data"
          subtitle="Export your learning data"
          theme={theme}
          onPress={() => Alert.alert("Download", "Data export coming soon!")}
        />
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Support</Text>
        <SettingItem
          icon="help-circle"
          title="Help & FAQ"
          subtitle="Get answers to common questions"
          theme={theme}
          onPress={() => Alert.alert("Help", "Help center coming soon!")}
        />
        <SettingItem
          icon="mail"
          title="Contact Support"
          subtitle="Get help from our support team"
          theme={theme}
          onPress={() => Alert.alert("Support", "Contact support coming soon!")}
        />
        <SettingItem
          icon="star"
          title="Rate App"
          subtitle="Rate ExamPrep Africa on the app store"
          theme={theme}
          onPress={() => Alert.alert("Rate", "App rating coming soon!")}
        />
      </View>
    </Animated.View>
  );
};