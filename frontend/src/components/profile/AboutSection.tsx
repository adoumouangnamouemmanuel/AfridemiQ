"use client";

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import type { UserProfile } from "../../types/user/user.types";

interface AboutSectionProps {
  user: UserProfile;
  theme: any;
  onEditProfile: () => void;
  isDark?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  user,
  theme,
  isDark = false,
}) => {
  const router = useRouter();
  const [bio, ] = useState(
    user.bio || "No bio available. Add one to tell others about yourself."
  );

  // Animation values
  const slideUp = useSharedValue(50);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    slideUp.value = withDelay(200, withSpring(0, { damping: 20 }));
    opacity.value = withDelay(200, withSpring(1));
  }, [slideUp, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
    opacity: opacity.value,
  }));

  const navigateToEditSection = (section: string) => {
    router.push(`/profile/edit-${section}`);
  };

  // Replace mock data with actual user data where available
  const userData = {
    // Basic Info
    email: user.email,
    phoneNumber: user.phoneNumber || "Not provided",
    country: user.country || "Not specified",

    // Education
    educationLevel: user.gradeLevel || "Not specified",
    schoolName: user.schoolName || "Not specified",
    studyField: user.preferences?.studyField || "Not specified",

    // Exam Preparation
    targetExam: user.progress?.selectedExam || "Not selected",
    examYear: user.progress?.examYear || new Date().getFullYear().toString(),
    targetUniversity: user.preferences?.targetUniversity || "Not specified",

    // Personal
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth).toLocaleDateString()
      : "Not provided",
    gender: user.gender || "Not specified",
    language: user.preferredLanguage || "French",

    // Academic Goals
    careerGoal: user.preferences?.careerGoal || "Not specified",
    favoriteSubjects: user.preferences?.favoriteSubjects?.length
      ? user.preferences.favoriteSubjects
      : user.progress?.weakSubjects?.length
      ? user.progress.weakSubjects
      : ["Not specified"],
    studyHours: user.preferences?.studyHours || "Not tracked",
  };

  // Use the same blue color as in the ProfileHeader
  const blueColor = "#3B82F6";

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 20,
      fontFamily: "Inter-Bold",
      letterSpacing: -0.5,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.25 : 0.1,
      shadowRadius: 12,
      elevation: 5,
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    sectionSubtitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    editButton: {
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(59, 130, 246, 0.1)",
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(59, 130, 246, 0.3)",
    },
    editButtonText: {
      color: blueColor,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
      fontFamily: "Inter-SemiBold",
    },
    bioContent: {
      padding: 0,
    },
    bioText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
    },
    bioInput: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 16,
      minHeight: 120,
      textAlignVertical: "top",
    },
    bioActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
      gap: 12,
    },
    cancelButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginLeft: 6,
      fontFamily: "Inter-SemiBold",
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: blueColor,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(59, 130, 246, 0.3)",
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "white",
      marginLeft: 6,
      fontFamily: "Inter-SemiBold",
    },
    infoSection: {
      marginBottom: 8,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    infoIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(59, 130, 246, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    divider: {
      height: 16,
    },
    todoNote: {
      backgroundColor: theme.colors.warning + "15",
      borderRadius: 16,
      padding: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.warning + "30",
    },
    todoText: {
      fontSize: 13,
      color: theme.colors.warning,
      fontFamily: "Inter-Medium",
      textAlign: "center",
      lineHeight: 20,
    },
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.sectionTitle}>About Me</Text>

      {/* Bio Section */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Bio</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigateToEditSection("bio")}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color={blueColor} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioContent}>
          <Text style={styles.bioText}>{bio}</Text>
        </View>
      </View>

      {/* Personal Information */}
      <Animated.View
        style={styles.card}
        entering={FadeIn.delay(300).duration(500)}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Personal Information</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigateToEditSection("personal-info")}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color={blueColor} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="call" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{userData.phoneNumber}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>{userData.country}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>{userData.dateOfBirth}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{userData.gender}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, styles.lastRow]}>
            <View style={styles.infoIcon}>
              <Ionicons name="language" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Languages</Text>
              <Text style={styles.infoValue}>{userData.language}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Education */}
      <Animated.View
        style={styles.card}
        entering={FadeIn.delay(400).duration(500)}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Education</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigateToEditSection("education")}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color={blueColor} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="school" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>School</Text>
              <Text style={styles.infoValue}>{userData.schoolName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="library" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Education Level</Text>
              <Text style={styles.infoValue}>{userData.educationLevel}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="book" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Study Field</Text>
              <Text style={styles.infoValue}>{userData.studyField}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, styles.lastRow]}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Daily Study Hours</Text>
              <Text style={styles.infoValue}>
                {String(userData.studyHours)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Exam Preparation */}
      <Animated.View
        style={styles.card}
        entering={FadeIn.delay(500).duration(500)}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Exam Preparation</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigateToEditSection("goals")}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color={blueColor} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="trophy" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Target Exam</Text>
              <Text style={styles.infoValue}>{userData.targetExam}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Exam Year</Text>
              <Text style={styles.infoValue}>{userData.examYear}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="business" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Target University</Text>
              <Text style={styles.infoValue}>{userData.targetUniversity}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="briefcase" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Career Goal</Text>
              <Text style={styles.infoValue}>{userData.careerGoal}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, styles.lastRow]}>
            <View style={styles.infoIcon}>
              <Ionicons name="heart" size={22} color={blueColor} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Favorite Subjects</Text>
              <Text style={styles.infoValue}>
                {userData.favoriteSubjects.join(", ")}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Implementation Note */}
      <View style={styles.todoNote}>
        <Text style={styles.todoText}>
          Note: Some profile fields are missing in the current user model.
          Consider updating your User schema to include: date of birth, gender,
          languages, career goals, and other profile data shown here.
        </Text>
      </View>
    </Animated.View>
  );
};
