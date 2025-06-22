"use client";

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock data based on the models
const mockQuiz = {
  id: "1",
  title: "Mathematics Quiz",
  description: "Test your algebra skills",
  timeLimit: 900, // 15 minutes in seconds
  totalQuestions: 5,
  questions: [
    {
      id: "1",
      question: "What is the value of x in the equation 2x + 5 = 13?",
      format: "multiple_choice",
      options: ["x = 3", "x = 4", "x = 5", "x = 6"],
      correctAnswer: "x = 4",
      explanation:
        "To solve 2x + 5 = 13, subtract 5 from both sides: 2x = 8, then divide by 2: x = 4",
      points: 10,
      difficulty: "medium",
      hints: [
        "Start by isolating the term with x",
        "Subtract 5 from both sides of the equation",
        "Divide both sides by the coefficient of x",
      ],
    },
    {
      id: "2",
      question: "What is the derivative of x²?",
      format: "multiple_choice",
      options: ["x", "2x", "x²", "2x²"],
      correctAnswer: "2x",
      explanation: "The derivative of x² is 2x using the power rule",
      points: 10,
      difficulty: "easy",
      hints: [
        "Use the power rule for derivatives",
        "Bring down the exponent and subtract 1 from it",
      ],
    },
    {
      id: "3",
      question: "Solve for y: 3y - 7 = 14",
      format: "multiple_choice",
      options: ["y = 5", "y = 7", "y = 9", "y = 11"],
      correctAnswer: "y = 7",
      explanation: "Add 7 to both sides: 3y = 21, then divide by 3: y = 7",
      points: 10,
      difficulty: "easy",
      hints: [
        "Add 7 to both sides first",
        "Then divide by the coefficient of y",
      ],
    },
    {
      id: "4",
      question: "What is the area of a circle with radius 5?",
      format: "multiple_choice",
      options: ["25π", "10π", "5π", "15π"],
      correctAnswer: "25π",
      explanation: "Area = πr² = π(5)² = 25π",
      points: 15,
      difficulty: "medium",
      hints: ["Use the formula A = πr²", "Square the radius first"],
    },
    {
      id: "5",
      question: "Factor: x² - 9",
      format: "multiple_choice",
      options: ["(x-3)(x-3)", "(x+3)(x+3)", "(x-3)(x+3)", "Cannot be factored"],
      correctAnswer: "(x-3)(x+3)",
      explanation:
        "This is a difference of squares: x² - 9 = x² - 3² = (x-3)(x+3)",
      points: 15,
      difficulty: "hard",
      hints: [
        "This is a difference of squares pattern",
        "Use the formula a² - b² = (a-b)(a+b)",
      ],
    },
  ],
};

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
          onPress={() => router.back()}
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

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  onHintPress: () => void;
}

function QuestionCard({
  question,
  questionNumber,
  onHintPress,
}: QuestionCardProps) {
  return (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.questionNumber}>
          <Text style={styles.questionNumberText}>Q{questionNumber}</Text>
        </View>
        <TouchableOpacity onPress={onHintPress} style={styles.hintButton}>
          <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
        </TouchableOpacity>
      </View>
      <Text style={styles.questionText}>{question}</Text>
    </View>
  );
}

interface HintModalProps {
  visible: boolean;
  hints: string[];
  currentHint: number;
  onNextHint: () => void;
  onClose: () => void;
}

function HintModal({
  visible,
  hints,
  currentHint,
  onNextHint,
  onClose,
}: HintModalProps) {
  if (!visible) return null;

  const isLastHint = currentHint >= hints.length - 1;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>💡 Hint</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <Text style={styles.modalText}>{hints[currentHint]}</Text>

        <View style={styles.modalButtons}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.modalButton, styles.modalCloseButton]}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>

          {!isLastHint && (
            <TouchableOpacity
              onPress={onNextHint}
              style={[styles.modalButton, styles.modalNextButton]}
            >
              <Text style={styles.modalNextButtonText}>Next Hint</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.hintCounter}>
          Hint {currentHint + 1} of {hints.length}
        </Text>
      </View>
    </View>
  );
}

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(mockQuiz.timeLimit);
  const [showHintModal, setShowHintModal] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [score, setScore] = useState(0);

  const currentQuestion = mockQuiz.questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      handleQuizComplete();
    }
  }, [timeRemaining]);

  // Initialize answers array
  useEffect(() => {
    setAnswers(Array(mockQuiz.questions.length).fill(null));
  }, []);

  const handleOptionSelect = (optionIndex: number) => {
    if (showFeedback) return;

    setSelectedOption(optionIndex);

    setTimeout(() => {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = optionIndex;
      setAnswers(newAnswers);

      const selectedAnswer = currentQuestion.options[optionIndex];
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      setShowFeedback(true);

      if (isCorrect) {
        setStreak(streak + 1);
        setScore(score + currentQuestion.points);
      } else {
        setHearts(Math.max(0, hearts - 1));
        setStreak(0);

        if (hearts <= 1) {
          setTimeout(() => handleQuizComplete(), 1500);
        }
      }
    }, 200);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setCurrentHint(0);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = useCallback(() => {
    const correctAnswers = answers.reduce((total, answer, index) => {
      if (answer === null) return total;
      const selectedAnswer = mockQuiz.questions[index]?.options[answer];
      const correctAnswer = mockQuiz.questions[index]?.correctAnswer;
      return (total || 0) + (selectedAnswer === correctAnswer ? 1 : 0);
    }, 0);

    const finalScore = Math.round(
      ((correctAnswers || 0) / mockQuiz.questions.length) * 100
    );

    router.push({
      pathname: "/(routes)/assessments/results",
      params: {
        score: finalScore.toString(),
        correctAnswers: (correctAnswers || 0).toString(),
        totalQuestions: mockQuiz.questions.length.toString(),
        timeSpent: (mockQuiz.timeLimit - timeRemaining).toString(),
        hearts: hearts.toString(),
        streak: streak.toString(),
      },
    });
  }, [answers, hearts, router, streak, timeRemaining]);

  const handleHintPress = () => {
    setShowHintModal(true);
  };

  const handleNextHint = () => {
    if (currentHint < currentQuestion.hints.length - 1) {
      setCurrentHint(currentHint + 1);

      if (currentHint === 0) {
        setScore(Math.max(0, score - 2));
      } else if (currentHint === 1) {
        setScore(Math.max(0, score - 3));
      } else {
        setHearts(Math.max(0, hearts - 1));
        setShowHintModal(false);
      }
    }
  };

  const getOptionStyle = (index: number) => {
    if (selectedOption === index && !showFeedback) {
      return [styles.option, styles.selectedOption];
    } else if (showFeedback) {
      const selectedAnswer = currentQuestion.options[index];
      if (selectedAnswer === currentQuestion.correctAnswer) {
        return [styles.option, styles.correctOption];
      } else if (index === selectedOption) {
        return [styles.option, styles.incorrectOption];
      }
    }
    return styles.option;
  };

  const getOptionTextStyle = (index: number) => {
    if (selectedOption === index && !showFeedback) {
      return [styles.optionText, styles.selectedOptionText];
    } else if (showFeedback) {
      const selectedAnswer = currentQuestion.options[index];
      if (selectedAnswer === currentQuestion.correctAnswer) {
        return [styles.optionText, styles.correctOptionText];
      } else if (index === selectedOption) {
        return [styles.optionText, styles.incorrectOptionText];
      }
    }
    return styles.optionText;
  };

  const getOptionIndicatorStyle = (index: number) => {
    if (selectedOption === index && !showFeedback) {
      return [styles.optionIndicator, styles.selectedIndicator];
    } else if (showFeedback) {
      const selectedAnswer = currentQuestion.options[index];
      if (selectedAnswer === currentQuestion.correctAnswer) {
        return [styles.optionIndicator, styles.correctIndicator];
      } else if (index === selectedOption) {
        return [styles.optionIndicator, styles.incorrectIndicator];
      }
    }
    return styles.optionIndicator;
  };

  const selectedAnswer =
    selectedOption !== null ? currentQuestion.options[selectedOption] : null;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <QuizHeader
        hearts={hearts}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={mockQuiz.questions.length}
        timeRemaining={timeRemaining}
        streak={streak}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <QuestionCard
          question={currentQuestion.question}
          questionNumber={currentQuestionIndex + 1}
          onHintPress={handleHintPress}
        />

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(index)}
              onPress={() => handleOptionSelect(index)}
              disabled={showFeedback}
            >
              <View style={getOptionIndicatorStyle(index)}>
                <Text style={styles.optionIndicatorText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>

              <Text style={getOptionTextStyle(index)}>{option}</Text>

              {showFeedback &&
                currentQuestion.options[index] ===
                  currentQuestion.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                )}
              {showFeedback &&
                index === selectedOption &&
                currentQuestion.options[index] !==
                  currentQuestion.correctAnswer && (
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                )}
            </TouchableOpacity>
          ))}
        </View>

        {showFeedback && (
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
            {currentQuestionIndex === mockQuiz.questions.length - 1
              ? "Complete Quiz"
              : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>

      <HintModal
        visible={showHintModal}
        hints={currentQuestion.hints}
        currentHint={currentHint}
        onNextHint={handleNextHint}
        onClose={() => setShowHintModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  // Header styles
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
  // Question card styles
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
  hintButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  questionText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 24,
  },
  // Options styles
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
  selectedIndicator: {
    backgroundColor: "#3B82F6",
  },
  correctIndicator: {
    backgroundColor: "#10B981",
  },
  incorrectIndicator: {
    backgroundColor: "#EF4444",
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
  // Feedback styles
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
  // Footer styles
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
  // Modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 50,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  modalText: {
    color: "#374151",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButton: {
    backgroundColor: "#F3F4F6",
  },
  modalNextButton: {
    backgroundColor: "#EAB308",
  },
  modalCloseButtonText: {
    fontWeight: "600",
    color: "#374151",
  },
  modalNextButtonText: {
    fontWeight: "600",
    color: "white",
  },
  hintCounter: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    marginTop: 12,
  },
});
