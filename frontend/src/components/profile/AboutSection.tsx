"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
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
  const [bio] = useState(user.socialProfile?.bio || ""); // Changed from user.bio to user.socialProfile.bio

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
    studyField: user.preferences.studyField || "Not specified",

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
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.h1.fontSize,
      fontWeight: theme.typography.h1.fontWeight,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      fontFamily: theme.typography.h1.fontFamily,
      letterSpacing: -0.5,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.25 : 0.1,
      shadowRadius: 12,
      elevation: 5,
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    sectionSubtitle: {
      fontSize: theme.typography.h2.fontSize,
      fontWeight: theme.typography.h2.fontWeight,
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
    },
    editButton: {
      backgroundColor: theme.colors.primary + "20",
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.sm + 6,
      paddingVertical: theme.spacing.xs + 4,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    editButtonText: {
      color: theme.colors.primary,
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      marginLeft: 6,
      fontFamily: "Inter-SemiBold",
    },
    bioContent: {
      padding: 0,
    },
    bioText: {
      fontSize: theme.typography.body.fontSize,
      lineHeight: theme.typography.body.lineHeight,
      color: theme.colors.text,
      fontFamily: theme.typography.body.fontFamily,
    },
    infoSection: {
      marginBottom: theme.spacing.xs + 4,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.sm + 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    infoIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: theme.typography.caption.fontSize + 3,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
      marginBottom: theme.spacing.xs,
    },
    infoValue: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    todoNote: {
      backgroundColor: theme.colors.warning + "15",
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginTop: theme.spacing.xs + 4,
      borderWidth: 1,
      borderColor: theme.colors.warning + "30",
    },
    todoText: {
      fontSize: theme.typography.caption.fontSize + 3,
      color: theme.colors.warning,
      fontFamily: "Inter-Medium",
      textAlign: "center",
      lineHeight: theme.spacing.lg - 4,
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
