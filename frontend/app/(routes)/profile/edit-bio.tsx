"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { useUser } from "../../../src/utils/UserContext";
import { useTheme } from "../../../src/utils/ThemeContext";
import { CustomAlert } from "../../../src/components/common/CustomAlert";
import { profileApiService } from "../../../src/services/user/api.profile.service";
import type {
  UserProfile,
  UpdateBioData,
} from "../../../src/types/user/user.types";

export default function EditBioScreen() {
  const router = useRouter();
  const { user } = useUser();
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

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
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
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
      marginTop: 8,
      fontFamily: "Inter-Bold",
    },
    card: {
      backgroundColor: isDark ? "#1F2937" : theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
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
    footer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: Platform.OS === "ios" ? 32 : 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: isDark ? "#1F2937" : theme.colors.surface,
      gap: 12,
    },
    button: {
      flex: 1,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cancelButton: {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    saveButton: {
      backgroundColor: "#3B82F6",
      elevation: 4,
      shadowColor: "#3B82F6",
      shadowOpacity: 0.2,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.border,
      elevation: 1,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
    saveButtonText: {
      color: "white",
    },
    saveButtonTextDisabled: {
      color: theme.colors.textSecondary,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 8,
      fontFamily: "Inter-Bold",
    },
    bioHint: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 16,
      fontFamily: "Inter-Regular",
    },
    bioTips: {
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(59, 130, 246, 0.1)",
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
      borderWidth: 1,
      borderColor: "rgba(59, 130, 246, 0.3)",
    },
    bioTipsTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#3B82F6",
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
      color: "#3B82F6",
      fontSize: 16,
      marginRight: 8,
      lineHeight: 22,
    },
    bioTipsText: {
      fontSize: 14,
      color: isDark ? theme.colors.text : theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      flex: 1,
      lineHeight: 20,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
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
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Animated.View
              style={contentAnimatedStyle}
              entering={FadeIn.delay(300).duration(500)}
            >
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>About Me</Text>
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

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                isSaving && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.loadingText}>Saving...</Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    styles.saveButtonText,
                    isSaving && styles.saveButtonTextDisabled,
                  ]}
                >
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}
