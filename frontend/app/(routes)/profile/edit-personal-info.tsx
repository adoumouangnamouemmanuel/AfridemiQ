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
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "../../../src/utils/UserContext";
import { useTheme } from "../../../src/utils/ThemeContext";
import { CustomInput } from "../../../src/components/common/CustomInputEdit";
import { PhoneInput } from "../../../src/components/common/PhoneInput";
import { SelectField } from "../../../src/components/profile/edit/SelectField";
import { CustomAlert } from "../../../src/components/common/CustomAlert";
import { profileApiService } from "../../../src/services/user/api.profile.service";
import type {
  UserProfile,
  UpdatePersonalInfoData,
} from "../../../src/types/user/user.types";
import { Footer } from "../../../src/components/profile/edit/Footer";
import { useCommonStyles } from "../../../src/styles/commonEditStyle";

// Static options for country and gender (TODO: Fetch from backend or config)
const COUNTRY_OPTIONS = [
  { label: "Chad", value: "Chad" },
  { label: "Cameroon", value: "Cameroon" },
  { label: "Nigeria", value: "Nigeria" },
];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

export default function EditPersonalInfoScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
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

  // Form data for user input
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    country: "",
    dateOfBirth: "",
    gender: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
        // Fetch user profile using API service
        const profileData = await profileApiService.getProfile();
        setProfile(profileData);

        // Initialize form data with fetched profile
        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          phoneNumber: profileData.phoneNumber || "",
          country: profileData.country || "",
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth).toLocaleDateString()
            : "",
          gender: profileData.gender || "",
        });

        // Set date of birth if available
        if (profileData.dateOfBirth) {
          setDateOfBirth(new Date(profileData.dateOfBirth));
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

  // Update form data for a specific field
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

  // Handle date picker changes
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === "ios");

    if (currentDate) {
      setDateOfBirth(currentDate);
      updateFormData("dateOfBirth", currentDate.toLocaleDateString());
    }
  };

  // Validate form inputs client-side
  const validateForm = (): { isValid: boolean; error?: string } => {
    if (!formData.name.trim()) {
      return { isValid: false, error: "Full name is required." };
    }
    if (!formData.email.trim()) {
      return { isValid: false, error: "Email address is required." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return { isValid: false, error: "Invalid email format." };
    }
    if (formData.phoneNumber && !/^\+\d{1,14}$/.test(formData.phoneNumber)) {
      return {
        isValid: false,
        error: "Phone number must start with + and contain 1-14 digits.",
      };
    }
    return { isValid: true };
  };

  // Save changes to user profile via backend
  const handleSave = async () => {
    if (!user || !profile) return;

    // Client-side validation
    const validation = validateForm();
    if (!validation.isValid) {
      showAlert("error", validation.error!);
      return;
    }

    setIsSaving(true);
    try {
      // Prepare update data for backend
      const updateData: UpdatePersonalInfoData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        country: formData.country || undefined,
        gender: formData.gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
      };

      // Update profile via API
      const updatedProfile = await profileApiService.updatePersonalInfo(
        updateData
      );

      // Update user context with new data
      setUser({
        ...user,
        name: updatedProfile.name,
        email: updatedProfile.email,
        country: updatedProfile.country || user.country,
        goalDate: user.goalDate || new Date(), // Preserve existing goalDate
      });

      // Update local profile state
      setProfile(updatedProfile);

      showAlert("success", "Personal information updated successfully!");

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to update personal information:", error);
      let errorMessage =
        "Failed to update personal information. Please try again.";

      // Handle specific backend errors
      if (
        error.message.includes("already used") ||
        error.message.includes("déjà utilisé")
      ) {
        errorMessage = "This email is already in use.";
      } else if (
        error.message.includes("invalid") ||
        error.message.includes("invalide")
      ) {
        errorMessage = "Invalid input data. Please check your entries.";
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      }

      showAlert("error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  // Styles (unchanged from original)
  const styles = StyleSheet.create({
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
    },
    datePickerButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
      borderRadius: 50,
      borderWidth: 1,
      borderColor:
        focusedField === "dateOfBirth" ? "#3B82F6" : theme.colors.border,
      paddingHorizontal: 16,
      height: 56,
    },
    datePickerIcon: {
      marginRight: 12,
    },
    datePickerText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
    },
    datePickerPlaceholder: {
      color: theme.colors.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        Platform.OS === "ios" ? "transparent" : "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: isDark ? "#1F2937" : "white",
      borderRadius: 16,
      padding: 20,
      width: "80%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 20,
    },
    modalButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginLeft: 8,
    },
    cancelButton: {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F3F4F6",
    },
    confirmButton: {
      backgroundColor: "#3B82F6",
    },
  });

  // Show loading state while fetching profile
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
                <Text style={commonStyles.sectionTitle}>Basic Information</Text>

                <View style={commonStyles.inputContainer}>
                  <CustomInput
                    icon="person"
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChangeText={(text: string) =>
                      updateFormData("name", text)
                    }
                    autoCapitalize="words"
                    focused={focusedField === "name"}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View style={commonStyles.inputContainer}>
                  <CustomInput
                    icon="mail"
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChangeText={(text: string) =>
                      updateFormData("email", text)
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    focused={focusedField === "email"}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View style={commonStyles.inputContainer}>
                  <PhoneInput
                    value={formData.phoneNumber}
                    onChangeText={(text) => updateFormData("phoneNumber", text)}
                    placeholder="Enter your phone number"
                    theme={theme}
                    isDark={isDark}
                    focused={focusedField === "phoneNumber"}
                    onFocus={() => setFocusedField("phoneNumber")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <View style={commonStyles.card}>
                <Text style={commonStyles.sectionTitle}>
                  Location & Personal Details
                </Text>

                <View style={commonStyles.inputContainer}>
                  <SelectField
                    icon="location"
                    label="Country"
                    value={formData.country}
                    options={COUNTRY_OPTIONS}
                    onSelect={(value) => updateFormData("country", value)}
                    placeholder="Select your country"
                    theme={theme}
                    isDark={isDark}
                  />
                </View>

                <View style={commonStyles.inputContainer}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      setFocusedField("dateOfBirth");
                      setShowDatePicker(true);
                    }}
                  >
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={
                        focusedField === "dateOfBirth"
                          ? "#3B82F6"
                          : theme.colors.textSecondary
                      }
                      style={styles.datePickerIcon}
                    />
                    <Text
                      style={[
                        styles.datePickerText,
                        !dateOfBirth && styles.datePickerPlaceholder,
                      ]}
                    >
                      {dateOfBirth
                        ? dateOfBirth.toLocaleDateString()
                        : "Select date of birth"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={commonStyles.inputContainer}>
                  <SelectField
                    icon="person"
                    label="Gender"
                    value={formData.gender}
                    options={GENDER_OPTIONS}
                    onSelect={(value) => updateFormData("gender", value)}
                    placeholder="Select your gender"
                    theme={theme}
                    isDark={isDark}
                  />
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

        {/* Date Picker Modal for Android */}
        {Platform.OS === "android" && showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Date Picker Modal for iOS */}
        {Platform.OS === "ios" && (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="fade"
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowDatePicker(false)}
            >
              <BlurView
                intensity={isDark ? 40 : 20}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />

              <View
                style={styles.modalContent}
                onStartShouldSetResponder={() => true}
              >
                <DateTimePicker
                  value={dateOfBirth || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  themeVariant={isDark ? "dark" : "light"}
                  style={{ width: "100%" }}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text
                      style={[
                        commonStyles.buttonText,
                        commonStyles.cancelButtonText,
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text
                      style={[commonStyles.buttonText, styles.confirmButton]}
                    >
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </Modal>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
