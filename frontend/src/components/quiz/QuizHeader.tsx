"use client";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

interface QuizHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  hearts: number;
  streak: number;
  progressAnimation: any;
  heartAnimation: any;
  streakAnimation: any;
}

export default function QuizHeader({
  currentQuestionIndex,
  totalQuestions,
  hearts,
  streak,
  progressAnimation,
  heartAnimation,
  streakAnimation,
}: QuizHeaderProps) {
  const router = useRouter();

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressAnimation.value, [0, 1], [0, 100])}%`,
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartAnimation.value }],
  }));

  const streakStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakAnimation.value }],
  }));

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, progressStyle]} />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Animated.View style={[styles.heartContainer, heartStyle]}>
            {[...Array(3)].map((_, index) => (
              <Ionicons
                key={index}
                name="heart"
                size={20}
                color={index < hearts ? "#EF4444" : "#E5E7EB"}
                style={styles.heart}
              />
            ))}
          </Animated.View>

          <Animated.View style={[styles.streakContainer, streakStyle]}>
            <Ionicons name="flame" size={16} color="#D97706" />
            <Text style={styles.streakText}>{streak}</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8FAFF",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#10B981",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  heartContainer: {
    flexDirection: "row",
    marginRight: 16,
  },
  heart: {
    marginLeft: 4,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D97706",
    marginLeft: 4,
  },
});