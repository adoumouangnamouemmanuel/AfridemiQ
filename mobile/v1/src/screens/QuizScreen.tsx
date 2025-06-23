"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import questionsData from "../data/questions.json";
import QuizHeader from "../components/quiz/QuizHeader";
import QuestionCard from "../components/quiz/QuestionCard";
import HintModal from "../components/quiz/HintModal";
import ExplanationModal from "../components/quiz/ExplanationModal";

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintStep, setHintStep] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [xpReductions, setXpReductions] = useState<number[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const questions = questionsData.slice(0, 10);
  const currentQuestion = questions[currentQuestionIndex];

  // Progressive hint steps
  const getHintSteps = () => [
    "💡 Think about what the question is really asking for.",
    "🔍 Look at the key information provided in the question.",
    "📝 Consider which formula or concept applies here.",
    `⚡ The correct answer is option ${String.fromCharCode(
      65 + currentQuestion.correctAnswer
    )}: ${currentQuestion.options[currentQuestion.correctAnswer]}`,
  ];

  // Animations
  const progressAnimation = useSharedValue(0);
  const questionAnimation = useSharedValue(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optionAnimations = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];
  const feedbackAnimation = useSharedValue(0);
  const heartAnimation = useSharedValue(1);
  const streakAnimation = useSharedValue(1);
  const helpButtonPulse = useSharedValue(1);

  const optionAnimatedStyles = [
    useAnimatedStyle(() => ({
      opacity: optionAnimations[0].value,
      transform: [
        { translateY: interpolate(optionAnimations[0].value, [0, 1], [30, 0]) },
        { scale: interpolate(optionAnimations[0].value, [0, 1], [0.95, 1]) },
      ],
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnimations[1].value,
      transform: [
        { translateY: interpolate(optionAnimations[1].value, [0, 1], [30, 0]) },
        { scale: interpolate(optionAnimations[1].value, [0, 1], [0.95, 1]) },
      ],
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnimations[2].value,
      transform: [
        { translateY: interpolate(optionAnimations[2].value, [0, 1], [30, 0]) },
        { scale: interpolate(optionAnimations[2].value, [0, 1], [0.95, 1]) },
      ],
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnimations[3].value,
      transform: [
        { translateY: interpolate(optionAnimations[3].value, [0, 1], [30, 0]) },
        { scale: interpolate(optionAnimations[3].value, [0, 1], [0.95, 1]) },
      ],
    })),
  ];

  useEffect(() => {
    setAnswers(Array(questions.length).fill(null));
    setXpReductions(Array(questions.length).fill(0));
  }, [questions.length]);

  useEffect(() => {
    setHintStep(0);
    progressAnimation.value = withTiming(
      (currentQuestionIndex + 1) / questions.length,
      { duration: 800 }
    );

    questionAnimation.value = 0;
    questionAnimation.value = withDelay(
      200,
      withSpring(1, { damping: 15, stiffness: 150 })
    );

    currentQuestion.options.forEach((_, index) => {
      optionAnimations[index].value = 0;
      optionAnimations[index].value = withDelay(
        400 + index * 100,
        withSpring(1, { damping: 15, stiffness: 150 })
      );
    });

    helpButtonPulse.value = withRepeat(
      withSequence(
        withDelay(2000, withTiming(1.1, { duration: 600 })),
        withTiming(1, { duration: 600 })
      ),
      3,
      false
    );
  }, [currentQuestionIndex, currentQuestion, progressAnimation, questions.length, questionAnimation, helpButtonPulse, optionAnimations]);

  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
    feedbackAnimation.value = 0;
  }, [currentQuestionIndex, feedbackAnimation]);

  const handleOptionSelect = (optionIndex: number) => {
    if (showFeedback) return;

    setSelectedOption(optionIndex);

    optionAnimations[optionIndex].value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 100 })
    );

    setTimeout(() => {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = optionIndex;
      setAnswers(newAnswers);

      setShowFeedback(true);
      feedbackAnimation.value = withSpring(1, { damping: 15, stiffness: 150 });

      const isCorrect = optionIndex === currentQuestion.correctAnswer;

      if (isCorrect) {
        setStreak(streak + 1);
        streakAnimation.value = withSequence(
          withTiming(1.3, { duration: 200 }),
          withTiming(1, { duration: 200 })
        );
      } else {
        setHearts(Math.max(0, hearts - 1));
        heartAnimation.value = withSequence(
          withTiming(1.5, { duration: 150 }),
          withTiming(0.8, { duration: 150 }),
          withTiming(1, { duration: 150 })
        );
      }
    }, 300);
  };

  const handleHintPress = () => {
    setShowHintModal(true);
  };

  const handleNextHint = () => {
    const newHintStep = hintStep + 1;
    setHintStep(newHintStep);

    const newXpReductions = [...xpReductions];
    const currentReduction = newXpReductions[currentQuestionIndex] || 0;

    if (newHintStep === 1) {
      newXpReductions[currentQuestionIndex] = currentReduction + 2;
    } else if (newHintStep === 2) {
      newXpReductions[currentQuestionIndex] = currentReduction + 2;
    } else if (newHintStep === 3) {
      newXpReductions[currentQuestionIndex] = currentReduction + 3;
    } else if (newHintStep >= 4) {
      // Final hint reveals answer - lose heart
      setHearts(Math.max(0, hearts - 1));
      newXpReductions[currentQuestionIndex] = 10; // Full penalty
      heartAnimation.value = withSequence(
        withTiming(1.5, { duration: 150 }),
        withTiming(0.8, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      setShowHintModal(false);
    }

    setXpReductions(newXpReductions);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    const correctAnswers = answers.reduce((total: number, answer, index) => {
      return total + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const score = Math.round(((correctAnswers ?? 0) / questions.length) * 100);

    let totalXP = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        const baseXP = 10;
        const reduction = xpReductions[index] || 0;
        totalXP += Math.max(0, baseXP - reduction);
      }
    });

    router.push({
      pathname: "/(routes)/results",
      params: {
        score: score.toString(),
        correctAnswers: correctAnswers.toString(),
        totalQuestions: questions.length.toString(),
        xpEarned: totalXP.toString(),
        timeSpent: "900",
        streak: streak.toString(),
        hearts: hearts.toString(),
      },
    });
  };

  const getOptionStyle = (index: number) => {
    if (!showFeedback) {
      return index === selectedOption ? styles.selectedOption : styles.option;
    }

    if (index === currentQuestion.correctAnswer) {
      return styles.correctOption;
    }

    if (index === selectedOption && index !== currentQuestion.correctAnswer) {
      return styles.incorrectOption;
    }

    return styles.option;
  };

  const hintSteps = getHintSteps();
  const currentHint = hintSteps[hintStep] || hintSteps[0];
  const isLastHint = hintStep >= hintSteps.length - 1;
  const isCorrect = selectedOption === currentQuestion.correctAnswer;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <QuizHeader
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        hearts={hearts}
        streak={streak}
        progressAnimation={progressAnimation}
        heartAnimation={heartAnimation}
        streakAnimation={streakAnimation}
      />

      <ScrollView
        style={styles.content}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        <QuestionCard
          questionNumber={currentQuestionIndex + 1}
          questionText={currentQuestion.question}
          showFeedback={showFeedback}
          onHintPress={handleHintPress}
          questionAnimation={questionAnimation}
          helpButtonAnimation={helpButtonPulse}
        />

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <Animated.View key={index} style={optionAnimatedStyles[index]}>
              <TouchableOpacity
                style={getOptionStyle(index)}
                onPress={() => handleOptionSelect(index)}
                disabled={showFeedback}
              >
                <View
                  style={[
                    styles.optionIndicator,
                    selectedOption === index && styles.selectedOptionIndicator,
                    showFeedback &&
                      index === currentQuestion.correctAnswer &&
                      styles.correctOptionIndicator,
                    showFeedback &&
                      index === selectedOption &&
                      index !== currentQuestion.correctAnswer &&
                      styles.incorrectOptionIndicator,
                  ]}
                >
                  <Text style={styles.optionIndicatorText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === index &&
                      !showFeedback &&
                      styles.selectedOptionText,
                    showFeedback &&
                      index === currentQuestion.correctAnswer &&
                      styles.correctOptionText,
                    showFeedback &&
                      index === selectedOption &&
                      index !== currentQuestion.correctAnswer &&
                      styles.incorrectOptionText,
                  ]}
                >
                  {option}
                </Text>
                {showFeedback && index === currentQuestion.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                )}
                {showFeedback &&
                  index === selectedOption &&
                  index !== currentQuestion.correctAnswer && (
                    <Ionicons name="close-circle" size={32} color="#EF4444" />
                  )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Feedback */}
        {showFeedback && (
          <Animated.View style={{ opacity: feedbackAnimation }}>
            <LinearGradient
              colors={
                isCorrect ? ["#ECFDF5", "#D1FAE5"] : ["#FEF2F2", "#FECACA"]
              }
              style={styles.feedbackCard}
            >
              <View style={styles.feedbackContent}>
                <Ionicons
                  name={isCorrect ? "checkmark-circle" : "close-circle"}
                  size={40}
                  color={isCorrect ? "#10B981" : "#EF4444"}
                  style={styles.feedbackIcon}
                />
                <View style={styles.feedbackTextContainer}>
                  <Text
                    style={[
                      styles.feedbackTitle,
                      {
                        color: isCorrect ? "#10B981" : "#EF4444",
                      },
                    ]}
                  >
                    {isCorrect ? "Excellent!" : "Not quite right"}
                  </Text>
                  <Text
                    style={[
                      styles.feedbackSubtitle,
                      {
                        color: isCorrect ? "#10B981" : "#EF4444",
                      },
                    ]}
                  >
                    {isCorrect
                      ? "You got it right! Well done."
                      : `The correct answer is option ${String.fromCharCode(
                          65 + currentQuestion.correctAnswer
                        )}`}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.solutionButton}
                onPress={() => setShowExplanation(true)}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name="bulb" size={20} color="white" />
                <Text style={styles.solutionButtonText}>
                  View Complete Solution
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
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
            styles.nextButton,
            selectedOption === null && styles.disabledButton,
          ]}
          onPress={handleNextQuestion}
          disabled={selectedOption === null}
        >
          <LinearGradient
            colors={
              selectedOption !== null
                ? ["#10B981", "#059669"]
                : ["#E5E7EB", "#D1D5DB"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === questions.length - 1
              ? "Complete Quiz"
              : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>

      <HintModal
        visible={showHintModal}
        currentHint={currentHint}
        hintStep={hintStep}
        totalHints={hintSteps.length}
        onNextHint={handleNextHint}
        onClose={() => setShowHintModal(false)}
        isLastHint={isLastHint}
      />

      <ExplanationModal
        visible={showExplanation}
        question={currentQuestion}
        onClose={() => setShowExplanation(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  selectedOption: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
    shadowColor: "#6366F1",
    shadowOpacity: 0.2,
    transform: [{ scale: 1.02 }],
  },
  correctOption: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
  },
  incorrectOption: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
    shadowColor: "#EF4444",
    shadowOpacity: 0.3,
  },
  optionIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  selectedOptionIndicator: {
    backgroundColor: "#6366F1",
  },
  correctOptionIndicator: {
    backgroundColor: "#10B981",
  },
  incorrectOptionIndicator: {
    backgroundColor: "#EF4444",
  },
  optionIndicatorText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  optionText: {
    fontSize: 18,
    color: "#374151",
    flex: 1,
    lineHeight: 26,
    fontWeight: "500",
  },
  selectedOptionText: {
    fontSize: 18,
    color: "#6366F1",
    fontWeight: "600",
    flex: 1,
    lineHeight: 26,
  },
  correctOptionText: {
    fontSize: 18,
    color: "#10B981",
    fontWeight: "600",
    flex: 1,
    lineHeight: 26,
  },
  incorrectOptionText: {
    fontSize: 18,
    color: "#EF4444",
    fontWeight: "600",
    flex: 1,
    lineHeight: 26,
  },
  feedbackCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  feedbackContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  feedbackIcon: {
    marginRight: 16,
  },
  feedbackTextContainer: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  feedbackSubtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  solutionButton: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  solutionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: "#F8FAFF",
  },
  nextButton: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
