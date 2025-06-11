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

interface SelectableOption {
  label: string;
  value: string;
}

// TODO: Fetch these from database
const COUNTRIES: SelectableOption[] = [
  { label: "Chad", value: "chad" },
  { label: "Cameroon", value: "cameroon" },
  { label: "Central African Republic", value: "car" },
  { label: "Niger", value: "niger" },
  { label: "Nigeria", value: "nigeria" },
    { label: "Sudan", value: "sudan" },
    { label: "Congo", value: "congo" },
    { label: "Gabon", value: "gabon" },
];

const EDUCATION_LEVELS: SelectableOption[] = [
  { label: "Seconde", value: "seconde" },
  { label: "Première", value: "premiere" },
  { label: "Terminale", value: "terminale" },
  { label: "University", value: "university" },
];

const STUDY_FIELDS: SelectableOption[] = [
  { label: "Sciences", value: "sciences" },
  { label: "Littéraire", value: "litteraire" },
  { label: "Économique", value: "economique" },
  { label: "Technique", value: "technique" },
];

const TARGET_EXAMS: SelectableOption[] = [
  { label: "Baccalauréat", value: "baccalaureat" },
  { label: "BEPC", value: "bepc" },
  { label: "University Entrance", value: "university_entrance" },
];

const CAREER_GOALS: SelectableOption[] = [
  { label: "Engineering", value: "engineering" },
  { label: "Medicine", value: "medicine" },
  { label: "Law", value: "law" },
  { label: "Business", value: "business" },
  { label: "Education", value: "education" },
  { label: "Technology", value: "technology" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user: contextUser, setUser } = useUser();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    // Basic Info
    name: contextUser?.name || "",
    email: contextUser?.email || "",
    phoneNumber: "",
    country: contextUser?.country || "",
    dateOfBirth: "",
    gender: "",

    // Education
    schoolName: "",
    educationLevel: "",
    studyField: "",

    // Exam Preparation
    targetExam: "",
    examYear: "",
    targetUniversity: "",
    careerGoal: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("personal");

  // Animation values
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);
  const headerScale = useSharedValue(0.8);

  React.useEffect(() => {
    fadeIn.value = withDelay(100, withSpring(1));
    slideUp.value = withDelay(200, withSpring(0, { damping: 20 }));
    headerScale.value = withDelay(300, withSpring(1, { damping: 15 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const sections = [
    { id: "personal", label: "Personal", icon: "person" },
    { id: "education", label: "Education", icon: "school" },
    { id: "goals", label: "Goals", icon: "target" },
  ];

  const SelectableField: React.FC<{
    icon: string;
    label: string;
    value: string;
    options: SelectableOption[];
    onSelect: (value: string) => void;
    placeholder: string;
  }> = ({ icon, label, value, options, onSelect, placeholder }) => {
    const [showOptions, setShowOptions] = useState(false);

    return (
      <View style={styles.selectableContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.selectableField}
          onPress={() => setShowOptions(!showOptions)}
        >
          <View style={styles.selectableContent}>
            <Ionicons
              name={icon as any}
              size={20}
              color={theme.colors.primary}
              style={styles.fieldIcon}
            />
            <Text
              style={[styles.selectableText, !value && styles.placeholderText]}
            >
              {value
                ? options.find((opt) => opt.value === value)?.label
                : placeholder}
            </Text>
            <Ionicons
              name={showOptions ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {showOptions && (
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  value === option.value && styles.selectedOption,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  setShowOptions(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
                {value === option.value && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "personal":
        return (
          <>
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

            <SelectableField
              icon="location"
              label="Country"
              value={formData.country}
              options={COUNTRIES}
              onSelect={(value) => updateFormData("country", value)}
              placeholder="Select your country"
            />

            <View style={styles.inputContainer}>
              <CustomInput
                icon="calendar"
                placeholder="Date of Birth (DD/MM/YYYY)"
                value={formData.dateOfBirth}
                onChangeText={(text) => updateFormData("dateOfBirth", text)}
                focused={focusedField === "dateOfBirth"}
                onFocus={() => setFocusedField("dateOfBirth")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <SelectableField
              icon="person"
              label="Gender"
              value={formData.gender}
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
              ]}
              onSelect={(value) => updateFormData("gender", value)}
              placeholder="Select your gender"
            />
          </>
        );

      case "education":
        return (
          <>
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

            <SelectableField
              icon="library"
              label="Education Level"
              value={formData.educationLevel}
              options={EDUCATION_LEVELS}
              onSelect={(value) => updateFormData("educationLevel", value)}
              placeholder="Select your education level"
            />

            <SelectableField
              icon="book"
              label="Study Field"
              value={formData.studyField}
              options={STUDY_FIELDS}
              onSelect={(value) => updateFormData("studyField", value)}
              placeholder="Select your study field"
            />

            <SelectableField
              icon="trophy"
              label="Target Exam"
              value={formData.targetExam}
              options={TARGET_EXAMS}
              onSelect={(value) => updateFormData("targetExam", value)}
              placeholder="Select your target exam"
            />
          </>
        );

      case "goals":
        return (
          <>
            <View style={styles.inputContainer}>
              <CustomInput
                icon="calendar"
                placeholder="Exam Year (e.g., 2024)"
                value={formData.examYear}
                onChangeText={(text) => updateFormData("examYear", text)}
                keyboardType="numeric"
                focused={focusedField === "examYear"}
                onFocus={() => setFocusedField("examYear")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.inputContainer}>
              <CustomInput
                icon="business"
                placeholder="Target University"
                value={formData.targetUniversity}
                onChangeText={(text) =>
                  updateFormData("targetUniversity", text)
                }
                autoCapitalize="words"
                focused={focusedField === "targetUniversity"}
                onFocus={() => setFocusedField("targetUniversity")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <SelectableField
              icon="briefcase"
              label="Career Goal"
              value={formData.careerGoal}
              options={CAREER_GOALS}
              onSelect={(value) => updateFormData("careerGoal", value)}
              placeholder="Select your career goal"
            />
          </>
        );

      default:
        return null;
    }
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
    },
    headerContent: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
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
    sectionTabs: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 4,
      marginHorizontal: isSmallScreen ? 20 : 24,
      marginBottom: 20,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    sectionTab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 12,
    },
    activeSectionTab: {
      backgroundColor: "#3B82F6",
      elevation: 2,
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    sectionTabIcon: {
      marginBottom: 4,
    },
    sectionTabText: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
    },
    activeSectionTabText: {
      color: "white",
    },
    content: {
      flex: 1,
      paddingHorizontal: isSmallScreen ? 20 : 24,
    },
    inputContainer: {
      marginBottom: isSmallScreen ? 16 : 18,
    },
    selectableContainer: {
      marginBottom: isSmallScreen ? 16 : 18,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
    },
    selectableField: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    selectableContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    fieldIcon: {
      marginRight: 12,
    },
    selectableText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      fontFamily: "Inter-Medium",
    },
    placeholderText: {
      color: theme.colors.textSecondary,
    },
    optionsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      maxHeight: 200,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectedOption: {
      backgroundColor: theme.colors.primary + "15",
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: "Inter-Medium",
    },
    selectedOptionText: {
      color: theme.colors.primary,
      fontWeight: "600",
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
    todoNote: {
      backgroundColor: theme.colors.warning + "15",
      borderRadius: 12,
      padding: 12,
      marginTop: 16,
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
                  <Text style={styles.subtitle}>Update your information</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Section Tabs */}
        <View style={styles.sectionTabs}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionTab,
                activeSection === section.id && styles.activeSectionTab,
              ]}
              onPress={() => setActiveSection(section.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={section.icon as any}
                size={16}
                color={
                  activeSection === section.id ? "white" : theme.colors.text
                }
                style={styles.sectionTabIcon}
              />
              <Text
                style={[
                  styles.sectionTabText,
                  activeSection === section.id && styles.activeSectionTabText,
                ]}
              >
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Animated.ScrollView
            style={[styles.content, formAnimatedStyle]}
            showsVerticalScrollIndicator={false}
          >
            {renderSectionContent()}

            {/* TODO Note */}
            <View style={styles.todoNote}>
              <Text style={styles.todoText}>
                🚧 TODO: Implement backend integration for all selectable
                fields. Add validation, image upload for avatar, and sync with
                database.
              </Text>
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
