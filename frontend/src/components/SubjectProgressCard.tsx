"use client";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../utils/ThemeContext";

interface SubjectProgressCardProps {
  subject: {
    id: string;
    name: string;
    color: string;
    icon: string;
    description?: string;
  };
  progress: number;
  totalTopics: number;
  completedTopics: number;
  isWeak?: boolean;
  priority?: "high" | "medium" | "low";
  lastStudied?: string | null;
  avgScore?: number;
  onPress: () => void;
  onQuickStudy?: (mode: string) => void;
}

export default function SubjectProgressCard({
  subject,
  progress,
  totalTopics,
  completedTopics,
  isWeak = false,
  priority = "medium",
  lastStudied,
  avgScore = 0,
  onPress,
  onQuickStudy,
}: SubjectProgressCardProps) {
  const { theme, isDark } = useTheme();

  const getLastStudiedText = () => {
    if (!lastStudied) return "Never studied";
    return `Last studied ${lastStudied}`;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isWeak
        ? "#FF6B6B"
        : priority === "high"
        ? "#FF9800"
        : theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    subjectInfo: {
      flex: 1,
    },
    subjectName: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      marginBottom: 2,
    },
    subjectMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
    },
    badge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      alignItems: "center",
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    priorityBadge: {
      backgroundColor: isDark ? "rgba(255,152,0,0.2)" : "rgba(255,152,0,0.1)",
    },
    priorityBadgeText: {
      color: "#FF9800",
    },
    weakBadge: {
      backgroundColor: isDark
        ? "rgba(255,107,107,0.2)"
        : "rgba(255,107,107,0.1)",
    },
    weakBadgeText: {
      color: "#FF6B6B",
    },
    progressSection: {
      marginBottom: 12,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    progressText: {
      fontSize: 13,
      color: theme.colors.text,
      fontFamily: "Inter-Medium",
    },
    progressPercentage: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.primary,
      fontFamily: "Inter-Bold",
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerLeft: {
      flex: 1,
    },
    lastStudied: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
    },
    avgScore: {
      fontSize: 11,
      color:
        avgScore >= 70 ? "#4CAF50" : avgScore >= 50 ? "#FF9800" : "#FF6B6B",
      fontFamily: "Inter-Medium",
      marginTop: 2,
    },
    quickActions: {
      flexDirection: "row",
      gap: 6,
    },
    quickActionButton: {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      borderRadius: 8,
      padding: 6,
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={[subject.color, subject.color + "80"]}
          style={styles.iconContainer}
        >
          <Ionicons name={subject.icon as any} size={20} color="white" />
        </LinearGradient>

        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <View style={styles.subjectMeta}>
            <Text style={styles.metaText}>
              {completedTopics}/{totalTopics} topics
            </Text>
            {priority === "high" && (
              <View style={[styles.badge, styles.priorityBadge]}>
                <Text style={[styles.badgeText, styles.priorityBadgeText]}>
                  Priority
                </Text>
              </View>
            )}
            {isWeak && (
              <View style={[styles.badge, styles.weakBadge]}>
                <Text style={[styles.badgeText, styles.weakBadgeText]}>
                  Weak
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Progress</Text>
          <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        </View>

        <View style={styles.progressBar}>
          <LinearGradient
            colors={[subject.color, subject.color + "80"]}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.lastStudied}>{getLastStudiedText()}</Text>
          {avgScore > 0 && (
            <Text style={styles.avgScore}>
              Avg Score: {Math.round(avgScore)}%
            </Text>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => onQuickStudy?.("flashcards")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="card"
              size={14}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => onQuickStudy?.("practice")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="create"
              size={14}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => onQuickStudy?.("notes")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="book"
              size={14}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
