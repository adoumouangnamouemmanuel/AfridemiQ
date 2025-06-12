"use client";

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
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
}

interface InfoItemProps {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
  theme: any;
  editable?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({
  icon,
  label,
  value,
  onPress,
  theme,
  editable = false,
}) => {
  const styles = StyleSheet.create({
    item: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    label: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
      marginBottom: 2,
    },
    value: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    editIcon: {
      marginLeft: 8,
    },
  });

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      disabled={!editable}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "Not specified"}</Text>
      </View>
      {editable && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.editIcon}
        />
      )}
    </TouchableOpacity>
  );
};

export const AboutSection: React.FC<AboutSectionProps> = ({
  user,
  theme,
  onEditProfile,
}) => {
  const slideUp = useSharedValue(50);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    slideUp.value = withDelay(200, withSpring(0, { damping: 20 }));
    opacity.value = withDelay(200, withSpring(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
    opacity: opacity.value,
  }));

  // Replace mock data with actual user data where available
  // Use optional chaining and fallbacks for potentially missing data
  const userData = {
    // Basic Info
    email: user.email,
    phoneNumber: user.phoneNumber || "Not provided",
    country: user.country || "Not specified",

    // Education
    educationLevel: user.gradeLevel || "Not specified",
    schoolName: user.schoolName || "Not specified",
    studyField: user.preferences?.studyField || "Not specified", // Check if this exists in your model

    // Exam Preparation
    targetExam: user.progress?.selectedExam || "Not selected",
    examYear: user.progress?.examYear || new Date().getFullYear().toString(),
    targetUniversity: user.preferences?.targetUniversity || "Not specified",

    // Personal
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth).toLocaleDateString()
      : "Not provided",
    gender: user.gender || "Not specified",
    language: user.preferredLanguage || "French", // Default to English if not specified

    // Academic Goals
    careerGoal: user.preferences?.careerGoal || "Not specified",
    favoriteSubjects: user.preferences?.favoriteSubjects?.length
      ? user.preferences.favoriteSubjects
      : user.progress?.weakSubjects?.length
      ? user.progress.weakSubjects
      : ["Not specified"],
    studyHours: user.preferences?.studyHours || "Not tracked",
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
      fontFamily: "Inter-Bold",
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    sectionSubtitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    editButton: {
      backgroundColor: theme.colors.primary + "15",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      flexDirection: "row",
      alignItems: "center",
    },
    editButtonText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
      fontFamily: "Inter-SemiBold",
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

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.sectionTitle}>About Me</Text>

      {/* Personal Information */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Personal Information</Text>
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Ionicons
              name="create-outline"
              size={14}
              color={theme.colors.primary}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <InfoItem
          icon="mail"
          label="Email"
          value={userData.email}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="call"
          label="Phone Number"
          value={userData.phoneNumber}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="location"
          label="Country"
          value={userData.country}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="calendar"
          label="Date of Birth"
          value={userData.dateOfBirth}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="person"
          label="Gender"
          value={userData.gender}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="language"
          label="Languages"
          value={userData.language}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
      </View>

      {/* Education */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Education</Text>
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Ionicons
              name="create-outline"
              size={14}
              color={theme.colors.primary}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <InfoItem
          icon="school"
          label="School"
          value={userData.schoolName}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="library"
          label="Education Level"
          value={userData.educationLevel}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="book"
          label="Study Field"
          value={userData.studyField}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="time"
          label="Daily Study Hours"
          value={String(userData.studyHours)}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
      </View>

      {/* Exam Preparation */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>Exam Preparation</Text>
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Ionicons
              name="create-outline"
              size={14}
              color={theme.colors.primary}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <InfoItem
          icon="trophy"
          label="Target Exam"
          value={userData.targetExam}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="calendar"
          label="Exam Year"
          value={userData.examYear}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="business"
          label="Target University"
          value={userData.targetUniversity}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="briefcase"
          label="Career Goal"
          value={userData.careerGoal}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="heart"
          label="Favorite Subjects"
          value={userData.favoriteSubjects.join(", ")}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
      </View>

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
