"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
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
import { useCommonStyles } from "../../../src/styles/commonEditStyle";
import { CustomInput } from "../../../src/components/common/CustomInputEdit";
import { SelectField } from "../../../src/components/profile/edit/SelectField";
import { CustomAlert } from "../../../src/components/common/CustomAlert";
import { profileApiService } from "../../../src/services/user/api.profile.service";
import type {
  UserProfile,
  UpdateEducationData,
} from "../../../src/types/user/user.types";
import { Footer } from "../../../src/components/profile/edit/Footer";

// Selectable options for grade level
const GRADE_LEVELS = [
  { label: "Primary School", value: "primary" },
  { label: "Middle School", value: "middle" },
  { label: "High School", value: "high" },
  { label: "University", value: "university" },
  { label: "Graduate School", value: "graduate" },
  { label: "Other", value: "other" },
];

export default function EditEducationScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { theme, isDark } = useTheme();
  const commonStyles = useCommonStyles();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    type: "success" as "success" | "error" | "warning" | "info",
    message: "",
  });

  const [formData, setFormData] = useState({
    schoolName: "",
    gradeLevel: "",
    studyField: "",
    studyHours: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animation values
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);

  useEffect(() => {
    fadeIn.value = withDelay(100, withSpring(1));
    slideUp.value = withDelay(200, withSpring(0, { damping: 20 }));
  }, [fadeIn, slideUp]);

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const profileData = await profileApiService.getProfile();
        setProfile(profileData);
        setFormData({
          schoolName: profileData.schoolName || "",
          gradeLevel: profileData.gradeLevel || "",
          studyField: profileData.preferences.studyField || "",
          studyHours: profileData.preferences.studyHours?.toString() || "",
        });
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

    if (user) {
      fetchProfile();
    }
  }, [user]);

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

  // Client-side validation
  const validateForm = (): { isValid: boolean; error?: string } => {
    if (formData.schoolName.length > 100) {
      return {
        isValid: false,
        error: "School name must be 100 characters or less.",
      };
    }
    if (
      formData.gradeLevel &&
      !GRADE_LEVELS.some((option) => option.value === formData.gradeLevel)
    ) {
      return {
        isValid: false,
        error: "Please select a valid grade level.",
      };
    }
    if (formData.studyField.length > 50) {
      return {
        isValid: false,
        error: "Study field must be 50 characters or less.",
      };
    }
    if (formData.studyHours) {
      const hours = parseFloat(formData.studyHours);
      if (isNaN(hours) || hours < 0 || hours > 24) {
        return {
          isValid: false,
          error: "Daily study hours must be a number between 0 and 24.",
        };
      }
    }
    return { isValid: true };
  };

  // Save education information to backend
  const handleSave = async () => {
    if (!user || !profile) return;

    const validation = validateForm();
    if (!validation.isValid) {
      showAlert("error", validation.error!);
      return;
    }

    setIsSaving(true);
    try {
      const updateData: UpdateEducationData = {
        schoolName: formData.schoolName.trim() || undefined,
        gradeLevel: formData.gradeLevel || undefined,
        studyField: formData.studyField.trim() || undefined,
        studyHours: formData.studyHours
          ? parseFloat(formData.studyHours)
          : undefined,
      };

      const updatedProfile = await profileApiService.updateEducation(
        updateData
      );
      setProfile(updatedProfile);

      showAlert("success", "Education information updated successfully!");
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to update education information:", error);
      let errorMessage =
        "Failed to update education information. Please try again.";

      if (
        error.message.includes("invalid") ||
        error.message.includes("invalide")
      ) {
        errorMessage = "Invalid input format. Please check your entries.";
      } else if (
        error.message.includes("length") ||
        error.message.includes("longueur")
      ) {
        errorMessage = "Input exceeds maximum length.";
      } else if (
        error.message.includes("number") ||
        error.message.includes("nombre")
      ) {
        errorMessage =
          "Daily study hours must be a valid number between 0 and 24.";
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
      <Animated.View style={[commonStyles.container]}>
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
                <Text style={commonStyles.sectionTitle}>
                  Education Information
                </Text>

                <View style={commonStyles.inputContainer}>
                  <CustomInput
                    icon="school"
                    label="School Name"
                    placeholder="Enter your school name"
                    value={formData.schoolName}
                    onChangeText={(text) => updateFormData("schoolName", text)}
                    autoCapitalize="words"
                    focused={focusedField === "schoolName"}
                    onFocus={() => setFocusedField("schoolName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View style={commonStyles.inputContainer}>
                  <SelectField
                    icon="school"
                    label="Grade Level"
                    value={formData.gradeLevel}
                    options={GRADE_LEVELS}
                    onSelect={(value) => updateFormData("gradeLevel", value)}
                    placeholder="Select your grade level"
                    theme={theme}
                    isDark={isDark}
                  />
                </View>

                <View style={commonStyles.inputContainer}>
                  <CustomInput
                    icon="book"
                    label="Study Field"
                    placeholder="Enter your study field (e.g., Computer Science)"
                    value={formData.studyField}
                    onChangeText={(text) => updateFormData("studyField", text)}
                    autoCapitalize="words"
                    focused={focusedField === "studyField"}
                    onFocus={() => setFocusedField("studyField")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View style={commonStyles.inputContainer}>
                  <CustomInput
                    icon="time"
                    label="Daily Study Hours"
                    placeholder="Enter hours (e.g., 2.5)"
                    value={formData.studyHours}
                    onChangeText={(text) => updateFormData("studyHours", text)}
                    keyboardType="numeric"
                    focused={focusedField === "studyHours"}
                    onFocus={() => setFocusedField("studyHours")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <View style={commonStyles.todoNote}>
                <Text style={commonStyles.todoText}>
                  Note: Ensure backend schema supports schoolName, gradeLevel,
                  studyField, and studyHours fields.
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
