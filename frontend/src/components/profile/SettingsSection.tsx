"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { router } from "expo-router";
import {
  profileApiService,
  type UserProfile,
} from "../../services/user/api.profile.service";
import { CustomAlert } from "../../components/common/CustomAlert";
import { useTheme } from "../../utils/ThemeContext";

// Props interface for SettingsSection
interface SettingsSectionProps {
  user: UserProfile;
  theme: any;
  isDark: boolean;
  onToggleTheme: () => void;
  onUserUpdate: (updatedUser: UserProfile) => void;
}

// Props interface for individual SettingItem
interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  theme: any;
}

// Reusable SettingItem component for consistent styling
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

// Main SettingsSection component
export const SettingsSection: React.FC<SettingsSectionProps> = ({
  user,
  theme,
  isDark,
  onToggleTheme,
  onUserUpdate,
}) => {
  // Animation values for slide-up effect
  const slideUp = useSharedValue(50);
  const opacity = useSharedValue(0);

  // State for alert configuration
  const [alert, setAlert] = useState({
    visible: false,
    type: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });

  // State for tracking async operations
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize animations on mount
  React.useEffect(() => {
    slideUp.value = withDelay(500, withSpring(0, { damping: 20 }));
    opacity.value = withDelay(500, withSpring(1));
  }, [opacity, slideUp]);

  // Animated style for container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
    opacity: opacity.value,
  }));

  // Show alert with specified type and message
  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    message: string
  ) => {
    setAlert({
      visible: true,
      type,
      message,
    });
  };

  // Hide alert
  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  // Handle toggling notifications (single preference update)
  const handleToggleNotifications = async (value: boolean) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      console.log("🔧 SETTINGS: Updating notifications to:", value);
      
      const updatedUser = await profileApiService.updateSinglePreference({
        key: "notifications.general", // ✅ Correct nested key format
        value,
      });
      onUserUpdate(updatedUser);
      showAlert("success", "Notification settings updated successfully!");
    } catch (error: any) {
      console.error("Failed to update notifications:", error);
      showAlert(
        "error",
        error.message || "Failed to update notification settings"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle toggling sound effects (single preference update)
  const handleToggleSoundEffects = async (value: boolean) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      console.log("🔧 SETTINGS: Updating sound effects to:", value);
      console.log("🔧 SETTINGS: Sending key 'autoPlayAudio' with value:", value);
      
      const updatedUser = await profileApiService.updateSinglePreference({
        key: "autoPlayAudio", // ✅ This key should now be valid
        value,
      });
      
      console.log("🔧 SETTINGS: Sound effects update successful, updated user:", updatedUser);
      onUserUpdate(updatedUser);
      showAlert("success", "Sound settings updated successfully!");
    } catch (error: any) {
      console.error("❌ SETTINGS: Failed to update sound settings:", error);
      console.error("❌ SETTINGS: Error details:", {
        message: error.message,
        status: error.status,
        stack: error.stack
      });
      showAlert("error", error.message || "Failed to update sound settings");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle toggling hints (single preference update)
  const handleToggleHints = async (value: boolean) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      console.log("🔧 SETTINGS: Updating hints to:", value);
      
      const updatedUser = await profileApiService.updateSinglePreference({
        key: "enableHints", // ✅ Correct direct key format
        value,
      });
      onUserUpdate(updatedUser);
      showAlert("success", "Hints settings updated successfully!");
    } catch (error: any) {
      console.error("Failed to update hints setting:", error);
      showAlert("error", error.message || "Failed to update hints setting");
    } finally {
      setIsUpdating(false);
    }
  };

  // Navigate to Goals & Preferences screen
  const handleEditGoals = () => {
    router.push("/(routes)/profile/edit-goals");
  };

  // Navigate to Privacy & Security settings
  const handlePrivacySettings = () => {
    router.push("/(routes)/profile/privacy-settings");
  };

  // Handle data export request (backend integration)
  const handleExportData = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      // Assuming a backend endpoint exists for data export
      // await profileApiService.makeRequest("/users/export-data", {
      //   method: "POST",
      // });
      showAlert(
        "success",
        "Data export request submitted. You will receive an email with your data soon."
      );
    } catch (error: any) {
      console.error("Failed to request data export:", error);
      showAlert("error", error.message || "Failed to request data export");
    } finally {
      setIsUpdating(false);
    }
  };

  // Navigate to Help & FAQ
  const handleHelpFAQ = () => {
    router.push("/(routes)/support/help-faq");
  };

  // Navigate to Contact Support
  const handleContactSupport = () => {
    router.push("/(routes)/support/contact");
  };

  // Handle app rating (navigate to app store or in-app feedback)
  const handleRateApp = () => {
    router.push("/(routes)/support/rate-app");
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
      {/* Custom Alert for success/error feedback */}
      {alert.visible && (
        <CustomAlert
          visible={alert.visible}
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
          theme={theme}
          isDark={isDark}
        />
      )}

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
              disabled={isUpdating}
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
              disabled={isUpdating}
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
              disabled={isUpdating}
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
              disabled={isUpdating}
            />
          }
        />
        {/* New item for Goals & Preferences */}
        <SettingItem
          icon="flag"
          title="Goals & Preferences"
          subtitle="Set exam goals and learning preferences"
          theme={theme}
          onPress={handleEditGoals}
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
          onPress={() => router.push("/(routes)/profile/edit-profile")}
        />
        <SettingItem
          icon="shield-checkmark"
          title="Privacy & Security"
          subtitle="Manage your privacy settings"
          theme={theme}
          onPress={handlePrivacySettings}
        />
        <SettingItem
          icon="download"
          title="Download Data"
          subtitle="Export your learning data"
          theme={theme}
          onPress={handleExportData}
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
          onPress={handleHelpFAQ}
        />
        <SettingItem
          icon="mail"
          title="Contact Support"
          subtitle="Get help from our support team"
          theme={theme}
          onPress={handleContactSupport}
        />
        <SettingItem
          icon="star"
          title="Rate App"
          subtitle="Rate ExamPrep Africa on the app store"
          theme={theme}
          onPress={handleRateApp}
        />
      </View>
    </Animated.View>
  );
};