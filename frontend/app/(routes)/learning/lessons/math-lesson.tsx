"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Mock math lesson data based on lesson.math.model
const MATH_LESSON = {
  _id: "lesson_001",
  // Base lesson fields
  topicId: "topic_algebra",
  title: "Introduction to Algebraic Expressions",
  series: ["D"],
  overview:
    "Master the fundamentals of algebraic expressions through interactive examples and step-by-step solutions.",
  objectives: [
    "Identify variables and coefficients",
    "Combine like terms",
    "Apply distributive property",
    "Simplify complex expressions",
  ],
  keyPoints: [
    "Variables represent unknown values",
    "Coefficients multiply variables",
    "Like terms have same variables",
    "Order of operations applies",
  ],
  duration: 45,
  interactivityLevel: "high",

  // Math-specific fields
  introduction: {
    text: "Welcome to algebraic expressions! In this lesson, you'll learn how to work with variables, coefficients, and mathematical operations to solve real-world problems.",
    videoUrl: "https://example.com/algebra-intro.mp4",
    transcript: "In algebra, we use letters to represent unknown numbers...",
    accessibility: {
      hasSubtitles: true,
      hasAudioDescription: false,
    },
    learningGoals: [
      "Understand what variables represent in mathematics",
      "Learn to identify coefficients in expressions",
      "Master the art of combining like terms",
      "Apply algebraic rules to real-world scenarios",
    ],
    prerequisites: [
      "Basic arithmetic operations (+, -, ×, ÷)",
      "Understanding of positive and negative numbers",
      "Familiarity with mathematical symbols and notation",
    ],
  },

  concepts: [
    {
      name: "Variables and Coefficients",
      definition:
        "A variable is a letter that represents an unknown number, while a coefficient is the number that multiplies the variable.",
      topic: "algebra",
      explanation:
        "In the expression 3x, the number 3 is the coefficient and x is the variable.",
      difficultyLevel: "beginner",
      examples: [
        {
          expression: "5x + 2y",
          explanation: "5 and 2 are coefficients, x and y are variables",
          steps: [
            "Identify the coefficient of x: 5",
            "Identify the coefficient of y: 2",
            "Variables are x and y",
          ],
        },
        {
          expression: "3a - 7b + 4",
          explanation: "3 and -7 are coefficients, 4 is a constant term",
          steps: [
            "Coefficient of a: 3",
            "Coefficient of b: -7",
            "Constant term: 4",
          ],
        },
      ],
      formulas: [
        {
          formula: "ax + b",
          useCase: "Linear expression with coefficient a and constant b",
          derivationSteps: [
            "a represents the coefficient",
            "x represents the variable",
            "b represents the constant",
          ],
        },
      ],
      visualAid: {
        mediaType: "image",
        url: "https://example.com/variables-diagram.png",
        altText:
          "Diagram showing variables and coefficients in algebraic expressions",
      },
    },
    {
      name: "Like Terms",
      definition:
        "Like terms are terms that have the same variables raised to the same powers.",
      topic: "algebra",
      explanation:
        "Terms with identical variable parts can be combined by adding or subtracting their coefficients.",
      difficultyLevel: "intermediate",
      examples: [
        {
          expression: "3x + 5x = 8x",
          explanation:
            "Both terms have the same variable x, so we add coefficients",
          steps: [
            "Identify like terms: 3x and 5x",
            "Add coefficients: 3 + 5 = 8",
            "Result: 8x",
          ],
        },
      ],
      formulas: [
        {
          formula: "ax + bx = (a + b)x",
          useCase: "Combining like terms with same variable",
          derivationSteps: [
            "Factor out common variable",
            "Add coefficients",
            "Multiply result by variable",
          ],
        },
      ],
    },
    {
      name: "Distributive Property",
      definition:
        "The distributive property states that a(b + c) = ab + ac for any real numbers a, b, and c.",
      topic: "algebra",
      explanation:
        "This property allows us to multiply a number by a sum by multiplying each addend separately.",
      difficultyLevel: "intermediate",
      examples: [
        {
          expression: "2(x + 3) = 2x + 6",
          explanation: "Multiply 2 by each term inside the parentheses",
          steps: [
            "Apply distributive property: 2(x + 3)",
            "Multiply: 2 × x = 2x",
            "Multiply: 2 × 3 = 6",
            "Result: 2x + 6",
          ],
        },
      ],
      formulas: [
        {
          formula: "a(b + c) = ab + ac",
          useCase: "Expanding expressions with parentheses",
          derivationSteps: [
            "Multiply the outside term by each inside term",
            "Add the results together",
          ],
        },
      ],
    },
  ],

  theorems: [
    {
      title: "Distributive Property",
      statement: "For any real numbers a, b, and c: a(b + c) = ab + ac",
      proof: [
        "Let a, b, c be real numbers",
        "Consider a(b + c)",
        "By definition of multiplication over addition",
        "a(b + c) = ab + ac",
      ],
      applications: [
        "Expanding expressions",
        "Factoring expressions",
        "Solving equations",
      ],
    },
  ],

  workedExamples: [
    {
      problem: "Simplify: 2(3x + 4) - 5x + 1",
      solutionSteps: [
        "Apply distributive property: 2(3x + 4) = 6x + 8",
        "Rewrite expression: 6x + 8 - 5x + 1",
        "Combine like terms: (6x - 5x) + (8 + 1)",
        "Simplify: x + 9",
      ],
      answer: "x + 9",
      difficultyLevel: "intermediate",
    },
    {
      problem: "Combine like terms: 4a + 3b - 2a + 7b",
      solutionSteps: [
        "Group like terms: (4a - 2a) + (3b + 7b)",
        "Combine a terms: 4a - 2a = 2a",
        "Combine b terms: 3b + 7b = 10b",
        "Final answer: 2a + 10b",
      ],
      answer: "2a + 10b",
      difficultyLevel: "beginner",
    },
  ],

  practiceExercises: [
    {
      exerciseId: "exercise_001",
      type: "practice",
      description: "Identify variables and coefficients",
      difficultyLevel: "beginner",
    },
    {
      exerciseId: "exercise_002",
      type: "quiz",
      description: "Combine like terms",
      difficultyLevel: "intermediate",
    },
  ],

  interactiveElements: [
    {
      elementType: "desmos",
      url: "https://desmos.com/calculator/algebra-expressions",
      instructions: "Use this calculator to visualize algebraic expressions",
      offlineAvailable: false,
    },
  ],

  summary: {
    keyTakeaways: [
      "Variables represent unknown quantities",
      "Coefficients multiply variables",
      "Like terms can be combined",
      "Distributive property helps expand expressions",
    ],
    suggestedNextTopics: ["topic_equations", "topic_functions"],
  },

  prerequisites: ["topic_arithmetic"],
  learningObjectives: [
    "Master variable identification",
    "Combine like terms efficiently",
    "Apply distributive property",
    "Simplify complex expressions",
  ],

  gamification: {
    badges: ["Algebra Beginner", "Expression Master"],
    points: 150,
  },

  progressTracking: {
    completedBy: [],
    completionRate: 0,
  },

  accessibilityOptions: {
    hasBraille: false,
    hasSignLanguage: false,
    languages: ["french"],
    screenReaderFriendly: true,
  },
};

export default function MathLessonScreen() {
  const router = useRouter();
  const { lessonId, moduleId } = useLocalSearchParams();
  const [currentSection, setCurrentSection] = useState<
    "introduction" | "concepts" | "examples" | "practice"
  >("introduction");
  const [selectedConcept, setSelectedConcept] = useState(0);
  const [selectedExample, setSelectedExample] = useState(0);

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  const handleExercisePress = (exerciseId: string) => {
    // TODO: Navigate to exercise
    console.log(`Navigate to exercise: ${exerciseId}`);
  };

  const handleInteractivePress = (url: string) => {
    // TODO: Open interactive element
    console.log(`Open interactive: ${url}`);
  };

  const handleCompleteLesson = () => {
    // TODO: Mark lesson as complete and navigate back
    console.log("Lesson completed!");
    router.back();
  };

  const handleNextConcept = () => {
    if (selectedConcept < MATH_LESSON.concepts.length - 1) {
      setSelectedConcept(selectedConcept + 1);
    }
  };

  const handlePreviousConcept = () => {
    if (selectedConcept > 0) {
      setSelectedConcept(selectedConcept - 1);
    }
  };

  const renderVideoPlayer = () => (
    <View style={styles.videoPlayerContainer}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.videoPlayer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.playButton}>
          <LinearGradient
            colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
            style={styles.playButtonGradient}
          >
            <Ionicons name="play" size={32} color="#3B82F6" />
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>Introduction to Algebra</Text>
          <Text style={styles.videoDuration}>8:45 • HD Quality</Text>
        </View>
        <View style={styles.videoControls}>
          <TouchableOpacity style={styles.videoControl}>
            <Ionicons name="logo-closed-captioning" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.videoControl}>
            <Ionicons name="settings" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderIntroduction = () => (
    <View style={styles.sectionContent}>
      {renderVideoPlayer()}

      <View style={styles.introCard}>
        <LinearGradient
          colors={["#EBF8FF", "#F0F9FF"]}
          style={styles.introCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.introHeader}>
            <View style={styles.introIcon}>
              <Ionicons name="school" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.introTitle}>
              Welcome to Algebraic Expressions!
            </Text>
          </View>
          <Text style={styles.introText}>{MATH_LESSON.introduction.text}</Text>
        </LinearGradient>
      </View>

      <View style={styles.goalsSection}>
        <Text style={styles.sectionTitle}>What You&apos;ll Learn</Text>
        {MATH_LESSON.introduction.learningGoals.map((goal, index) => (
          <View key={index} style={styles.goalItem}>
            <View style={styles.goalIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.goalText}>{goal}</Text>
          </View>
        ))}
      </View>

      <View style={styles.prerequisitesSection}>
        <Text style={styles.sectionTitle}>Prerequisites</Text>
        <Text style={styles.prerequisitesSubtitle}>
          Make sure you&apos;re comfortable with these concepts:
        </Text>
        {MATH_LESSON.introduction.prerequisites.map((prereq, index) => (
          <View key={index} style={styles.prerequisiteItem}>
            <View style={styles.prerequisiteIcon}>
              <Ionicons name="library" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.prerequisiteText}>{prereq}</Text>
          </View>
        ))}
      </View>

      {MATH_LESSON.introduction.accessibility.hasSubtitles && (
        <View style={styles.accessibilityBadge}>
          <Ionicons name="logo-closed-captioning" size={16} color="#10B981" />
          <Text style={styles.accessibilityText}>Subtitles Available</Text>
        </View>
      )}
    </View>
  );

  const renderConcepts = () => {
    const concept = MATH_LESSON.concepts[selectedConcept];
    const isFirst = selectedConcept === 0;
    const isLast = selectedConcept === MATH_LESSON.concepts.length - 1;

    return (
      <View style={styles.sectionContent}>
        <View style={styles.conceptHeader}>
          <View style={styles.conceptProgress}>
            <Text style={styles.conceptProgressText}>
              Concept {selectedConcept + 1} of {MATH_LESSON.concepts.length}
            </Text>
            <View style={styles.conceptProgressBar}>
              <View
                style={[
                  styles.conceptProgressFill,
                  {
                    width: `${
                      ((selectedConcept + 1) / MATH_LESSON.concepts.length) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.conceptNavigation}>
            <TouchableOpacity
              style={[styles.navButton, isFirst && styles.navButtonDisabled]}
              onPress={handlePreviousConcept}
              disabled={isFirst}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={isFirst ? "#9CA3AF" : "#3B82F6"}
              />
              <Text
                style={[
                  styles.navButtonText,
                  isFirst && styles.navButtonTextDisabled,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, isLast && styles.navButtonDisabled]}
              onPress={handleNextConcept}
              disabled={isLast}
            >
              <Text
                style={[
                  styles.navButtonText,
                  isLast && styles.navButtonTextDisabled,
                ]}
              >
                Next
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isLast ? "#9CA3AF" : "#3B82F6"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.conceptCard}>
          <View style={styles.conceptCardHeader}>
            <Text style={styles.conceptName}>{concept.name}</Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                {concept.difficultyLevel.charAt(0).toUpperCase() +
                  concept.difficultyLevel.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.conceptDefinition}>{concept.definition}</Text>
          <Text style={styles.conceptExplanation}>{concept.explanation}</Text>
        </View>

        {concept.examples.length > 0 && (
          <View style={styles.examplesSection}>
            <Text style={styles.sectionTitle}>Examples</Text>
            {concept.examples.map((example, index) => (
              <View key={index} style={styles.exampleCard}>
                <Text style={styles.exampleExpression}>
                  {example.expression}
                </Text>
                <Text style={styles.exampleExplanation}>
                  {example.explanation}
                </Text>

                <View style={styles.stepsContainer}>
                  <Text style={styles.stepsTitle}>Steps:</Text>
                  {example.steps.map((step, stepIndex) => (
                    <View key={stepIndex} style={styles.stepItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>
                          {stepIndex + 1}
                        </Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderWorkedExamples = () => {
    const example = MATH_LESSON.workedExamples[selectedExample];

    return (
      <View style={styles.sectionContent}>
        <View style={styles.exampleSelector}>
          {MATH_LESSON.workedExamples.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.exampleTab,
                selectedExample === index && styles.activeExampleTab,
              ]}
              onPress={() => setSelectedExample(index)}
            >
              <Text
                style={[
                  styles.exampleTabText,
                  selectedExample === index && styles.activeExampleTabText,
                ]}
              >
                Example {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.workedExampleCard}>
          <View style={styles.problemSection}>
            <Text style={styles.problemLabel}>Problem:</Text>
            <Text style={styles.problemText}>{example.problem}</Text>
          </View>

          <View style={styles.solutionSection}>
            <Text style={styles.solutionLabel}>Solution:</Text>
            {example.solutionSteps.map((step, index) => (
              <View key={index} style={styles.solutionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.solutionStepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.answerSection}>
            <Text style={styles.answerLabel}>Answer:</Text>
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>{example.answer}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPractice = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Practice Exercises</Text>

      {MATH_LESSON.practiceExercises.map((exercise, index) => (
        <TouchableOpacity
          key={exercise.exerciseId}
          style={styles.exerciseCard}
          onPress={() => handleExercisePress(exercise.exerciseId)}
        >
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseIcon}>
              <Ionicons name="create" size={20} color="#10B981" />
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseTitle}>Exercise {index + 1}</Text>
              <Text style={styles.exerciseDescription}>
                {exercise.description}
              </Text>
            </View>
            <View style={styles.exerciseBadge}>
              <Text style={styles.exerciseBadgeText}>
                {exercise.difficultyLevel}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.interactiveSection}>
        <Text style={styles.sectionTitle}>Interactive Tools</Text>
        {MATH_LESSON.interactiveElements.map((element, index) => (
          <TouchableOpacity
            key={index}
            style={styles.interactiveCard}
            onPress={() => handleInteractivePress(element.url)}
          >
            <Ionicons name="calculator" size={24} color="#3B82F6" />
            <View style={styles.interactiveInfo}>
              <Text style={styles.interactiveTitle}>
                {element.elementType.toUpperCase()}
              </Text>
              <Text style={styles.interactiveInstructions}>
                {element.instructions}
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSectionContent = () => {
    switch (currentSection) {
      case "introduction":
        return renderIntroduction();
      case "concepts":
        return renderConcepts();
      case "examples":
        return renderWorkedExamples();
      case "practice":
        return renderPractice();
      default:
        return null;
    }
  };

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
      marginBottom: 16,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
      borderRadius: 8,
      backgroundColor: "#F1F5F9",
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 18,
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
    progressBar: {
      height: 4,
      backgroundColor: "#E2E8F0",
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#10B981",
      width: "25%", // This would be dynamic based on current section
    },
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: "white",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 8,
      borderRadius: 8,
      marginHorizontal: 2,
    },
    activeTab: {
      backgroundColor: "#3B82F6",
    },
    tabText: {
      fontSize: 12,
      color: "#64748B",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    activeTabText: {
      color: "white",
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    sectionContent: {
      marginBottom: 24,
    },
    introCard: {
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    introCardGradient: {
      padding: 24,
    },
    introHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 12,
    },
    introIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      justifyContent: "center",
      alignItems: "center",
    },
    introTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      flex: 1,
    },
    introText: {
      fontSize: 16,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 24,
    },
    goalsSection: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#D1FAE5",
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    goalItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
      gap: 12,
    },
    goalIcon: {
      marginTop: 2,
    },
    goalText: {
      flex: 1,
      fontSize: 15,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 22,
    },
    prerequisitesSection: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#FEF3C7",
      shadowColor: "#F59E0B",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    prerequisitesSubtitle: {
      fontSize: 14,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
      marginBottom: 16,
      lineHeight: 20,
    },
    prerequisiteItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      gap: 12,
    },
    prerequisiteIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#FEF3C7",
      justifyContent: "center",
      alignItems: "center",
    },
    prerequisiteText: {
      flex: 1,
      fontSize: 14,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    accessibilityBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ECFDF5",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: "flex-start",
      gap: 6,
    },
    accessibilityText: {
      fontSize: 12,
      color: "#10B981",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    conceptHeader: {
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
    conceptProgress: {
      marginBottom: 16,
    },
    conceptProgressText: {
      fontSize: 14,
      color: "#6B7280",
      fontFamily: "Inter-Medium",
      marginBottom: 8,
    },
    conceptProgressBar: {
      height: 6,
      backgroundColor: "#E5E7EB",
      borderRadius: 3,
      overflow: "hidden",
    },
    conceptProgressFill: {
      height: "100%",
      backgroundColor: "#3B82F6",
      borderRadius: 3,
    },
    conceptNavigation: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    navButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: "#F8FAFC",
      gap: 6,
    },
    navButtonDisabled: {
      opacity: 0.5,
    },
    navButtonText: {
      fontSize: 14,
      color: "#3B82F6",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    navButtonTextDisabled: {
      color: "#9CA3AF",
    },
    conceptCard: {
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
    conceptCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    conceptName: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      flex: 1,
      marginRight: 12,
    },
    conceptDefinition: {
      fontSize: 16,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 24,
      marginBottom: 12,
    },
    conceptExplanation: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    difficultyBadge: {
      backgroundColor: "#FEF3C7",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    difficultyText: {
      fontSize: 12,
      color: "#92400E",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    examplesSection: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 16,
    },
    exampleCard: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    exampleExpression: {
      fontSize: 18,
      fontWeight: "600",
      color: "#3B82F6",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
      textAlign: "center",
      backgroundColor: "#F8FAFC",
      padding: 12,
      borderRadius: 8,
    },
    exampleExplanation: {
      fontSize: 14,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
      marginBottom: 16,
    },
    stepsContainer: {
      marginTop: 12,
    },
    stepsTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    stepItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
      gap: 12,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#3B82F6",
      justifyContent: "center",
      alignItems: "center",
    },
    stepNumberText: {
      fontSize: 12,
      color: "white",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    stepText: {
      flex: 1,
      fontSize: 14,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    exampleSelector: {
      flexDirection: "row",
      marginBottom: 20,
      gap: 8,
    },
    exampleTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: "#F1F5F9",
    },
    activeExampleTab: {
      backgroundColor: "#3B82F6",
    },
    exampleTabText: {
      fontSize: 12,
      color: "#64748B",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    activeExampleTabText: {
      color: "white",
    },
    workedExampleCard: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    problemSection: {
      marginBottom: 20,
    },
    problemLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    problemText: {
      fontSize: 16,
      color: "#374151",
      fontFamily: "Inter-Regular",
      backgroundColor: "#FEF3C7",
      padding: 16,
      borderRadius: 12,
      textAlign: "center",
    },
    solutionSection: {
      marginBottom: 20,
    },
    solutionLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 12,
    },
    solutionStep: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
      gap: 12,
    },
    solutionStepText: {
      flex: 1,
      fontSize: 14,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    answerSection: {
      marginTop: 16,
    },
    answerLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    answerBox: {
      backgroundColor: "#ECFDF5",
      borderWidth: 2,
      borderColor: "#10B981",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    answerText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#10B981",
      fontFamily: "Inter-Bold",
    },
    exerciseCard: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    exerciseHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    exerciseIcon: {
      marginRight: 12,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
    },
    exerciseDescription: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    exerciseBadge: {
      backgroundColor: "#E0F2FE",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    exerciseBadgeText: {
      fontSize: 10,
      color: "#0369A1",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    interactiveSection: {
      marginTop: 24,
    },
    interactiveCard: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
    },
    interactiveInfo: {
      flex: 1,
      marginLeft: 12,
    },
    interactiveTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
    },
    interactiveInstructions: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    completeButton: {
      margin: 20,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    completeButtonGradient: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    completeButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
      marginLeft: 8,
    },
    videoPlayerContainer: {
      marginBottom: 20,
    },
    videoPlayer: {
      height: 220,
      borderRadius: 16,
      overflow: "hidden",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      overflow: "hidden",
      marginRight: 16,
    },
    playButtonGradient: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    videoInfo: {
      flex: 1,
    },
    videoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
      fontFamily: "Inter-SemiBold",
    },
    videoDuration: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      fontFamily: "Inter-Regular",
      marginTop: 4,
    },
    videoControls: {
      flexDirection: "row",
      gap: 12,
    },
    videoControl: {
      padding: 8,
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
            <Text style={styles.title}>{MATH_LESSON.title}</Text>
            <Text style={styles.subtitle}>
              Math Lesson • {MATH_LESSON.duration} minutes
            </Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {[
          { key: "introduction", label: "Intro" },
          { key: "concepts", label: "Concepts" },
          { key: "examples", label: "Examples" },
          { key: "practice", label: "Practice" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, currentSection === tab.key && styles.activeTab]}
            onPress={() => setCurrentSection(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                currentSection === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>{renderSectionContent()}</View>
      </ScrollView>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleCompleteLesson}
      >
        <LinearGradient
          colors={["#10B981", "#059669"]}
          style={styles.completeButtonGradient}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.completeButtonText}>Complete Lesson</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
