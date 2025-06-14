"use client";

import { Footer } from "../../../src/components/profile/edit/Footer";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
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
import { CustomInput } from "../../../src/components/common/CustomInputEdit";
import { SelectField } from "../../../src/components/profile/edit/SelectField";
import { profileApiService } from "../../../src/services/user/api.profile.service";
import { useCommonStyles } from "../../../src/styles/commonEditStyle";
import type {
  UpdateExamPreparationData,
  UserProfile,
} from "../../../src/types/user/user.types";
import { useTheme } from "../../../src/utils/ThemeContext";
import { useUser } from "../../../src/utils/UserContext";

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
  const commonStyles = useCommonStyles();
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
              style={contentAnimatedStyle}
              entering={FadeIn.delay(300).duration(500)}
            >
              <View style={commonStyles.card}>
                <Text style={commonStyles.sectionTitle}>Exam Preparation</Text>

                <View style={commonStyles.inputContainer}>
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

                <View style={commonStyles.inputContainer}>
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

              <View style={commonStyles.todoNote}>
                <Text style={commonStyles.todoText}>
                  Note: Ensure backend schema supports selectedExam and examYear
                  fields.
                </Text>
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
