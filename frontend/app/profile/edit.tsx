"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomInput } from "../../src/components/common";
import { profileApiService } from "../../src/services/user/api.profile.service";
import { useUser } from "../../src/utils/UserContext";
import { useTheme } from "../../src/utils/ThemeContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmallScreen = SCREEN_HEIGHT < 700;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user: contextUser, setUser } = useUser();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: contextUser?.name || "",
    email: contextUser?.email || "",
    phoneNumber: "",
    country: contextUser?.country || "",
    schoolName: "",
    gradeLevel: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animation values
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);
  const headerScale = useSharedValue(0.8);

  React.useEffect(() => {
    fadeIn.value = withDelay(100, withSpring(1));
    slideUp.value = withDelay(200, withSpring(0, { damping: 20 }));
    headerScale.value = withDelay(300, withSpring(1, { damping: 15 }));
  }, [fadeIn, headerScale, slideUp]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: fadeIn.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
    opacity: fadeIn.value,
  }));

  const handleSave = async () => {
    if (!contextUser) return;

    setIsLoading(true);
    try {
      const updatedUser = await profileApiService.updateProfile(formData);

      // Update context user
      const updatedContextUser = {
        ...contextUser,
        name: updatedUser.name,
        email: updatedUser.email,
        country: updatedUser.country,
      };
      setUser(updatedContextUser);

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.name.trim() !== "" && formData.email.trim() !== "";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: isSmallScreen ? 20 : 24,
      paddingBottom: 20,
    },
    headerGradient: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 8,
      elevation: 8,
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    headerContent: {
      alignItems: "center",
    },
    backButton: {
      position: "absolute",
      top: 20,
      left: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.25)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.4)",
    },
    avatarText: {
      color: "white",
      fontSize: 28,
      fontWeight: "800",
      fontFamily: "Inter-Bold",
    },
    editAvatarButton: {
      position: "absolute",
      bottom: -2,
      right: -2,
      backgroundColor: "white",
      borderRadius: 16,
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    headerText: {
      alignItems: "center",
    },
    title: {
      fontSize: isSmallScreen ? 22 : 24,
      fontWeight: "800",
      color: "white",
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: "rgba(255,255,255,0.85)",
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
    },
    content: {
      flex: 1,
      paddingHorizontal: isSmallScreen ? 20 : 24,
    },
    section: {
      marginBottom: isSmallScreen ? 24 : 28,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    sectionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#3B82F6" + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    inputContainer: {
      marginBottom: isSmallScreen ? 16 : 18,
    },
    footer: {
      flexDirection: "row",
      paddingHorizontal: isSmallScreen ? 20 : 24,
      paddingVertical: 24,
      paddingBottom: Platform.OS === "ios" ? 40 : 24,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 16,
      backgroundColor: theme.colors.surface,
    },
    button: {
      flex: 1,
      borderRadius: 16,
      paddingVertical: isSmallScreen ? 14 : 16,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    cancelButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    saveButton: {
      backgroundColor: "#3B82F6",
      elevation: 6,
      shadowColor: "#3B82F6",
      shadowOpacity: 0.3,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.border,
      elevation: 2,
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
  });

  if (!contextUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: theme.colors.text }}>
            No user data available
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        <View style={styles.header}>
          <Animated.View style={[styles.headerGradient, headerAnimatedStyle]}>
            <LinearGradient
              colors={["#3B82F6", "#1D4ED8", "#1E40AF"]}
              style={{ borderRadius: 20 }}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleCancel}
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>

              <View style={styles.headerContent}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(contextUser.name)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.editAvatarButton}>
                    <Ionicons name="camera" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                </View>

                <View style={styles.headerText}>
                  <Text style={styles.title}>Edit Profile</Text>
                  <Text style={styles.subtitle}>
                    Update your personal information
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Animated.ScrollView
            style={[styles.content, formAnimatedStyle]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="person" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>

              <View style={styles.inputContainer}>
                <CustomInput
                  icon="person"
                  placeholder="Full name"
                  value={formData.name}
                  onChangeText={(text) => updateFormData("name", text)}
                  autoCapitalize="words"
                  focused={focusedField === "name"}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputContainer}>
                <CustomInput
                  icon="mail"
                  placeholder="Email address"
                  value={formData.email}
                  onChangeText={(text) => updateFormData("email", text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  focused={focusedField === "email"}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputContainer}>
                <CustomInput
                  icon="call"
                  placeholder="Phone number"
                  value={formData.phoneNumber}
                  onChangeText={(text) => updateFormData("phoneNumber", text)}
                  keyboardType="phone-pad"
                  focused={focusedField === "phoneNumber"}
                  onFocus={() => setFocusedField("phoneNumber")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputContainer}>
                <CustomInput
                  icon="location"
                  placeholder="Country"
                  value={formData.country}
                  onChangeText={(text) => updateFormData("country", text)}
                  autoCapitalize="words"
                  focused={focusedField === "country"}
                  onFocus={() => setFocusedField("country")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="school" size={16} color="#3B82F6" />
                </View>
                <Text style={styles.sectionTitle}>Education</Text>
              </View>

              <View style={styles.inputContainer}>
                <CustomInput
                  icon="school"
                  placeholder="School name"
                  value={formData.schoolName}
                  onChangeText={(text) => updateFormData("schoolName", text)}
                  autoCapitalize="words"
                  focused={focusedField === "schoolName"}
                  onFocus={() => setFocusedField("schoolName")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputContainer}>
                <CustomInput
                  icon="library"
                  placeholder="Grade level"
                  value={formData.gradeLevel}
                  onChangeText={(text) => updateFormData("gradeLevel", text)}
                  focused={focusedField === "gradeLevel"}
                  onFocus={() => setFocusedField("gradeLevel")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </Animated.ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                (!isFormValid || isLoading) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.loadingText}>Saving...</Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    styles.saveButtonText,
                    (!isFormValid || isLoading) &&
                      styles.saveButtonTextDisabled,
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