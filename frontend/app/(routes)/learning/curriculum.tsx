"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";

// Mock curriculum data based on curriculum.model
const CURRICULUM_DATA = {
  _id: "curriculum_001",
  country: "Cameroon",
  educationLevel: "secondary",
  series: ["D"],
  subjects: [
    {
      _id: "math_001",
      name: "Mathematics",
      color: "#3B82F6",
      icon: "calculator",
      totalTopics: 12,
      completedTopics: 8,
      estimatedHours: 120,
      progress: 67,
    },
    {
      _id: "physics_001",
      name: "Physics",
      color: "#10B981",
      icon: "planet",
      totalTopics: 10,
      completedTopics: 5,
      estimatedHours: 100,
      progress: 50,
    },
    {
      _id: "chemistry_001",
      name: "Chemistry",
      color: "#F59E0B",
      icon: "flask",
      totalTopics: 8,
      completedTopics: 3,
      estimatedHours: 90,
      progress: 38,
    },
    {
      _id: "biology_001",
      name: "Biology",
      color: "#EF4444",
      icon: "leaf",
      totalTopics: 9,
      completedTopics: 2,
      estimatedHours: 85,
      progress: 22,
    },
  ],
  academicYear: {
    startDate: new Date("2024-09-01"),
    endDate: new Date("2025-06-30"),
    terms: [
      {
        term: 1,
        startDate: new Date("2024-09-01"),
        endDate: new Date("2024-12-15"),
        holidays: [
          {
            name: "Mid-term Break",
            startDate: new Date("2024-10-15"),
            endDate: new Date("2024-10-22"),
          },
        ],
      },
      {
        term: 2,
        startDate: new Date("2025-01-08"),
        endDate: new Date("2025-04-15"),
        holidays: [
          {
            name: "Spring Break",
            startDate: new Date("2025-03-01"),
            endDate: new Date("2025-03-08"),
          },
        ],
      },
      {
        term: 3,
        startDate: new Date("2025-04-22"),
        endDate: new Date("2025-06-30"),
        holidays: [],
      },
    ],
  },
  analytics: {
    enrollmentCount: 15420,
    activeUsers: 8930,
    completionRate: 67,
  },
  metadata: {
    version: 2,
    status: "active",
    approvedAt: new Date("2024-08-15"),
  },
};

export default function CurriculumScreen() {
  const router = useRouter();
  const [selectedTerm, setSelectedTerm] = useState(1);

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  const getCurrentTerm = () => {
    const now = new Date();
    return (
      CURRICULUM_DATA.academicYear.terms.find(
        (term) => now >= term.startDate && now <= term.endDate
      ) || CURRICULUM_DATA.academicYear.terms[0]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getOverallProgress = () => {
    const totalTopics = CURRICULUM_DATA.subjects.reduce(
      (sum, subject) => sum + subject.totalTopics,
      0
    );
    const completedTopics = CURRICULUM_DATA.subjects.reduce(
      (sum, subject) => sum + subject.completedTopics,
      0
    );
    return Math.round((completedTopics / totalTopics) * 100);
  };

  const renderSubjectCard = ({
    item: subject,
  }: {
    item: (typeof CURRICULUM_DATA.subjects)[0];
  }) => {
    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <TouchableOpacity
          style={styles.subjectCard}
          onPress={() =>
            router.push(
              `/(routes)/learning/topics?subjectId=${subject._id}&subjectName=${subject.name}`
            )
          }
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[subject.color + "15", subject.color + "05"]}
            style={styles.subjectCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.subjectHeader}>
              <View
                style={[
                  styles.subjectIcon,
                  { backgroundColor: subject.color + "20" },
                ]}
              >
                <Ionicons
                  name={subject.icon as any}
                  size={24}
                  color={subject.color}
                />
              </View>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectProgress}>
                  {subject.completedTopics}/{subject.totalTopics} topics
                  completed
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${subject.progress}%`,
                      backgroundColor: subject.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{subject.progress}%</Text>
            </View>

            <View style={styles.subjectFooter}>
              <View style={styles.subjectStat}>
                <Ionicons name="time" size={14} color="#6B7280" />
                <Text style={styles.subjectStatText}>
                  {subject.estimatedHours}h
                </Text>
              </View>
              <TouchableOpacity style={styles.continueButton}>
                <Text
                  style={[styles.continueButtonText, { color: subject.color }]}
                >
                  Continue
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={subject.color}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTermCard = (
    term: (typeof CURRICULUM_DATA.academicYear.terms)[0]
  ) => {
    const isActive = selectedTerm === term.term;
    const isCurrent = getCurrentTerm()?.term === term.term;
    const daysRemaining = getDaysRemaining(term.endDate);

    return (
      <TouchableOpacity
        key={term.term}
        style={[styles.termCard, isActive && styles.activeTermCard]}
        onPress={() => setSelectedTerm(term.term)}
      >
        <View style={styles.termHeader}>
          <Text style={[styles.termTitle, isActive && styles.activeTermTitle]}>
            Term {term.term}
          </Text>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>

        <Text style={styles.termDates}>
          {formatDate(term.startDate)} - {formatDate(term.endDate)}
        </Text>

        {isCurrent && (
          <Text style={styles.daysRemaining}>
            {daysRemaining} days remaining
          </Text>
        )}

        {term.holidays.length > 0 && (
          <View style={styles.holidaysInfo}>
            <Ionicons name="calendar" size={12} color="#6B7280" />
            <Text style={styles.holidaysText}>
              {term.holidays.length} holiday(s)
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const selectedTermData = CURRICULUM_DATA.academicYear.terms.find(
    (term) => term.term === selectedTerm
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      marginRight: 16,
      padding: 8,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: "#1E293B",
      fontFamily: "Inter-ExtraBold",
    },
    subtitle: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    curriculumInfo: {
      backgroundColor: "#fff",
      borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginTop: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    curriculumTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    curriculumMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 0,
    },
    metaItem: {
      alignItems: "center",
    },
    metaValue: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    metaLabel: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    overallProgress: {
      marginTop: 12,
    },
    overallProgressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    overallProgressLabel: {
      fontSize: 14,
      color: "#374151",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    overallProgressPercentage: {
      fontSize: 14,
      fontWeight: "700",
      color: "#3B82F6",
      fontFamily: "Inter-Bold",
    },
    overallProgressBar: {
      height: 8,
      backgroundColor: "#E5E7EB",
      borderRadius: 4,
      overflow: "hidden",
    },
    overallProgressFill: {
      height: "100%",
      backgroundColor: "#3B82F6",
      borderRadius: 4,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    academicYearSection: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 0,
    },
    academicYearHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    academicYearTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
    },
    academicYearDates: {
      fontSize: 14,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    termsContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 20,
    },
    termCard: {
      flex: 1,
      backgroundColor: "#F8FAFC",
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    activeTermCard: {
      backgroundColor: "#EBF8FF",
      borderColor: "#3B82F6",
    },
    termHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 5,
    },
    termTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: "#374151",
      fontFamily: "Inter-SemiBold",
    },
    activeTermTitle: {
      color: "#1E293B",
    },
    currentBadge: {
      backgroundColor: "#10B981",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    currentBadgeText: {
      fontSize: 8,
      color: "white",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    termDates: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
      marginBottom: 4,
    },
    daysRemaining: {
      fontSize: 10,
      color: "#3B82F6",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
      marginBottom: 4,
    },
    holidaysInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    holidaysText: {
      fontSize: 11,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    termDetails: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    termDetailsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 12,
    },
    holidayItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },
    holidayIcon: {
      marginRight: 12,
    },
    holidayInfo: {
      flex: 1,
    },
    holidayName: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
    },
    holidayDates: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    subjectsSection: {
      marginBottom: 20,
    },
    subjectCard: {
      marginBottom: 16,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    subjectCardGradient: {
      padding: 20,
      backgroundColor: "white",
    },
    subjectHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    subjectIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    subjectInfo: {
      flex: 1,
    },
    subjectName: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    subjectProgress: {
      fontSize: 14,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 12,
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: "#E5E7EB",
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#374151",
      fontFamily: "Inter-SemiBold",
    },
    subjectFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    subjectStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    subjectStatText: {
      fontSize: 12,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
    },
    continueButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: "#F8FAFC",
      borderRadius: 12,
    },
    continueButtonText: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    analyticsSection: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    analyticsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    analyticsItem: {
      alignItems: "center",
    },
    analyticsValue: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    analyticsLabel: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748B" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Curriculum</Text>
            <Text style={styles.subtitle}>
              {CURRICULUM_DATA.country} • {CURRICULUM_DATA.educationLevel} •
              Series {CURRICULUM_DATA.series.join(", ")}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.curriculumInfo}>
          <Text style={styles.curriculumTitle}>
            Academic Year{" "}
            {formatDate(CURRICULUM_DATA.academicYear.startDate).split(",")[1]} -{" "}
            {formatDate(CURRICULUM_DATA.academicYear.endDate).split(",")[1]}
          </Text>

          <View style={styles.curriculumMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>
                {CURRICULUM_DATA.subjects.length}
              </Text>
              <Text style={styles.metaLabel}>Subjects</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>
                {CURRICULUM_DATA.academicYear.terms.length}
              </Text>
              <Text style={styles.metaLabel}>Terms</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>
                {CURRICULUM_DATA.analytics.enrollmentCount.toLocaleString()}
              </Text>
              <Text style={styles.metaLabel}>Students</Text>
            </View>
          </View>

          <View style={styles.overallProgress}>
            <View style={styles.overallProgressHeader}>
              <Text style={styles.overallProgressLabel}>Overall Progress</Text>
              <Text style={styles.overallProgressPercentage}>
                {getOverallProgress()}%
              </Text>
            </View>
            <View style={styles.overallProgressBar}>
              <View
                style={[
                  styles.overallProgressFill,
                  { width: `${getOverallProgress()}%` },
                ]}
              />
            </View>
          </View>
        </View>
        <View style={styles.scrollContent}>
          <View style={styles.academicYearSection}>
            <View style={styles.academicYearHeader}>
              <Text style={styles.sectionTitle}>Academic Calendar</Text>
              <Text style={styles.academicYearDates}>
                {formatDate(CURRICULUM_DATA.academicYear.startDate)} -{" "}
                {formatDate(CURRICULUM_DATA.academicYear.endDate)}
              </Text>
            </View>

            <View style={styles.termsContainer}>
              {CURRICULUM_DATA.academicYear.terms.map(renderTermCard)}
            </View>

            {selectedTermData && (
              <View style={styles.termDetails}>
                <Text style={styles.termDetailsTitle}>
                  Term {selectedTerm} Details
                </Text>
                {selectedTermData.holidays.length > 0 ? (
                  selectedTermData.holidays.map((holiday, index) => (
                    <View key={index} style={styles.holidayItem}>
                      <Ionicons
                        name="calendar"
                        size={20}
                        color="#F59E0B"
                        style={styles.holidayIcon}
                      />
                      <View style={styles.holidayInfo}>
                        <Text style={styles.holidayName}>{holiday.name}</Text>
                        <Text style={styles.holidayDates}>
                          {formatDate(holiday.startDate)} -{" "}
                          {formatDate(holiday.endDate)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.holidayDates}>
                    No holidays scheduled for this term
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.subjectsSection}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <FlatList
              data={CURRICULUM_DATA.subjects}
              renderItem={renderSubjectCard}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>

          <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Analytics</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {CURRICULUM_DATA.analytics.enrollmentCount.toLocaleString()}
                </Text>
                <Text style={styles.analyticsLabel}>Total Students</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {CURRICULUM_DATA.analytics.activeUsers.toLocaleString()}
                </Text>
                <Text style={styles.analyticsLabel}>Active Users</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>
                  {CURRICULUM_DATA.analytics.completionRate}%
                </Text>
                <Text style={styles.analyticsLabel}>Completion Rate</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}