"use client";

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
import type { UserProfile } from "../../../src/types/user/user.types";


export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [, setIsLoading] = React.useState(true);

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
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
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

  const navigateToSection = (section: string) => {
    router.push(`/profile/${section}`);
  };

  const sections = [
    {
      id: "edit-personal-info",
      title: "Personal Information",
      icon: "person",
      description: "Update your basic personal details",
      items: ["Name", "Email", "Phone", "Country", "Date of Birth", "Gender"],
      color: "#3B82F6",
    },
    {
      id: "edit-education",
      title: "Education",
      icon: "school",
      description: "Update your educational background",
      items: ["School", "Education Level", "Study Field", "Target Exam"],
      color: "#10B981",
    },
    {
      id: "edit-goals",
      title: "Goals & Aspirations",
      icon: "flag",
      description: "Set your academic and career goals",
      items: ["Exam Year", "Target University", "Career Goal", "Study Hours"],
      color: "#F59E0B",
    },
    {
      id: "edit-bio",
      title: "Bio",
      icon: "create",
      description: "Tell others about yourself",
      items: ["Bio"],
      color: "#8B5CF6",
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: isDark ? theme.colors.background : theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginTop: 4,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    profileCard: {
      backgroundColor: isDark ? theme.colors.surface : "#3B82F6",
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    avatarContainer: {
      marginRight: 16,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.3)"
        : "rgba(255, 255, 255, 0.3)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.4)"
        : "rgba(255, 255, 255, 0.6)",
    },
    avatarText: {
      color: isDark ? "white" : "white",
      fontSize: 24,
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? theme.colors.text : "white",
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: isDark ? theme.colors.textSecondary : "rgba(255, 255, 255, 0.9)",
      fontFamily: "Inter-Regular",
      marginBottom: 8,
    },
    profileStats: {
      flexDirection: "row",
      alignItems: "center",
    },
    profileStat: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    profileStatIcon: {
      marginRight: 4,
      color: isDark ? theme.colors.primary : "white",
    },
    profileStatText: {
      fontSize: 13,
      color: isDark ? theme.colors.text : "white",
      fontFamily: "Inter-Medium",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
      fontFamily: "Inter-Bold",
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    sectionInfo: {
      flex: 1,
    },
    sectionHeaderTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    sectionHeaderDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    sectionContent: {
      padding: 16,
      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
    },
    sectionItems: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    sectionItem: {
      backgroundColor: isDark
        ? "rgba(255,255,255,0.1)"
        : "rgba(255,255,255,0.7)",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
    },
    sectionItemText: {
      fontSize: 12,
      color: isDark ? "rgba(255,255,255,0.8)" : theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: Platform.OS === "ios" ? 32 : 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: isDark ? theme.colors.background : "#3B82F6",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? theme.colors.text : "white",
      marginLeft: 8,
      fontFamily: "Inter-SemiBold",
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Animated.View
            style={[styles.profileCard, contentAnimatedStyle]}
            entering={FadeIn.delay(200).duration(500)}
          >
            <View style={styles.avatarContainer}>
              {profile?.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(profile?.name || "")}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.name}</Text>
              <Text style={styles.profileEmail}>{profile?.email}</Text>
              <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                  <Ionicons
                    name="star"
                    size={14}
                    style={styles.profileStatIcon}
                  />
                  <Text style={styles.profileStatText}>
                    Level {profile?.progress.level}
                  </Text>
                </View>
                <View style={styles.profileStat}>
                  <Ionicons
                    name="flame"
                    size={14}
                    style={styles.profileStatIcon}
                  />
                  <Text style={styles.profileStatText}>
                    {profile?.progress.streak.current} Day Streak
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Text style={styles.sectionTitle}>Edit Profile</Text>

          {sections.map((section, index) => (
            <Animated.View
              key={section.id}
              style={styles.sectionCard}
              entering={FadeIn.delay(300 + index * 100).duration(500)}
            >
              <TouchableOpacity
                onPress={() => navigateToSection(section.id)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionIconContainer,
                      {
                        backgroundColor: isDark
                          ? `${section.color}30`
                          : `${section.color}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={section.icon as any}
                      size={22}
                      color={section.color}
                    />
                  </View>
                  <View style={styles.sectionInfo}>
                    <Text style={styles.sectionHeaderTitle}>
                      {section.title}
                    </Text>
                    <Text style={styles.sectionHeaderDescription}>
                      {section.description}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.sectionItems}>
                    {section.items.map((item, i) => (
                      <View key={i} style={styles.sectionItem}>
                        <Text style={styles.sectionItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={isDark ? theme.colors.text : "white"}
            />
            <Text style={styles.backButtonText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
