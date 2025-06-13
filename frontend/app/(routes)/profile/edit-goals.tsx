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
import { SelectField } from "../../../src/components/profile/edit/SelectField";
import { CustomAlert } from "../../../src/components/common/CustomAlert";
import type {
  UserProfile,
  UpdateProfileData,
} from "../../../src/types/user/user.types";

// Mock data for selectable options
const LEARNING_STYLES = [
  { label: "Visual", value: "visual" },
  { label: "Auditory", value: "auditory" },
  { label: "Reading/Writing", value: "reading" },
  { label: "Kinesthetic", value: "kinesthetic" },
  { label: "Mixed", value: "mixed" },
];

const EXAMS = [
  { label: "GCE O Level", value: "gce_o" },
  { label: "GCE A Level", value: "gce_a" },
  { label: "BEPC", value: "bepc" },
  { label: "Probatoire", value: "probatoire" },
  { label: "Baccalauréat", value: "baccalaureat" },
  { label: "University Entrance", value: "university" },
];

export default function EditGoalsScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    type: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });

  const [formData, setFormData] = useState({
    selectedExam: "",
    learningStyle: "",
  });

  // Animation values
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);

  useEffect(() => {
    fadeIn.value = withDelay(100, withSpring(1));
    slideUp.value = withDelay(200, withSpring(0, { damping: 20 }));
  }, [fadeIn, slideUp]);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch the full profile from an API
        // const response = await profileApiService.getFullProfile();
        // setProfile(response.data);

        // For now, we'll simulate a profile based on the user data
        if (user) {
          // This is a mock profile - in a real app, you'd fetch this from your API
          const mockProfile: UserProfile = {
            _id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: "",
            isPhoneVerified: false,
            avatar: user.avatar,
            country: user.country || "",
            role: user.role,
            isPremium: user.isPremium,
            bio: "",
            dateOfBirth: "",
            gender: "",
            timeZone: "",
            preferredLanguage: "",
            schoolName: "",
            gradeLevel: "",
            subscription: {
              type: "free",
              startDate: new Date().toISOString(),
              paymentStatus: "active",
              features: [],
              accessLevel: "basic",
            },
            preferences: {
              notifications: {
                general: true,
                challengeNotifications: true,
                progressUpdates: true,
              },
              darkMode: isDark,
              fontSize: "medium",
              preferredContentFormat: "mixed",
              enableHints: true,
              autoPlayAudio: false,
              showStepSolutions: true,
              leaderboardVisibility: true,
              allowFriendRequests: true,
              multilingualSupport: ["en"],
            },
            settings: {
              learningStyle: "mixed",
            },
            progress: {
              selectedExam: user.selectedExam || "",
              xp: user.xp,
              level: user.level,
              streak: {
                current: user.streak,
                longest: user.streak,
              },
              totalQuizzes: 0,
              averageScore: 0,
              completedTopics: user.completedTopics,
              weakSubjects: user.weakSubjects,
              badges: user.badges,
              achievements: [],
            },
            socialProfile: {
              publicAchievements: [],
              visibility: "public",
              socialLinks: [],
            },
            analyticsId: "",
            notes: [],
            hintsUsed: [],
            bookmarks: [],
            friends: [],
            blockedUsers: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setProfile(mockProfile);

          // Initialize form data
          setFormData({
            selectedExam: mockProfile.progress.selectedExam || "",
            learningStyle: mockProfile.settings.learningStyle || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        showAlert("error", "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, isDark]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
    opacity: fadeIn.value,
  }));

  const handleGoBack = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    try {
      // Prepare update data
      const updateData: UpdateProfileData = {
        selectedExam: formData.selectedExam,
        learningStyle: formData.learningStyle,
      };

      // TODO: Implement API call to update user profile
      // const response = await profileApiService.updateProfile(updateData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user context with basic info
      if (user) {
        setUser({
          ...user,
          selectedExam: formData.selectedExam,
        });
      }

      showAlert("success", "Goals and preferences updated successfully!");

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error("Failed to update goals and preferences:", error);
      showAlert(
        "error",
        "Failed to update goals and preferences. Please try again."
      );
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
    inputContainer: {
      marginBottom: 16,
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
    todoNote: {
      backgroundColor: theme.colors.warning + "15",
      borderRadius: 12,
      padding: 12,
      marginTop: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.warning + "30",
    },
    todoText: {
      fontSize: 12,
      color: theme.colors.warning,
      fontFamily: "Inter-Medium",
      textAlign: "center",
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
                <Text style={styles.sectionTitle}>Exam Preparation</Text>

                <View style={styles.inputContainer}>
                  <SelectField
                    icon="school"
                    label="Target Exam"
                    value={formData.selectedExam}
                    options={EXAMS}
                    onSelect={(value) => updateFormData("selectedExam", value)}
                    placeholder="Select your target exam"
                    theme={theme}
                    isDark={isDark}
                  />
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Learning Preferences</Text>

                <View style={styles.inputContainer}>
                  <SelectField
                    icon="book"
                    label="Learning Style"
                    value={formData.learningStyle}
                    options={LEARNING_STYLES}
                    onSelect={(value) => updateFormData("learningStyle", value)}
                    placeholder="Select your preferred learning style"
                    theme={theme}
                    isDark={isDark}
                  />
                </View>
              </View>

              <View style={styles.todoNote}>
                <Text style={styles.todoText}>
                  🚧 TODO: Implement backend integration for updating goals and
                  learning preferences.
                </Text>
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
