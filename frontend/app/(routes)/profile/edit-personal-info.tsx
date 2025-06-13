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
import type {
  UserProfile,
  UpdateProfileData,
} from "../../../src/types/user/user.types";

// Mock data for selectable options
const COUNTRIES = [
  { label: "Chad", value: "chad" },
  { label: "Cameroon", value: "cameroon" },
  { label: "Central African Republic", value: "car" },
  { label: "Niger", value: "niger" },
  { label: "Nigeria", value: "nigeria" },
  { label: "Sudan", value: "sudan" },
  { label: "Congo", value: "congo" },
  { label: "Gabon", value: "gabon" },
];

const GENDERS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export default function EditPersonalInfoScreen() {
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
              selectedExam: user.selectedExam,
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
            name: mockProfile.name,
            email: mockProfile.email,
            phoneNumber: mockProfile.phoneNumber || "",
            country: mockProfile.country || "",
            dateOfBirth: mockProfile.dateOfBirth
              ? new Date(mockProfile.dateOfBirth).toLocaleDateString()
              : "",
            gender: mockProfile.gender || "",
          });

          // Set date of birth if available
          if (mockProfile.dateOfBirth) {
            setDateOfBirth(new Date(mockProfile.dateOfBirth));
          }
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === "ios");

    if (currentDate) {
      setDateOfBirth(currentDate);
      updateFormData("dateOfBirth", currentDate.toLocaleDateString());
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    try {
      // Prepare update data
      const updateData: UpdateProfileData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        gender: formData.gender,
        dateOfBirth: dateOfBirth ? dateOfBirth : undefined,
      };

      // TODO: Implement API call to update user profile
      // const response = await profileApiService.updateProfile(updateData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user context with basic info
      if (user) {
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
          country: formData.country,
          goalDate: user?.goalDate || new Date,
        });
      }

      showAlert("success", "Personal information updated successfully!");

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error("Failed to update personal information:", error);
      showAlert(
        "error",
        "Failed to update personal information. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid =
    formData.name.trim() !== "" && formData.email.trim() !== "";

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
    cancelFooterButton: {
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
                <Text style={styles.sectionTitle}>Basic Information</Text>

                <View style={styles.inputContainer}>
                  <CustomInput
                    icon="person"
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChangeText={(text: string) => updateFormData("name", text)}
                    autoCapitalize="words"
                    focused={focusedField === "name"}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <CustomInput
                    icon="mail"
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChangeText={(text: string) => updateFormData("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    focused={focusedField === "email"}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View style={styles.inputContainer}>
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

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Location & Personal Details
                </Text>

                <View style={styles.inputContainer}>
                  <SelectField
                    icon="location"
                    label="Country"
                    value={formData.country}
                    options={COUNTRIES}
                    onSelect={(value) => updateFormData("country", value)}
                    placeholder="Select your country"
                    theme={theme}
                    isDark={isDark}
                  />
                </View>

                <View style={styles.inputContainer}>
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

                <View style={styles.inputContainer}>
                  <SelectField
                    icon="person"
                    label="Gender"
                    value={formData.gender}
                    options={GENDERS}
                    onSelect={(value) => updateFormData("gender", value)}
                    placeholder="Select your gender"
                    theme={theme}
                    isDark={isDark}
                  />
                </View>
              </View>

              <View style={styles.todoNote}>
                <Text style={styles.todoText}>
                  🚧 TODO: Implement phone number validation and backend
                  integration for updating personal information.
                </Text>
              </View>
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelFooterButton]}
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
                (!isFormValid || isSaving) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!isFormValid || isSaving}
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
                    (!isFormValid || isSaving) && styles.saveButtonTextDisabled,
                  ]}
                >
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={[styles.buttonText, styles.confirmButton]}>
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
