"use client";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/ThemeContext";

interface PastPaperCardProps {
  paper: {
    id: string;
    title: string;
    exam: string;
    year: number;
    session?: string;
    paper?: string;
    subjects: string[];
    duration: number;
    questions: number;
    difficulty: string;
    avgScore: number;
    totalAttempts: number;
    tags: string[];
    releaseDate: string;
  };
  onPress: () => void;
}

export default function PastPaperCard({ paper, onPress }: PastPaperCardProps) {
  const { theme, isDark } = useTheme();

  const getDifficultyColor = () => {
    switch (paper.difficulty) {
      case "Easy":
        return "#4CAF50";
      case "Medium":
        return "#FF9800";
      case "Hard":
        return "#F44336";
      case "Very Hard":
        return "#9C27B0";
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Latest":
        return "#4CAF50";
      case "Popular":
        return "#FF9800";
      case "Official":
        return "#2196F3";
      case "Advanced":
        return "#9C27B0";
      default:
        return theme.colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginRight: 12,
      width: 300,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    titleSection: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      marginBottom: 4,
      lineHeight: 22,
    },
    examInfo: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
      marginBottom: 8,
    },
    tags: {
      flexDirection: "row",
      gap: 6,
      marginBottom: 12,
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    tagText: {
      fontSize: 11,
      fontWeight: "600",
      color: "white",
      fontFamily: "Inter-SemiBold",
    },
    subjects: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginBottom: 12,
    },
    subject: {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    subjectText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
    },
    stats: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    difficulty: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: getDifficultyColor() + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    difficultyDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: getDifficultyColor(),
      marginRight: 6,
    },
    difficultyText: {
      fontSize: 12,
      fontWeight: "600",
      color: getDifficultyColor(),
      fontFamily: "Inter-SemiBold",
    },
    attempts: {
      flexDirection: "row",
      alignItems: "center",
    },
    attemptsText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginLeft: 4,
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{paper.title}</Text>
          <Text style={styles.examInfo}>
            {paper.exam} • {paper.year}
            {paper.session && ` • ${paper.session}`}
            {paper.paper && ` • ${paper.paper}`}
          </Text>
        </View>
      </View>

      <View style={styles.tags}>
        {paper.tags.slice(0, 2).map((tag) => (
          <View
            key={tag}
            style={[styles.tag, { backgroundColor: getTagColor(tag) }]}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.subjects}>
        {paper.subjects.map((subject) => (
          <View key={subject} style={styles.subject}>
            <Text style={styles.subjectText}>{subject}</Text>
          </View>
        ))}
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{paper.questions}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{paper.duration}m</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{paper.avgScore}%</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.difficulty}>
          <View style={styles.difficultyDot} />
          <Text style={styles.difficultyText}>{paper.difficulty}</Text>
        </View>
        <View style={styles.attempts}>
          <Ionicons
            name="people"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.attemptsText}>
            {paper.totalAttempts.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
