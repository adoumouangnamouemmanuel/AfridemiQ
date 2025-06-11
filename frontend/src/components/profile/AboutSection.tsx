"use client";

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import type { UserProfile } from "../../services/user/api.profile.service";

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

  // TODO: Replace with actual data from database
  const mockData = {
    // Basic Info
    email: user.email,
    phoneNumber: user.phoneNumber || "+235 XX XX XX XX", // TODO: Fetch from DB
    country: user.country || "Chad", // TODO: Make selectable from country list

    // Education
    educationLevel: user.gradeLevel || "Terminale", // TODO: Make selectable (Seconde, Première, Terminale, etc.)
    schoolName: user.schoolName || "Lycée de N'Djamena", // TODO: Fetch from DB
    studyField: "Sciences", // TODO: Add to user model and make selectable

    // Exam Preparation
    targetExam: user.progress.selectedExam || "Baccalauréat", // TODO: Make selectable
    examYear: "2024", // TODO: Add to user model
    targetUniversity: "Université de N'Djamena", // TODO: Add to user model and make selectable

    // Personal
    dateOfBirth: "15/03/2005", // TODO: Add to user model
    gender: "Male", // TODO: Add to user model and make selectable
    languages: ["French", "Arabic", "Sara"], // TODO: Add to user model and make selectable

    // Academic Goals
    careerGoal: "Engineering", // TODO: Add to user model and make selectable
    favoriteSubjects: ["Mathematics", "Physics"], // TODO: Derive from progress data
    studyHours: "4 hours/day", // TODO: Calculate from activity data
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
          value={mockData.email}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="call"
          label="Phone Number"
          value={mockData.phoneNumber}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="location"
          label="Country"
          value={mockData.country}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="calendar"
          label="Date of Birth"
          value={mockData.dateOfBirth}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="person"
          label="Gender"
          value={mockData.gender}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="language"
          label="Languages"
          value={mockData.languages.join(", ")}
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
          value={mockData.schoolName}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="library"
          label="Education Level"
          value={mockData.educationLevel}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="book"
          label="Study Field"
          value={mockData.studyField}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="time"
          label="Daily Study Hours"
          value={mockData.studyHours}
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
          value={mockData.targetExam}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="calendar"
          label="Exam Year"
          value={mockData.examYear}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="business"
          label="Target University"
          value={mockData.targetUniversity}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="briefcase"
          label="Career Goal"
          value={mockData.careerGoal}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
        <InfoItem
          icon="heart"
          label="Favorite Subjects"
          value={mockData.favoriteSubjects.join(", ")}
          theme={theme}
          editable
          onPress={onEditProfile}
        />
      </View>

      {/* TODO Note */}
      <View style={styles.todoNote}>
        <Text style={styles.todoText}>
          🚧 TODO: Implement selectable dropdowns for Country, Education Level,
          Study Field, Target Exam, Target University, Career Goal, and other
          fields. Data will be fetched from database.
        </Text>
      </View>
    </Animated.View>
  );
};