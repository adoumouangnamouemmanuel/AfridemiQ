"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../utils/ThemeContext";
import { useUser } from "../utils/UserContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from "react-native-reanimated";
import QuestionCard from "../components/QuestionCard";
import TimerBar from "../components/TimerBar";
import questionsData from "../data/questions.json";

const { width } = Dimensions.get("window");

export default function QuizScreen() {
  const { theme } = useTheme();
  const { user, addXP, incrementStreak } = useUser();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const questions = questionsData.slice(0, 10); // Get 10 questions for the quiz
  const currentQuestion = questions[currentQuestionIndex];
  const progress = useSharedValue(0);
  const questionScale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming((currentQuestionIndex + 1) / questions.length);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, isSubmitted]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [theme.colors.error, theme.colors.warning, theme.colors.success]
    ),
  }));

  const animatedQuestionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: questionScale.value }],
  }));

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (selectedAnswers[currentQuestionIndex] === undefined) {
      Alert.alert(
        "Please select an answer",
        "You must select an answer before proceeding."
      );
      return;
    }

    questionScale.value = withSpring(0.8, {}, () => {
      questionScale.value = withSpring(1);
      if (currentQuestionIndex < questions.length - 1) {
        runOnJS(setCurrentQuestionIndex)(currentQuestionIndex + 1);
      } else {
        runOnJS(handleSubmitQuiz)();
      }
    });
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      questionScale.value = withSpring(0.8, {}, () => {
        questionScale.value = withSpring(1);
        runOnJS(setCurrentQuestionIndex)(currentQuestionIndex - 1);
      });
    }
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    setShowResult(true);

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const xpEarned = correctAnswers * 10;

    addXP(xpEarned);
    if (score >= 70) {
      incrementStreak();
    }

    // Navigate to results with quiz data
    router.replace({
      pathname: "/(routes)/results",
      params: {
        score: score.toString(),
        correctAnswers: correctAnswers.toString(),
        totalQuestions: questions.length.toString(),
        xpEarned: xpEarned.toString(),
        timeSpent: (900 - timeLeft).toString(),
      },
    });
  };

  const handleQuitQuiz = () => {
    Alert.alert(
      "Quit Quiz",
      "Are you sure you want to quit? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Quit", style: "destructive", onPress: () => router.back() },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    quitButton: {
      padding: theme.spacing.sm,
    },
    questionCounter: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },
    progressContainer: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: theme.spacing.md,
    },
    progressBar: {
      height: "100%",
      borderRadius: 4,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    navigation: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
    },
    navButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      minWidth: 100,
      alignItems: "center",
    },
    navButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    navButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    navButtonTextDisabled: {
      color: theme.colors.textSecondary,
    },
    submitButton: {
      backgroundColor: theme.colors.success,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    submitButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
    },
    questionInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    questionInfoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    pointsText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.quitButton} onPress={handleQuitQuiz}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.questionCounter}>
            {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
        </View>

        <TimerBar duration={900} timeLeft={timeLeft} />
      </View>

      <View style={styles.content}>
        <View style={styles.questionInfo}>
          <Text style={styles.questionInfoText}>
            Difficulty: {currentQuestion.difficulty}
          </Text>
          <Text style={styles.pointsText}>+{currentQuestion.points} XP</Text>
        </View>

        <Animated.View style={animatedQuestionStyle}>
          <QuestionCard
            question={currentQuestion.question}
            options={currentQuestion.options}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            onSelectAnswer={handleSelectAnswer}
          />
        </Animated.View>
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitQuiz}
          >
            <Text style={styles.submitButtonText}>Submit Quiz</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.navButton,
              selectedAnswers[currentQuestionIndex] === undefined &&
                styles.navButtonDisabled,
            ]}
            onPress={handleNextQuestion}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
          >
            <Text
              style={[
                styles.navButtonText,
                selectedAnswers[currentQuestionIndex] === undefined &&
                  styles.navButtonTextDisabled,
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
