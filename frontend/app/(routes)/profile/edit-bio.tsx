"use client";

import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "../../../src/components/common/CustomAlert";
import { Footer } from "../../../src/components/profile/edit/Footer";
import { profileApiService } from "../../../src/services/user/api.profile.service";
import { useCommonStyles } from "../../../src/styles/commonEditStyle";
import type {
  UpdateBioData,
  UserProfile,
} from "../../../src/types/user/user.types";
import { useTheme } from "../../../src/utils/ThemeContext";
import { useUser } from "../../../src/utils/UserContext";

export default function EditBioScreen() {
  const router = useRouter();
  const { user } = useUser();
  const commonStyles = useCommonStyles();
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    type: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });

  const [bio, setBio] = useState("");
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 300;

  // Animation values for UI transitions
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);

  // Initialize animations on mount
  useEffect(() => {
    fadeIn.value = withDelay(100, withSpring(1));
    slideUp.value = withDelay(200, withSpring(0, { damping: 20 }));
  }, [fadeIn, slideUp]);

  // Fetch user profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const profileData = await profileApiService.getProfile();
        setProfile(profileData);

        // Initialize bio and character count from socialProfile.bio
        setBio(profileData.socialProfile?.bio || "");
        setCharCount(profileData.socialProfile?.bio?.length || 0);
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        showAlert(
          "error",
          error.message || "Failed to load profile data. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Animated styles for container and content
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  // Navigate back to previous screen
  const handleGoBack = () => {
    router.back();
  };

  // Update bio and character count
  const handleBioChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      setBio(text);
      setCharCount(text.length);
    }
  };

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

  // Validate bio input client-side
  const validateBio = (): { isValid: boolean; error?: string } => {
    if (bio.trim().length > MAX_CHARS) {
      return {
        isValid: false,
        error: `Bio must be ${MAX_CHARS} characters or less.`,
      };
    }
    return { isValid: true };
  };

  // Save bio changes to backend
  const handleSave = async () => {
    if (!user || !profile) return;

    const validation = validateBio();
    if (!validation.isValid) {
      showAlert("error", validation.error!);
      return;
    }

    setIsSaving(true);
    try {
      const updateData: UpdateBioData = {
        bio: bio.trim() || undefined,
      };

      const updatedProfile = await profileApiService.updateBio(updateData);
      setProfile(updatedProfile);

      showAlert("success", "Bio updated successfully!");
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to update bio:", error);
      let errorMessage = "Failed to update bio. Please try again.";

      if (
        error.message.includes("invalid") ||
        error.message.includes("invalide")
      ) {
        errorMessage = "Invalid bio format. Please check your input.";
      } else if (
        error.message.includes("length") ||
        error.message.includes("longueur")
      ) {
        errorMessage = `Bio must be ${MAX_CHARS} characters or less.`;
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      }

      showAlert("error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const styles = StyleSheet.create({
    bioInputContainer: {
      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      padding: 16,
      minHeight: 200,
    },
    bioInput: {
      fontSize: 16,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
      textAlignVertical: "top",
    },
    charCount: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "right",
      marginTop: 8,
      fontFamily: "Inter-Regular",
    },
    charCountWarning: {
      color: theme.colors.warning,
    },
    bioHint: {
      fontSize: theme.typography.bodySmall.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: 16,
      fontFamily: theme.typography.bodySmall.fontFamily,
    },
    bioTips: {
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(59, 130, 246, 0.1)",
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: "rgba(59, 130, 246, 0.3)",
    },
    bioTipsTitle: {
      fontSize: theme.typography.h5.fontSize,
      fontWeight: "700",
      color: theme.colors.primary,
      marginBottom: 8,
      fontFamily: "Inter-Bold",
    },
    bioTipsList: {
      marginLeft: 8,
    },
    bioTipsItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    bioTipsBullet: {
      color: theme.colors.primary,
      fontSize: 16,
      marginRight: 8,
      lineHeight: 22,
    },
    bioTipsText: {
      fontSize: theme.typography.bodySmall.fontSize,
      color: isDark ? theme.colors.text : theme.colors.textSecondary,
      fontFamily: theme.typography.bodySmall.fontFamily,
      flex: 1,
      lineHeight: theme.typography.bodySmall.lineHeight,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text, marginTop: 16 }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={["bottom"]}>
      <Animated.View style={[commonStyles.container, containerAnimatedStyle]}>
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

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={commonStyles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Animated.View
              entering={FadeIn.delay(50).duration(60)}
            >
              <View style={commonStyles.card}>
                <Text style={commonStyles.sectionTitle}>About Me</Text>
                <Text style={styles.bioHint}>
                  Write a short bio to tell others about yourself, your
                  interests, and your goals.
                </Text>

                <View style={styles.bioInputContainer}>
                  <TextInput
                    style={styles.bioInput}
                    value={bio}
                    onChangeText={handleBioChange}
                    placeholder="Write something about yourself..."
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={8}
                    maxLength={MAX_CHARS}
                    selectionColor="#3B82F6"
                  />
                </View>

                <Text
                  style={[
                    styles.charCount,
                    charCount > MAX_CHARS * 0.8 && styles.charCountWarning,
                  ]}
                >
                  {charCount}/{MAX_CHARS} characters
                </Text>
              </View>

              <View style={styles.bioTips}>
                <Text style={styles.bioTipsTitle}>Tips for a Great Bio</Text>
                <View style={styles.bioTipsList}>
                  <View style={styles.bioTipsItem}>
                    <Text style={styles.bioTipsBullet}>•</Text>
                    <Text style={styles.bioTipsText}>
                      Keep it concise and focused on your academic interests
                    </Text>
                  </View>
                  <View style={styles.bioTipsItem}>
                    <Text style={styles.bioTipsBullet}>•</Text>
                    <Text style={styles.bioTipsText}>
                      Mention your study goals and what motivates you
                    </Text>
                  </View>
                  <View style={styles.bioTipsItem}>
                    <Text style={styles.bioTipsBullet}>•</Text>
                    <Text style={styles.bioTipsText}>
                      Share your learning style and how you approach challenges
                    </Text>
                  </View>
                  <View style={styles.bioTipsItem}>
                    <Text style={styles.bioTipsBullet}>•</Text>
                    <Text style={styles.bioTipsText}>
                      Highlight any achievements or areas you&apos;re proud of
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </ScrollView>

          <Footer
            onCancel={handleGoBack}
            onSave={handleSave}
            isSaving={isSaving}
            loadingText="Saving..."
          />
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}
