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
import { CustomInput } from "../../../src/components/common/CustomInputEdit";
import { CustomAlert } from "../../../src/components/common/CustomAlert";
import { profileApiService } from "../../../src/services/user/api.profile.service";
import type {
  UserProfile,
  UpdateExamPreparationData,
} from "../../../src/types/user/user.types";

// Commented out LEARNING_STYLES for potential future use
/*
const LEARNING_STYLES = [
  { label: "Visual", value: "visual" },
  { label: "Auditory", value: "auditory" },
  { label: "Reading/Writing", value: "reading" },
  { label: "Kinesthetic", value: "kinesthetic" },
  { label: "Mixed", value: "mixed" },
];
*/

// Define selectable options for target exams
const EXAMS = [
  { label: "GCE O Level", value: "gce_o" },
  { label: "GCE A Level", value: "gce_a" },
  { label: "BEPC", value: "bepc" },
  { label: "Probatoire", value: "probatoire" },
  { label: "Baccalauréat", value: "baccalaureat" },
  { label: "University Entrance", value: "university" },
];

export default function EditGoalsScreen() {
  // Initialize router for navigation
  const router = useRouter();
  // Get user context
  const { user } = useUser();
  // Get theme and dark mode status
  const { theme, isDark } = useTheme();
  // State for storing user profile data
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  // State for loading indicator
  const [isLoading, setIsLoading] = React.useState(true);
  // State for saving indicator
  const [isSaving, setIsSaving] = React.useState(false);
  // State for alert configuration
  const [alert, setAlert] = useState({
    visible: false,
    type: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });
  // State for tracking focused input field
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // State for form data
  const [formData, setFormData] = useState({
    selectedExam: "",
    examYear: "",
  });

  // Animation values for UI transitions
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);

  // Initialize animations on component mount
  useEffect(() => {
    fadeIn.value = withDelay(100, withSpring(1));
    slideUp.value = withDelay(200, withSpring(0, { damping: 20 }));
  }, [fadeIn, slideUp]);

  // Fetch user profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const profileData = await profileApiService.getProfile();
          setProfile(profileData);
          // Initialize form data from fetched profile
          setFormData({
            selectedExam: profileData.progress?.selectedExam || "",
            examYear: profileData.progress?.examYear?.toString() || "",
          });
        }
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

  // Animated style for container
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  // Animated style for content
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
    opacity: fadeIn.value,
  }));

  // Navigate back to previous screen
  const handleGoBack = () => {
    router.back();
  };

  // Update form data state
  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  // Validate form inputs client-side
  const validateForm = (): { isValid: boolean; error?: string } => {
    if (
      formData.selectedExam &&
      !EXAMS.some((exam) => exam.value === formData.selectedExam)
    ) {
      return {
        isValid: false,
        error: "Please select a valid target exam.",
      };
    }
    if (formData.examYear) {
      const year = parseInt(formData.examYear, 10);
      if (
        isNaN(year) ||
        formData.examYear.length !== 4 ||
        year < 2020 ||
        year > 2030
      ) {
        return {
          isValid: false,
          error: "Exam year must be a valid year (YYYY) between 2020 and 2030.",
        };
      }
    }
    return { isValid: true };
  };

  // Save goals and preferences to backend
  const handleSave = async () => {
    if (!user || !profile) return;

    const validation = validateForm();
    if (!validation.isValid) {
      showAlert("error", validation.error!);
      return;
    }

    setIsSaving(true);
    try {
      // Prepare update data
      const updateData: UpdateExamPreparationData = {
        selectedExam: formData.selectedExam || undefined,
        examYear: formData.examYear
          ? parseInt(formData.examYear, 10)
          : undefined,
      };

      // Call API to update exam preparation data
      const updatedProfile = await profileApiService.updateExamPreparation(
        updateData
      );
      setProfile(updatedProfile);

      showAlert("success", "Goals updated successfully!");
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to update goals:", error);
      let errorMessage = "Failed to update goals. Please try again.";

      // Parse specific backend error messages
      if (
        error.message.includes("invalid") ||
        error.message.includes("invalide") ||
        error.message.includes("format YYYY")
      ) {
        errorMessage = "Exam year must be in YYYY format (e.g., 2025).";
      } else if (error.message.includes("exam")) {
        errorMessage = "Invalid target exam selected.";
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

                <View style={styles.inputContainer}>
                  <CustomInput
                    icon="calendar"
                    label="Exam Year"
                    placeholder="Enter exam year (e.g., 2025)"
                    value={formData.examYear}
                    onChangeText={(text) => updateFormData("examYear", text)}
                    keyboardType="numeric"
                    focused={focusedField === "examYear"}
                    onFocus={() => setFocusedField("examYear")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Commented out learning style section for potential future use */}
              {/*
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Learning Preferences</Text>
                <View style={styles.inputContainer}>
                  <SelectField
                    icon="book"
                    label="Learning Style"
                    value={formData.examYear}
                    options={LEARNING_STYLES}
                    onSelect={(value) => updateFormData("examYear", value)}
                    placeholder="Select your preferred learning style"
                    theme={theme}
                    isDark={isDark}
                  />
                </View>
              </View>
              */}

              <View style={styles.todoNote}>
                <Text style={styles.todoText}>
                  Note: Ensure backend schema supports selectedExam and examYear
                  fields.
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
