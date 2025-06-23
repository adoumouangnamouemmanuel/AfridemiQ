"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Use the provided hooks
import { useQuiz } from "../../../src/hooks/assessment/useQuiz";
import { useCreateQuizResult } from "../../../src/hooks/assessment/useQuizResult";
import { useUser } from "../../../src/utils/UserContext";
import type { Question } from "../../../src/types/assessment/question.types";
import type {
  CreateQuizResultData,
  QuizAnswer,
  CreateQuizAnswer,
} from "../../../src/types/assessment/quiz.result.types";

interface QuizHeaderProps {
  hearts: number;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  streak: number;
}

function QuizHeader({
  hearts,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  streak,
}: QuizHeaderProps) {
  const router = useRouter();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Exit Quiz",
              "Are you sure you want to exit? Your progress will be lost.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Exit",
                  style: "destructive",
                  onPress: () => router.back(),
                },
              ]
            );
          }}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={20} color="#374151" />
        </TouchableOpacity>

        <View style={styles.heartsContainer}>
          {[...Array(3)].map((_, index) => (
            <Ionicons
              key={index}
              name={index < hearts ? "heart" : "heart-outline"}
              size={24}
              color={index < hearts ? "#EF4444" : "#D1D5DB"}
            />
          ))}
        </View>

        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={16} color="#3B82F6" />
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressTopRow}>
          <Text style={styles.questionCounter}>
            Question {currentQuestion} of {totalQuestions}
          </Text>
          {streak > 0 && (
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={14} color="#F59E0B" />
              <Text style={styles.streakText}>{streak} streak</Text>
            </View>
          )}
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
      </View>
    </View>
  );
}

export default function QuizScreen() {
  // FIXED: ALL HOOKS DECLARED FIRST - BEFORE ANY CONDITIONALS
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const { user, updateUserProgress } = useUser();

  // Use provided hooks - MUST be called unconditionally
  const { quiz, isLoading: quizLoading, error: quizError } = useQuiz(quizId);
  const { createQuizResult, isCreating } = useCreateQuizResult();

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // FIXED: Use useRef to prevent recreation and stable references
  const startedAt = useRef(new Date());
  const questionStartTime = useRef(new Date());

  // FIXED: Memoize userId to prevent re-calculation on every render
  const userId = useMemo(() => {
    return user?.id || (user as any)?._id || user?.email;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, (user as any)?._id, user?.email]);

  // FIXED: Memoize current question to prevent unnecessary recalculations
  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

  // FIXED: Only log once when user changes, not on every render
  useEffect(() => {
    console.log("🎯 QuizScreen - User Debug:", {
      userObject: user,
      userId,
      hasId: !!user?.id,
      has_id: !!(user as any)?._id,
      email: user?.email,
    });
  }, [userId]);

  // FIXED: Stable handleQuizComplete with proper user ID handling
  const handleQuizComplete = useCallback(async () => {
    if (
      !quiz ||
      !userId ||
      !isQuizStarted ||
      questions.length === 0 ||
      isCompleting
    ) {
      console.log("❌ Cannot complete quiz:", {
        hasQuiz: !!quiz,
        userId,
        isStarted: isQuizStarted,
        questionsCount: questions.length,
        isCompleting,
      });
      return;
    }

    setIsCompleting(true);

    try {
      const completedAt = new Date();
      const correctAnswers = answers.filter(
        (answer) => answer.isCorrect
      ).length;
      const incorrectAnswers = answers.length - correctAnswers;
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      const totalTimeSpent = Math.floor(
        (completedAt.getTime() - startedAt.current.getTime()) / 1000
      );

      console.log("🎯 Completing quiz:", {
        correctAnswers,
        totalQuestions: questions.length,
        finalScore,
        totalTimeSpent,
        userId,
      });

      // Submit to backend if we have a proper user ID
      if (userId && userId !== user?.email) {
        try {
          const quizResultData: CreateQuizResultData = {
            userId,
            quizId: quiz._id,
            score: finalScore,
            totalQuestions: questions.length,
            correctAnswers,
            incorrectAnswers,
            totalTimeSpent,
            startedAt: startedAt.current,
            completedAt,
            answers: answers.map(
              (answer): CreateQuizAnswer => ({
                questionId:
                  typeof answer.questionId === "string"
                    ? answer.questionId
                    : answer.questionId?._id ||
                      answer.questionId?.toString() ||
                      "",
                selectedAnswer: String(answer.selectedAnswer),
                correctAnswer: String(answer.correctAnswer),
                isCorrect: answer.isCorrect,
                timeSpent: answer.timeSpent,
              })
            ),
            isPassed: finalScore >= (quiz.passingScore || 60),
            submissionMethod:
              timeRemaining === 0 ? "time_expired" : "submitted",
          };

          console.log("📤 Submitting quiz result:", quizResultData);
          const result = await createQuizResult(quizResultData);
          console.log("✅ Quiz result submitted:", result);

          // FIXED: Update user progress after successful submission
          await updateUserProgress({
            score: finalScore,
            totalQuestions: questions.length,
            correctAnswers,
          });
        } catch (error) {
          console.error("❌ Error submitting quiz:", error);
        }
      } else {
        console.warn("⚠️ Using email as user ID, skipping backend submission");

        // FIXED: Still update progress even if backend submission is skipped
        await updateUserProgress({
          score: finalScore,
          totalQuestions: questions.length,
          correctAnswers,
        });
      }

      // Navigate to results screen
      router.push({
        pathname: "/(routes)/assessments/results",
        params: {
          score: finalScore.toString(),
          correctAnswers: correctAnswers.toString(),
          totalQuestions: questions.length.toString(),
          timeSpent: totalTimeSpent.toString(),
          hearts: hearts.toString(),
          streak: streak.toString(),
        },
      });
    } catch (error) {
      console.error("❌ Error completing quiz:", error);

      // Still navigate to results even if submission fails
      const correctAnswers = answers.filter(
        (answer) => answer.isCorrect
      ).length;
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      const totalTimeSpent = Math.floor(
        (new Date().getTime() - startedAt.current.getTime()) / 1000
      );

      // FIXED: Update progress even on error (local progress)
      try {
        await updateUserProgress({
          score: finalScore,
          totalQuestions: questions.length,
          correctAnswers,
        });
      } catch (progressError) {
        console.error("❌ Error updating progress:", progressError);
      }

      router.push({
        pathname: "/(routes)/assessments/results",
        params: {
          score: finalScore.toString(),
          correctAnswers: correctAnswers.toString(),
          totalQuestions: questions.length.toString(),
          timeSpent: totalTimeSpent.toString(),
          hearts: hearts.toString(),
          streak: streak.toString(),
        },
      });
    } finally {
      setIsCompleting(false);
    }
  }, [
    quiz,
    userId,
    isQuizStarted,
    questions.length,
    answers,
    timeRemaining,
    hearts,
    streak,
    createQuizResult,
    router,
    isCompleting,
    user?.email,
    updateUserProgress, // Add this dependency
  ]);

  // FIXED: Initialize quiz data only once when quiz loads
  useEffect(() => {
    if (!quiz || isQuizStarted) return;

    console.log("🎯 Initializing quiz:", quiz.title);

    // Set timer
    const totalTimeSeconds = quiz.timeLimit * 60;
    setTimeRemaining(totalTimeSeconds);

    // Create mock questions - FIXED: Ensure proper string IDs
    const mockQuestions: Question[] = Array.from(
      { length: quiz.totalQuestions },
      (_, index) => {
        const questionId = quiz.questionIds[index];
        const id =
          typeof questionId === "string"
            ? questionId
            : questionId?._id || questionId?.toString() || `question_${index}`;

        return {
          _id: id,
          question: `Question ${index + 1}: Soit f(x) = ${index + 1}x² - ${
            index + 2
          }x + ${index + 1}. Quelle est la dérivée de f(x)?`,
          type: "multiple_choice",
          options: [
            `f'(x) = ${2 * (index + 1)}x - ${index + 2}`,
            `f'(x) = ${index + 1}x² - ${index + 2}`,
            `f'(x) = ${index + 1}x - ${index + 2}`,
            `f'(x) = ${2 * (index + 1)}x + ${index + 2}`,
          ],
          correctAnswer: `f'(x) = ${2 * (index + 1)}x - ${index + 2}`,
          explanation: `Pour une fonction f(x) = ax² + bx + c, la dérivée est f'(x) = 2ax + b.`,
          subjectId: quiz.subjectId,
          difficulty: "medium",
          educationLevel: quiz.educationLevel,
          tags: ["dérivée", "fonction_polynôme"],
          stats: {
            totalAttempts: 0,
            correctAttempts: 0,
            averageTimeSpent: 0,
          },
          status: "active",
          isActive: true,
          isPremium: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    );

    setQuestions(mockQuestions);

    // Initialize answers array - FIXED: Use string IDs
    const initialAnswers: QuizAnswer[] = mockQuestions.map((question) => ({
      questionId: question._id,
      selectedAnswer: "",
      correctAnswer: "",
      isCorrect: false,
      timeSpent: 0,
    }));

    setAnswers(initialAnswers);
    questionStartTime.current = new Date();
    setIsQuizStarted(true);

    console.log("🎯 Quiz initialized:", {
      questionsCount: mockQuestions.length,
      timeLimit: totalTimeSeconds,
      answersCount: initialAnswers.length,
    });
  }, [quiz, isQuizStarted]);

  // FIXED: Timer effect with proper dependencies and no infinite loops
  useEffect(() => {
    if (
      !isQuizStarted ||
      timeRemaining <= 0 ||
      showFeedback ||
      quizLoading ||
      isCompleting
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          console.log("⏰ Time expired, completing quiz");
          // Use setTimeout to avoid calling handleQuizComplete during render
          setTimeout(() => handleQuizComplete(), 0);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    timeRemaining,
    isQuizStarted,
    showFeedback,
    quizLoading,
    isCompleting,
    handleQuizComplete,
  ]);

  // FIXED: Memoized option handlers to prevent recreation on every render
  const handleOptionSelect = useCallback(
    (optionIndex: number) => {
      if (showFeedback || !currentQuestion) return;

      setSelectedOption(optionIndex);

      setTimeout(() => {
        const selectedAnswer = currentQuestion.options?.[optionIndex] || "";
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        // Calculate time spent on this question
        const timeSpent = Math.floor(
          (new Date().getTime() - questionStartTime.current.getTime()) / 1000
        );

        // Update answers array
        setAnswers((prevAnswers) => {
          const newAnswers = [...prevAnswers];
          newAnswers[currentQuestionIndex] = {
            questionId: currentQuestion._id,
            selectedAnswer,
            correctAnswer: currentQuestion.correctAnswer as string,
            isCorrect,
            timeSpent,
          };
          return newAnswers;
        });

        setShowFeedback(true);

        if (isCorrect) {
          setStreak((prev) => prev + 1);
          setScore((prev) => prev + 10);
        } else {
          setHearts((prev) => Math.max(0, prev - 1));
          setStreak(0);

          if (hearts <= 1) {
            setTimeout(() => handleQuizComplete(), 1500);
          }
        }
      }, 200);
    },
    [
      showFeedback,
      currentQuestion,
      currentQuestionIndex,
      hearts,
      handleQuizComplete,
    ]
  );

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      questionStartTime.current = new Date();
    } else {
      handleQuizComplete();
    }
  }, [currentQuestionIndex, questions.length, handleQuizComplete]);

  // FIXED: Memoized utility functions for styling
  const getOptionStyle = useCallback(
    (index: number) => {
      if (selectedOption === index && !showFeedback) {
        return [styles.option, styles.selectedOption];
      } else if (showFeedback && currentQuestion) {
        const selectedAnswer = currentQuestion.options?.[index];
        if (selectedAnswer === currentQuestion.correctAnswer) {
          return [styles.option, styles.correctOption];
        } else if (index === selectedOption) {
          return [styles.option, styles.incorrectOption];
        }
      }
      return styles.option;
    },
    [selectedOption, showFeedback, currentQuestion]
  );

  const getOptionTextStyle = useCallback(
    (index: number) => {
      if (selectedOption === index && !showFeedback) {
        return [styles.optionText, styles.selectedOptionText];
      } else if (showFeedback && currentQuestion) {
        const selectedAnswer = currentQuestion.options?.[index];
        if (selectedAnswer === currentQuestion.correctAnswer) {
          return [styles.optionText, styles.correctOptionText];
        } else if (index === selectedOption) {
          return [styles.optionText, styles.incorrectOptionText];
        }
      }
      return styles.optionText;
    },
    [selectedOption, showFeedback, currentQuestion]
  );

  // FIXED: Memoized computed values
  const selectedAnswer = useMemo(() => {
    return (
      selectedOption !== null && currentQuestion?.options?.[selectedOption]
    );
  }, [selectedOption, currentQuestion?.options]);

  const isCorrect = useMemo(() => {
    return selectedAnswer === currentQuestion?.correctAnswer;
  }, [selectedAnswer, currentQuestion?.correctAnswer]);

  // NOW ALL CONDITIONALS COME AFTER ALL HOOKS

  // Check for user authentication
  if (!user || (!user.id && !(user as any)._id && !user.email)) {
    console.error("❌ No user available:", user);
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <Ionicons name="person-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Authentication Required</Text>
        <Text style={styles.errorMessage}>Please log in to take the quiz</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (quizLoading || isCreating || !isQuizStarted || isCompleting) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>
          {isCreating || isCompleting
            ? "Submitting results..."
            : !isQuizStarted
            ? "Preparing quiz..."
            : "Loading quiz..."}
        </Text>
      </View>
    );
  }

  // Error state
  if (quizError || !quiz || questions.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Unable to load quiz</Text>
        <Text style={styles.errorMessage}>
          {quizError || "Quiz data is not available"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main quiz interface
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <QuizHeader
        hearts={hearts}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        timeRemaining={timeRemaining}
        streak={streak}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.questionNumber}>
              <Text style={styles.questionNumberText}>
                Q{currentQuestionIndex + 1}
              </Text>
            </View>
          </View>
          <Text style={styles.questionText}>{currentQuestion?.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion?.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(index)}
              onPress={() => handleOptionSelect(index)}
              disabled={showFeedback}
            >
              <View style={styles.optionIndicator}>
                <Text style={styles.optionIndicatorText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>

              <Text style={getOptionTextStyle(index)}>{option}</Text>

              {showFeedback &&
                currentQuestion.options?.[index] ===
                  currentQuestion.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                )}
              {showFeedback &&
                index === selectedOption &&
                currentQuestion.options?.[index] !==
                  currentQuestion.correctAnswer && (
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback */}
        {showFeedback && currentQuestion?.explanation && (
          <View style={styles.feedbackContainer}>
            <View
              style={[
                styles.feedbackCard,
                isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
              ]}
            >
              <View style={styles.feedbackHeader}>
                <Ionicons
                  name={isCorrect ? "checkmark-circle" : "close-circle"}
                  size={28}
                  color={isCorrect ? "#10B981" : "#EF4444"}
                />
                <Text
                  style={[
                    styles.feedbackTitle,
                    isCorrect ? styles.correctTitle : styles.incorrectTitle,
                  ]}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </Text>
              </View>
              <Text
                style={[
                  styles.feedbackText,
                  isCorrect ? styles.correctText : styles.incorrectText,
                ]}
              >
                {currentQuestion.explanation}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom + 20, 40) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedOption !== null
              ? styles.enabledButton
              : styles.disabledButton,
          ]}
          onPress={handleNextQuestion}
          disabled={selectedOption === null}
        >
          <Text style={styles.continueButtonText}>
            {currentQuestionIndex === questions.length - 1
              ? "Complete Quiz"
              : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  heartsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    color: "#2563EB",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  questionCounter: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  streakText: {
    color: "#D97706",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  questionNumber: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  questionNumberText: {
    color: "#1D4ED8",
    fontWeight: "600",
    fontSize: 14,
  },
  questionText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 24,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  option: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOption: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  correctOption: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  incorrectOption: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    backgroundColor: "#E5E7EB",
  },
  optionIndicatorText: {
    fontWeight: "bold",
    color: "white",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  selectedOptionText: {
    color: "#1D4ED8",
  },
  correctOptionText: {
    color: "#047857",
  },
  incorrectOptionText: {
    color: "#DC2626",
  },
  feedbackContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  correctFeedback: {
    backgroundColor: "#ECFDF5",
    borderColor: "#D1FAE5",
  },
  incorrectFeedback: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  feedbackTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "bold",
  },
  correctTitle: {
    color: "#047857",
  },
  incorrectTitle: {
    color: "#DC2626",
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
  },
  correctText: {
    color: "#047857",
  },
  incorrectText: {
    color: "#DC2626",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  continueButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  enabledButton: {
    backgroundColor: "#3B82F6",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
