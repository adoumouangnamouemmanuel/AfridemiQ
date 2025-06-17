"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  // Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Reanimated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  SlideInRight,
  SlideInLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withSequence,
  withDelay,
  FadeInRight,
  FadeInLeft,
} from "react-native-reanimated";
import { useMathLesson } from "../../../../src/hooks/learning/lessons/useMathLesson";
import { useTheme } from "../../../../src/utils/ThemeContext";

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MathLessonScreen() {
  const router = useRouter();
  const { lessonId, moduleId } = useLocalSearchParams();
  const { theme, isDark } = useTheme();

  // Backend integration - use the math lesson hook
  const {
    lesson: backendLesson,
    isLoading,
    error,
  } = useMathLesson(lessonId as string);

  // All useState hooks first
  const [currentSection, setCurrentSection] = useState<
    "introduction" | "concepts" | "examples" | "practice"
  >("introduction");
  const [selectedConcept, setSelectedConcept] = useState(0);
  const [selectedExample, setSelectedExample] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(
    new Set()
  );
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  // const [showFloatingProgress, setShowFloatingProgress] = useState(false);
  const [expandedFormula, setExpandedFormula] = useState<number | null>(null);

  // All useSharedValue hooks
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const progressValue = useSharedValue(0);
  const conceptProgress = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);

  // All useMemo hooks
  const lessonContent = useMemo(() => {
    if (!backendLesson || isLoading || error) {
      return null;
    }

    return {
      _id: backendLesson._id,
      topicId:
        typeof backendLesson.topicId === "string"
          ? backendLesson.topicId
          : backendLesson.topicId._id,
      title: backendLesson.title,
      series: backendLesson.series || ["D"],
      overview: backendLesson.overview,
      objectives: backendLesson.objectives || [],
      keyPoints: backendLesson.keyPoints || [],
      duration: backendLesson.duration,
      interactivityLevel: backendLesson.interactivityLevel,

      introduction: {
        text: backendLesson.introduction?.text || backendLesson.overview,
        videoUrl: backendLesson.introduction?.videoUrl,
        transcript: backendLesson.introduction?.transcript,
        accessibility: backendLesson.introduction?.accessibility || {
          hasSubtitles: false,
          hasAudioDescription: false,
        },
        learningGoals: backendLesson.learningObjectives || [],
        prerequisites:
          backendLesson.prerequisites?.map((p) =>
            typeof p === "string"
              ? p
              : (p as any)?.name || (p as any)?._id || ""
          ) || [],
      },

      concepts:
        backendLesson.concepts?.map((concept) => ({
          name: concept.name,
          definition: concept.definition,
          topic: concept.topic,
          explanation: concept.explanation,
          difficultyLevel: concept.difficultyLevel,
          examples: concept.examples || [],
          formulas: concept.formulas || [],
          visualAid: concept.visualAid,
        })) || [],

      theorems:
        backendLesson.theorems?.map((theorem) => ({
          title: theorem.title,
          statement: theorem.statement,
          proof: theorem.proof || [],
          applications: theorem.applications || [],
        })) || [],

      workedExamples:
        backendLesson.workedExamples?.map((example) => ({
          problem: example.problem,
          solutionSteps: example.solutionSteps || [],
          answer: example.answer,
          difficultyLevel: example.difficultyLevel,
        })) || [],

      practiceExercises:
        backendLesson.practiceExercises?.map((exercise) => ({
          exerciseId:
            typeof exercise.exerciseId === "string"
              ? exercise.exerciseId
              : (exercise.exerciseId as any)?._id || "",
          type: exercise.type,
          description: exercise.description,
          difficultyLevel: exercise.difficultyLevel,
        })) || [],

      interactiveElements:
        backendLesson.interactiveElements?.map((element) => ({
          elementType: element.elementType,
          url: element.url,
          instructions: element.instructions,
          offlineAvailable: element.offlineAvailable,
        })) || [],

      summary: {
        keyTakeaways: backendLesson.summary?.keyTakeaways || [],
        suggestedNextTopics:
          backendLesson.summary?.suggestedNextTopics?.map((topic: any) =>
            typeof topic === "string" ? topic : topic._id
          ) || [],
      },

      prerequisites:
        backendLesson.prerequisites?.map((p) =>
          typeof p === "string" ? p : (p as any)?._id || ""
        ) || [],
      learningObjectives: backendLesson.learningObjectives || [],

      gamification: backendLesson.gamification || {
        badges: [],
        points: 0,
      },

      progressTracking: backendLesson.progressTracking || {
        completedBy: [],
        completionRate: 0,
      },

      accessibilityOptions: backendLesson.accessibilityOptions || {
        hasBraille: false,
        hasSignLanguage: false,
        languages: [],
        screenReaderFriendly: true,
      },
    };
  }, [backendLesson, isLoading, error]);

  const overallProgress = useMemo(() => {
    if (!lessonContent) return 0;
    const totalSections = 4;
    return (completedSections.size / totalSections) * 100;
  }, [completedSections, lessonContent]);

  // All useCallback hooks
  const markSectionComplete = useCallback((section: string) => {
    setCompletedSections((prev) => new Set([...prev, section]));
  }, []);

  const handleSectionChange = useCallback(
    (section: typeof currentSection) => {
      setCurrentSection(section);
      conceptProgress.value = withTiming(0);
    },
    [conceptProgress]
  );

  const handleExercisePress = useCallback((exerciseId: string) => {
    console.log(`Navigate to exercise: ${exerciseId}`);
  }, []);

  const handleInteractivePress = useCallback((url: string) => {
    console.log(`Open interactive: ${url}`);
  }, []);

  const handleCompleteLesson = useCallback(() => {
    console.log("Lesson completed!");
    markSectionComplete("practice");
    router.back();
    router.back();
  }, [markSectionComplete, router]);

  const handleNextConcept = useCallback(() => {
    if (lessonContent && selectedConcept < lessonContent.concepts.length - 1) {
      setSelectedConcept(selectedConcept + 1);
      conceptProgress.value = withSpring(
        (selectedConcept + 2) / lessonContent.concepts.length
      );
    } else {
      // Mark concepts section as complete and move to examples
      markSectionComplete("concepts");
      handleSectionChange("examples");
    }
  }, [
    lessonContent,
    selectedConcept,
    conceptProgress,
    markSectionComplete,
    handleSectionChange,
  ]);


  const handlePreviousConcept = useCallback(() => {
    if (selectedConcept > 0) {
      setSelectedConcept(selectedConcept - 1);
      conceptProgress.value = withSpring(
        selectedConcept / (lessonContent?.concepts.length || 1)
      );
    }
  }, [selectedConcept, conceptProgress, lessonContent]);

  // All useAnimatedStyle hooks
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [
        {
          translateY: interpolate(scrollY.value, [0, 100], [0, -10]),
        },
      ],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  const conceptProgressFillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${
      lessonContent?.concepts
        ? ((selectedConcept + 1) / lessonContent.concepts.length) * 100
        : 0
    }%`,
  }));

  // All useEffect hooks
  useEffect(() => {
    pulseAnimation.value = withSequence(
      withTiming(1.05, { duration: 1000 }),
      withTiming(1, { duration: 1000 }),
      withDelay(2000, withTiming(1.05, { duration: 1000 }))
    );
  }, [pulseAnimation]);

  useEffect(() => {
    progressValue.value = withSpring(overallProgress / 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [overallProgress, progressValue]);

  useEffect(() => {
    if (currentSection === "introduction") {
      markSectionComplete("introduction");
    }
  }, [currentSection, markSectionComplete]);

  // Component definitions
  const ImmersiveVideoPlayer = () => (
    <Reanimated.View
      entering={FadeInUp.delay(200).duration(1000)}
      style={styles.videoContainer}
    >
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb", "#f5576c"]}
        style={styles.videoPlayer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={30} style={styles.videoOverlay}>
          <Reanimated.View
            style={[styles.playButtonContainer, pulseAnimatedStyle]}
          >
            <TouchableOpacity
              style={styles.playButtonWrapper}
              onPress={() => setIsVideoPlaying(!isVideoPlaying)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.98)", "rgba(255,255,255,0.92)"]}
                style={styles.playButton}
              >
                <Ionicons
                  name={isVideoPlaying ? "pause" : "play"}
                  size={42}
                  color="#667eea"
                />
              </LinearGradient>
            </TouchableOpacity>
          </Reanimated.View>

          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>{lessonContent?.title}</Text>
            <Text style={styles.videoDuration}>
              {lessonContent?.duration} min • Interactive Learning
            </Text>

            <View style={styles.videoFeatures}>
              {lessonContent?.introduction.accessibility.hasSubtitles && (
                <View style={styles.featureBadge}>
                  <Ionicons
                    name="logo-closed-captioning"
                    size={16}
                    color="white"
                  />
                  <Text style={styles.featureBadgeText}>CC</Text>
                </View>
              )}
              <View style={styles.featureBadge}>
                <Ionicons name="eye" size={16} color="white" />
                <Text style={styles.featureBadgeText}>4K</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="flash" size={16} color="white" />
                <Text style={styles.featureBadgeText}>AI</Text>
              </View>
            </View>
          </View>

          <View style={styles.videoControls}>
            <TouchableOpacity style={styles.videoControl}>
              <Ionicons
                name="settings"
                size={24}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.videoControl}>
              <Ionicons name="expand" size={24} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>
    </Reanimated.View>
  );

  const StunningWelcomeCard = () => (
    <Reanimated.View
      entering={FadeInUp.delay(400).duration(800)}
      style={styles.welcomeCard}
    >
      <LinearGradient
        colors={["#ffffff", "#f8fafc", "#f1f5f9"]}
        style={styles.welcomeCardGradient}
      >
        <View style={styles.welcomeHeader}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.welcomeIcon}
          >
            <Ionicons name="school" size={32} color="white" />
          </LinearGradient>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Welcome to</Text>
            <Text style={styles.lessonTitle}>{lessonContent?.title}</Text>
          </View>
          <View style={styles.difficultyIndicator}>
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={styles.difficultyBadge}
            >
              <Ionicons name="trending-up" size={16} color="white" />
              <Text style={styles.difficultyText}>
                {lessonContent?.interactivityLevel}
              </Text>
            </LinearGradient>
          </View>
        </View>

        <Text style={styles.lessonOverview}>
          {lessonContent?.introduction.text}
        </Text>

        <View style={styles.lessonMetrics}>
          <View style={styles.metricItem}>
            <LinearGradient
              colors={["#3b82f6", "#1d4ed8"]}
              style={styles.metricIcon}
            >
              <Ionicons name="time" size={20} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.metricValue}>{lessonContent?.duration}</Text>
              <Text style={styles.metricLabel}>minutes</Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <LinearGradient
              colors={["#f59e0b", "#d97706"]}
              style={styles.metricIcon}
            >
              <Ionicons name="star" size={20} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.metricValue}>
                {lessonContent?.gamification.points}
              </Text>
              <Text style={styles.metricLabel}>points</Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <LinearGradient
              colors={["#8b5cf6", "#7c3aed"]}
              style={styles.metricIcon}
            >
              <Ionicons name="library" size={20} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.metricValue}>
                {lessonContent?.concepts?.length || 0}
              </Text>
              <Text style={styles.metricLabel}>concepts</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Reanimated.View>
  );

  const renderIntroduction = () => (
    <ScrollView
      style={styles.sectionContent}
      showsVerticalScrollIndicator={false}
    >
      <ImmersiveVideoPlayer />
      <StunningWelcomeCard />

      {/* Learning Objectives */}
      {lessonContent?.introduction.learningGoals &&
        lessonContent.introduction.learningGoals.length > 0 && (
          <Reanimated.View
            entering={FadeInUp.delay(600).duration(800)}
            style={styles.objectivesCard}
          >
            <LinearGradient
              colors={["#ecfdf5", "#d1fae5", "#a7f3d0"]}
              style={styles.objectivesGradient}
            >
              <View style={styles.objectivesHeader}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.objectivesIcon}
                >
                  <Ionicons name="flag" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.objectivesTitle}>Learning Journey</Text>
                <View style={styles.objectivesCount}>
                  <Text style={styles.objectivesCountText}>
                    {lessonContent.introduction.learningGoals.length}
                  </Text>
                </View>
              </View>

              {lessonContent.introduction.learningGoals.map((goal, index) => (
                <Reanimated.View
                  key={index}
                  entering={SlideInRight.delay(800 + index * 150).duration(600)}
                  style={styles.objectiveItem}
                >
                  <View style={styles.objectiveNumber}>
                    <Text style={styles.objectiveNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.objectiveContent}>
                    <Text style={styles.objectiveText}>{goal}</Text>
                    <View style={styles.objectiveProgress}>
                      <View style={styles.objectiveProgressBar} />
                    </View>
                  </View>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={24}
                    color="#10b981"
                  />
                </Reanimated.View>
              ))}
            </LinearGradient>
          </Reanimated.View>
        )}

      {/* Prerequisites */}
      {lessonContent?.introduction.prerequisites &&
        lessonContent.introduction.prerequisites.length > 0 && (
          <Reanimated.View
            entering={FadeInUp.delay(800).duration(800)}
            style={styles.prerequisitesCard}
          >
            <LinearGradient
              colors={["#fef3c7", "#fde68a", "#fcd34d"]}
              style={styles.prerequisitesGradient}
            >
              <View style={styles.prerequisitesHeader}>
                <LinearGradient
                  colors={["#f59e0b", "#d97706"]}
                  style={styles.prerequisitesIcon}
                >
                  <Ionicons name="library" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.prerequisitesTitle}>Prerequisites</Text>
              </View>

              <Text style={styles.prerequisitesSubtitle}>
                Make sure you&apos;re comfortable with these concepts:
              </Text>

              <View style={styles.prerequisitesList}>
                {lessonContent.introduction.prerequisites.map(
                  (prereq, index) => (
                    <Reanimated.View
                      key={index}
                      entering={SlideInLeft.delay(1000 + index * 100).duration(
                        500
                      )}
                      style={styles.prerequisiteItem}
                    >
                      <LinearGradient
                        colors={["#f59e0b", "#d97706"]}
                        style={styles.prerequisiteIcon}
                      >
                        <Ionicons name="checkmark" size={16} color="white" />
                      </LinearGradient>
                      <Text style={styles.prerequisiteText}>{prereq}</Text>
                    </Reanimated.View>
                  )
                )}
              </View>
            </LinearGradient>
          </Reanimated.View>
        )}

      {/* Call to Action */}
      <Reanimated.View
        entering={FadeInUp.delay(1000).duration(800)}
        style={styles.ctaContainer}
      >
        <TouchableOpacity
          style={styles.startLearningButton}
          onPress={() => handleSectionChange("concepts")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2", "#f093fb"]}
            style={styles.startLearningGradient}
          >
            <Ionicons name="rocket" size={24} color="white" />
            <Text style={styles.startLearningText}>Begin Your Journey</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Reanimated.View>
    </ScrollView>
  );

  const renderConcepts = () => {
    if (!lessonContent?.concepts || lessonContent.concepts.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Reanimated.View
            entering={FadeIn.duration(800)}
            style={styles.emptyState}
          >
            <LinearGradient
              colors={["#f3f4f6", "#e5e7eb"]}
              style={styles.emptyIcon}
            >
              <Ionicons name="construct" size={64} color="#9ca3af" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Concepts Loading...</Text>
            <Text style={styles.emptySubtitle}>
              Mathematical concepts are being prepared for you.
            </Text>
          </Reanimated.View>
        </View>
      );
    }

    const concept = lessonContent.concepts[selectedConcept];
    const isFirst = selectedConcept === 0;
    const isLast = selectedConcept === lessonContent.concepts.length - 1;

    return (
      <ScrollView
        style={styles.sectionContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Concept Progress */}
        <Reanimated.View
          entering={FadeInDown.duration(800)}
          style={styles.conceptProgressCard}
        >
          <LinearGradient
            colors={["#ede9fe", "#ddd6fe", "#c4b5fd"]}
            style={styles.conceptProgressGradient}
          >
            <View style={styles.conceptProgressHeader}>
              <View style={styles.conceptProgressInfo}>
                <Text style={styles.conceptProgressTitle}>
                  Concept {selectedConcept + 1} of{" "}
                  {lessonContent.concepts.length}
                </Text>
                <Text style={styles.conceptProgressSubtitle}>
                  {concept.difficultyLevel.toUpperCase()}
                </Text>
              </View>
              <View style={styles.conceptProgressCircle}>
                <Text style={styles.conceptProgressPercent}>
                  {Math.round(
                    ((selectedConcept + 1) / lessonContent.concepts.length) *
                      100
                  )}
                  %
                </Text>
              </View>
            </View>

            <View style={styles.conceptProgressBarContainer}>
              <View style={styles.conceptProgressBar}>
                <Reanimated.View
                  style={[
                    styles.conceptProgressFill,
                    conceptProgressFillAnimatedStyle,
                  ]}
                />
              </View>
            </View>
          </LinearGradient>
        </Reanimated.View>

        {/* Main Concept Card */}
        <Reanimated.View
          key={selectedConcept}
          entering={SlideInRight.duration(600)}
          style={styles.conceptMainCard}
        >
          <LinearGradient
            colors={["#ffffff", "#f8fafc"]}
            style={styles.conceptMainGradient}
          >
            <View style={styles.conceptHeader}>
              <View style={styles.conceptTitleContainer}>
                <Text style={styles.conceptName}>{concept.name}</Text>
                <View
                  style={[
                    styles.difficultyBadge,
                    concept.difficultyLevel === "beginner" &&
                      styles.beginnerBadge,
                    concept.difficultyLevel === "intermediate" &&
                      styles.intermediateBadge,
                    concept.difficultyLevel === "advanced" &&
                      styles.advancedBadge,
                  ]}
                >
                  <Ionicons
                    name={
                      concept.difficultyLevel === "beginner"
                        ? "leaf"
                        : concept.difficultyLevel === "intermediate"
                        ? "flame"
                        : "flash"
                    }
                    size={14}
                    color="white"
                  />
                  <Text style={styles.difficultyText}>
                    {concept.difficultyLevel.charAt(0).toUpperCase() +
                      concept.difficultyLevel.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.conceptDefinitionCard}>
              <View style={styles.conceptDefinitionHeader}>
                <LinearGradient
                  colors={["#3b82f6", "#1d4ed8"]}
                  style={styles.conceptDefinitionIcon}
                >
                  <Ionicons name="book" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.conceptDefinitionLabel}>Definition</Text>
              </View>
              <Text style={styles.conceptDefinition}>{concept.definition}</Text>
            </View>

            <View style={styles.conceptExplanationCard}>
              <View style={styles.conceptExplanationHeader}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.conceptExplanationIcon}
                >
                  <Ionicons name="bulb" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.conceptExplanationLabel}>Explanation</Text>
              </View>
              <Text style={styles.conceptExplanation}>
                {concept.explanation}
              </Text>
            </View>

            {/* Enhanced Formulas Section */}
            {concept.formulas && concept.formulas.length > 0 && (
              <Reanimated.View
                entering={FadeInUp.delay(200).duration(800)}
                style={styles.formulasSection}
              >
                <Text style={styles.sectionTitle}>Key Formulas</Text>
                {concept.formulas.map((formula, index) => (
                  <Reanimated.View
                    key={index}
                    entering={FadeInUp.delay(300 + index * 150).duration(600)}
                    style={styles.formulaCard}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedFormula(
                          expandedFormula === index ? null : index
                        )
                      }
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={["#eff6ff", "#dbeafe", "#bfdbfe"]}
                        style={styles.formulaGradient}
                      >
                        <View style={styles.formulaHeader}>
                          <LinearGradient
                            colors={["#3b82f6", "#1d4ed8"]}
                            style={styles.formulaIcon}
                          >
                            <Ionicons
                              name="calculator"
                              size={24}
                              color="white"
                            />
                          </LinearGradient>
                          <View style={styles.formulaContent}>
                            <Text style={styles.formulaExpression}>
                              {formula.formula}
                            </Text>
                            <Text style={styles.formulaUseCase}>
                              {formula.useCase}
                            </Text>
                          </View>
                          <Ionicons
                            name={
                              expandedFormula === index
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={24}
                            color="#3b82f6"
                          />
                        </View>

                        {expandedFormula === index && (
                          <Reanimated.View
                            entering={FadeInDown.duration(400)}
                            style={styles.derivationSection}
                          >
                            <Text style={styles.derivationTitle}>
                              How it works:
                            </Text>
                            {formula.derivationSteps.map((step, stepIndex) => (
                              <Reanimated.View
                                key={stepIndex}
                                entering={FadeInRight.delay(
                                  stepIndex * 100
                                ).duration(400)}
                                style={styles.derivationStep}
                              >
                                <View style={styles.stepIndicator}>
                                  <Text style={styles.stepIndicatorText}>
                                    {stepIndex + 1}
                                  </Text>
                                </View>
                                <Text style={styles.derivationStepText}>
                                  {step}
                                </Text>
                              </Reanimated.View>
                            ))}
                          </Reanimated.View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Reanimated.View>
                ))}
              </Reanimated.View>
            )}

            {/* Enhanced Examples Section */}
            {concept.examples && concept.examples.length > 0 && (
              <Reanimated.View
                entering={FadeInUp.delay(400).duration(800)}
                style={styles.examplesSection}
              >
                <Text style={styles.sectionTitle}>Interactive Examples</Text>
                {concept.examples.map((example, index) => (
                  <Reanimated.View
                    key={index}
                    entering={FadeInUp.delay(500 + index * 150).duration(600)}
                    style={styles.exampleCard}
                  >
                    <LinearGradient
                      colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
                      style={styles.exampleGradient}
                    >
                      <View style={styles.exampleHeader}>
                        <LinearGradient
                          colors={["#10b981", "#059669"]}
                          style={styles.exampleIcon}
                        >
                          <Ionicons name="bulb" size={24} color="white" />
                        </LinearGradient>
                        <View style={styles.exampleContent}>
                          <Text style={styles.exampleExpression}>
                            {example.expression}
                          </Text>
                          <Text style={styles.exampleExplanation}>
                            {example.explanation}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.stepsContainer}>
                        <Text style={styles.stepsTitle}>
                          Step-by-step solution:
                        </Text>
                        {example.steps.map((step, stepIndex) => (
                          <Reanimated.View
                            key={stepIndex}
                            entering={FadeInLeft.delay(
                              stepIndex * 100
                            ).duration(400)}
                            style={styles.stepItem}
                          >
                            <LinearGradient
                              colors={["#10b981", "#059669"]}
                              style={styles.stepNumber}
                            >
                              <Text style={styles.stepNumberText}>
                                {stepIndex + 1}
                              </Text>
                            </LinearGradient>
                            <Text style={styles.stepText}>{step}</Text>
                          </Reanimated.View>
                        ))}
                      </View>
                    </LinearGradient>
                  </Reanimated.View>
                ))}
              </Reanimated.View>
            )}

            {/* Enhanced Theorems Section */}
            {lessonContent?.theorems && lessonContent.theorems.length > 0 && (
              <Reanimated.View
                entering={FadeInUp.delay(600).duration(800)}
                style={styles.theoremsSection}
              >
                <Text style={styles.sectionTitle}>Key Theorems</Text>
                {lessonContent.theorems.map((theorem, index) => (
                  <Reanimated.View
                    key={index}
                    entering={FadeInUp.delay(700 + index * 150).duration(600)}
                    style={styles.theoremCard}
                  >
                    <LinearGradient
                      colors={["#fef3c7", "#fde68a", "#fcd34d"]}
                      style={styles.theoremGradient}
                    >
                      <View style={styles.theoremHeader}>
                        <LinearGradient
                          colors={["#f59e0b", "#d97706"]}
                          style={styles.theoremIcon}
                        >
                          <Ionicons name="library" size={24} color="white" />
                        </LinearGradient>
                        <View style={styles.theoremContent}>
                          <Text style={styles.theoremTitle}>
                            {theorem.title}
                          </Text>
                          <Text style={styles.theoremStatement}>
                            {theorem.statement}
                          </Text>
                        </View>
                      </View>

                      {theorem.proof && theorem.proof.length > 0 && (
                        <View style={styles.proofContainer}>
                          <Text style={styles.proofTitle}>Proof:</Text>
                          {theorem.proof.map((proofStep, stepIndex) => (
                            <Reanimated.View
                              key={stepIndex}
                              entering={FadeInLeft.delay(
                                stepIndex * 100
                              ).duration(400)}
                              style={styles.proofStep}
                            >
                              <LinearGradient
                                colors={["#f59e0b", "#d97706"]}
                                style={styles.proofStepNumber}
                              >
                                <Text style={styles.proofStepNumberText}>
                                  {stepIndex + 1}
                                </Text>
                              </LinearGradient>
                              <Text style={styles.proofStepText}>
                                {proofStep}
                              </Text>
                            </Reanimated.View>
                          ))}
                        </View>
                      )}

                      {theorem.applications &&
                        theorem.applications.length > 0 && (
                          <View style={styles.applicationsContainer}>
                            <Text style={styles.applicationsTitle}>
                              Applications:
                            </Text>
                            <View style={styles.applicationsList}>
                              {theorem.applications.map(
                                (application, appIndex) => (
                                  <Reanimated.View
                                    key={appIndex}
                                    entering={FadeInRight.delay(
                                      appIndex * 100
                                    ).duration(400)}
                                    style={styles.applicationItem}
                                  >
                                    <LinearGradient
                                      colors={["#f59e0b", "#d97706"]}
                                      style={styles.applicationIcon}
                                    >
                                      <Ionicons
                                        name="checkmark"
                                        size={12}
                                        color="white"
                                      />
                                    </LinearGradient>
                                    <Text style={styles.applicationText}>
                                      {application}
                                    </Text>
                                  </Reanimated.View>
                                )
                              )}
                            </View>
                          </View>
                        )}
                    </LinearGradient>
                  </Reanimated.View>
                ))}
              </Reanimated.View>
            )}
          </LinearGradient>
        </Reanimated.View>

        {/* Navigation */}
        <View style={styles.conceptNavigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.prevButton,
              isFirst && styles.navButtonDisabled,
            ]}
            onPress={handlePreviousConcept}
            disabled={isFirst}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={isFirst ? "#9ca3af" : "#667eea"}
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
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNextConcept}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isLast ? ["#10b981", "#059669"] : ["#667eea", "#764ba2"]}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {isLast ? "Examples" : "Next"}
              </Text>
              <Ionicons
                name={isLast ? "arrow-forward" : "chevron-forward"}
                size={24}
                color="white"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderWorkedExamples = () => {
    if (
      !lessonContent?.workedExamples ||
      lessonContent.workedExamples.length === 0
    ) {
      return (
        <View style={styles.emptyStateContainer}>
          <Reanimated.View
            entering={FadeIn.duration(800)}
            style={styles.emptyState}
          >
            <LinearGradient
              colors={["#f3f4f6", "#e5e7eb"]}
              style={styles.emptyIcon}
            >
              <Ionicons name="calculator" size={64} color="#9ca3af" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Examples Loading...</Text>
            <Text style={styles.emptySubtitle}>
              Worked examples are being prepared for you.
            </Text>
          </Reanimated.View>
        </View>
      );
    }

    const example = lessonContent.workedExamples[selectedExample];

    return (
      <ScrollView
        style={styles.sectionContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Example Selector */}
        <Reanimated.View
          entering={FadeInDown.duration(800)}
          style={styles.exampleSelector}
        >
          <Text style={styles.exampleSelectorTitle}>Worked Examples</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.exampleTabs}
          >
            {lessonContent.workedExamples.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.exampleTab,
                  selectedExample === index && styles.activeExampleTab,
                ]}
                onPress={() => setSelectedExample(index)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    selectedExample === index
                      ? ["#667eea", "#764ba2"]
                      : ["#f1f5f9", "#e2e8f0"]
                  }
                  style={styles.exampleTabGradient}
                >
                  <Text
                    style={[
                      styles.exampleTabText,
                      selectedExample === index && styles.activeExampleTabText,
                    ]}
                  >
                    Example {index + 1}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Reanimated.View>

        {/* Main Example Card */}
        <Reanimated.View
          key={selectedExample}
          entering={SlideInRight.duration(600)}
          style={styles.workedExampleCard}
        >
          <LinearGradient
            colors={["#ffffff", "#f8fafc"]}
            style={styles.workedExampleGradient}
          >
            {/* Problem Section */}
            <View style={styles.problemSection}>
              <View style={styles.problemHeader}>
                <LinearGradient
                  colors={["#ef4444", "#dc2626"]}
                  style={styles.problemIcon}
                >
                  <Ionicons name="help-circle" size={28} color="white" />
                </LinearGradient>
                <View style={styles.problemHeaderText}>
                  <Text style={styles.problemLabel}>Problem</Text>
                  <View
                    style={[
                      styles.difficultyBadge,
                      example.difficultyLevel === "beginner" &&
                        styles.beginnerBadge,
                      example.difficultyLevel === "intermediate" &&
                        styles.intermediateBadge,
                      example.difficultyLevel === "advanced" &&
                        styles.advancedBadge,
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {example.difficultyLevel}
                    </Text>
                  </View>
                </View>
              </View>
              <LinearGradient
                colors={["#fef2f2", "#fee2e2"]}
                style={styles.problemTextContainer}
              >
                <Text style={styles.problemText}>{example.problem}</Text>
              </LinearGradient>
            </View>

            {/* Solution Section */}
            <View style={styles.solutionSection}>
              <View style={styles.solutionHeader}>
                <LinearGradient
                  colors={["#3b82f6", "#1d4ed8"]}
                  style={styles.solutionIcon}
                >
                  <Ionicons name="construct" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.solutionLabel}>Step-by-Step Solution</Text>
              </View>

              {example.solutionSteps.map((step, index) => (
                <Reanimated.View
                  key={index}
                  entering={FadeInUp.delay(200 + index * 150).duration(600)}
                  style={styles.solutionStep}
                >
                  <LinearGradient
                    colors={["#f8fafc", "#f1f5f9"]}
                    style={styles.solutionStepGradient}
                  >
                    <View style={styles.stepNumberContainer}>
                      <LinearGradient
                        colors={["#3b82f6", "#1d4ed8"]}
                        style={styles.stepNumber}
                      >
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </LinearGradient>
                    </View>
                    <Text style={styles.solutionStepText}>{step}</Text>
                  </LinearGradient>
                </Reanimated.View>
              ))}
            </View>

            {/* Answer Section */}
            <View style={styles.answerSection}>
              <View style={styles.answerHeader}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.answerIcon}
                >
                  <Ionicons name="checkmark-circle" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.answerLabel}>Final Answer</Text>
              </View>
              <LinearGradient
                colors={["#ecfdf5", "#d1fae5", "#a7f3d0"]}
                style={styles.answerBox}
              >
                <Text style={styles.answerText}>{example.answer}</Text>
                <Ionicons name="trophy" size={24} color="#10b981" />
              </LinearGradient>
            </View>
          </LinearGradient>
        </Reanimated.View>

        {/* Navigation */}
        <View style={styles.exampleNavigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.prevButton,
              selectedExample === 0 && styles.navButtonDisabled,
            ]}
            onPress={() => setSelectedExample(Math.max(0, selectedExample - 1))}
            disabled={selectedExample === 0}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={selectedExample === 0 ? "#9ca3af" : "#667eea"}
            />
            <Text
              style={[
                styles.navButtonText,
                selectedExample === 0 && styles.navButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={() => {
              if (selectedExample === lessonContent.workedExamples.length - 1) {
                markSectionComplete("examples");
                handleSectionChange("practice");
              } else {
                setSelectedExample(selectedExample + 1);
              }
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedExample === lessonContent.workedExamples.length - 1
                  ? ["#10b981", "#059669"]
                  : ["#667eea", "#764ba2"]
              }
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {selectedExample === lessonContent.workedExamples.length - 1
                  ? "Continue"
                  : "Next"}
              </Text>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderPractice = () => (
    <ScrollView
      style={styles.sectionContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Practice Header */}
      <Reanimated.View
        entering={FadeInUp.duration(800)}
        style={styles.practiceHeader}
      >
        <LinearGradient
          colors={["#fef3c7", "#fde68a", "#fcd34d"]}
          style={styles.practiceHeaderGradient}
        >
          <LinearGradient
            colors={["#f59e0b", "#d97706"]}
            style={styles.practiceIcon}
          >
            <Ionicons name="fitness" size={36} color="white" />
          </LinearGradient>
          <View style={styles.practiceHeaderText}>
            <Text style={styles.practiceTitle}>Practice Arena</Text>
            <Text style={styles.practiceSubtitle}>
              Master your skills through practice
            </Text>
          </View>
          <View style={styles.practiceStats}>
            <Text style={styles.practiceStatsText}>
              {lessonContent?.practiceExercises?.length || 0}
            </Text>
            <Text style={styles.practiceStatsLabel}>exercises</Text>
          </View>
        </LinearGradient>
      </Reanimated.View>

      {/* Practice Exercises */}
      <Text style={styles.sectionTitle}>Practice Exercises</Text>
      {lessonContent?.practiceExercises?.map((exercise, index) => (
        <Reanimated.View
          key={exercise.exerciseId}
          entering={FadeInUp.delay(200 + index * 150).duration(600)}
          style={styles.exerciseCard}
        >
          <TouchableOpacity
            onPress={() => handleExercisePress(exercise.exerciseId)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#ffffff", "#f8fafc"]}
              style={styles.exerciseGradient}
            >
              <View style={styles.exerciseHeader}>
                <LinearGradient
                  colors={["#8b5cf6", "#7c3aed"]}
                  style={styles.exerciseIcon}
                >
                  <Ionicons name="create" size={28} color="white" />
                </LinearGradient>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>Exercise {index + 1}</Text>
                  <Text style={styles.exerciseDescription}>
                    {exercise.description}
                  </Text>
                  <View style={styles.exerciseMetadata}>
                    <View
                      style={[
                        styles.difficultyBadge,
                        exercise.difficultyLevel === "beginner" &&
                          styles.beginnerBadge,
                        exercise.difficultyLevel === "intermediate" &&
                          styles.intermediateBadge,
                        exercise.difficultyLevel === "advanced" &&
                          styles.advancedBadge,
                      ]}
                    >
                      <Text style={styles.difficultyText}>
                        {exercise.difficultyLevel}
                      </Text>
                    </View>
                    <View style={styles.exerciseTypeBadge}>
                      <Text style={styles.exerciseTypeText}>
                        {exercise.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons
                  name="arrow-forward-circle"
                  size={32}
                  color="#8b5cf6"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Reanimated.View>
      ))}

      {/* Interactive Tools */}
      {lessonContent?.interactiveElements &&
        lessonContent.interactiveElements.length > 0 && (
          <Reanimated.View
            entering={FadeInUp.delay(600).duration(800)}
            style={styles.interactiveSection}
          >
            <Text style={styles.sectionTitle}>Interactive Tools</Text>
            {lessonContent.interactiveElements.map((element, index) => (
              <Reanimated.View
                key={index}
                entering={FadeInUp.delay(700 + index * 150).duration(600)}
                style={styles.interactiveCard}
              >
                <TouchableOpacity
                  onPress={() => handleInteractivePress(element.url)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={["#eff6ff", "#dbeafe", "#bfdbfe"]}
                    style={styles.interactiveGradient}
                  >
                    <LinearGradient
                      colors={["#3b82f6", "#1d4ed8"]}
                      style={styles.interactiveIcon}
                    >
                      <Ionicons name="calculator" size={32} color="white" />
                    </LinearGradient>
                    <View style={styles.interactiveInfo}>
                      <Text style={styles.interactiveTitle}>
                        {element.elementType.toUpperCase()}
                      </Text>
                      <Text style={styles.interactiveInstructions}>
                        {element.instructions}
                      </Text>
                      <View style={styles.interactiveFeatures}>
                        <View style={styles.featureBadge}>
                          <Ionicons name="flash" size={14} color="#3b82f6" />
                          <Text style={styles.interactiveFeatureText}>
                            Interactive
                          </Text>
                        </View>
                        {element.offlineAvailable && (
                          <View style={styles.featureBadge}>
                            <Ionicons
                              name="download"
                              size={14}
                              color="#10b981"
                            />
                            <Text style={styles.interactiveFeatureText}>
                              Offline
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="open-outline" size={28} color="#3b82f6" />
                  </LinearGradient>
                </TouchableOpacity>
              </Reanimated.View>
            ))}
          </Reanimated.View>
        )}

      {/* Complete Lesson Button */}
      <Reanimated.View
        entering={FadeInUp.delay(800).duration(800)}
        style={styles.completeSection}
      >
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteLesson}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#10b981", "#059669", "#047857"]}
            style={styles.completeButtonGradient}
          >
            <Ionicons name="trophy" size={28} color="white" />
            <View style={styles.completeButtonText}>
              <Text style={styles.completeButtonTitle}>Complete Lesson</Text>
              <Text style={styles.completeButtonSubtext}>
                Earn +{lessonContent?.gamification.points} points
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Reanimated.View>

      {/* Lesson Summary */}
      {lessonContent?.summary &&
        (lessonContent.summary.keyTakeaways.length > 0 ||
          lessonContent.summary.suggestedNextTopics.length > 0) && (
          <Reanimated.View
            entering={FadeInUp.delay(900).duration(800)}
            style={styles.summarySection}
          >
            <Text style={styles.sectionTitle}>Lesson Summary</Text>

            {lessonContent.summary.keyTakeaways.length > 0 && (
              <View style={styles.summaryCard}>
                <LinearGradient
                  colors={["#eff6ff", "#dbeafe", "#bfdbfe"]}
                  style={styles.summaryGradient}
                >
                  <View style={styles.summaryHeader}>
                    <LinearGradient
                      colors={["#3b82f6", "#1d4ed8"]}
                      style={styles.summaryIcon}
                    >
                      <Ionicons name="bulb" size={24} color="white" />
                    </LinearGradient>
                    <Text style={styles.summaryTitle}>Key Takeaways</Text>
                  </View>

                  {lessonContent.summary.keyTakeaways.map((takeaway, index) => (
                    <Reanimated.View
                      key={index}
                      entering={FadeInUp.delay(1000 + index * 100).duration(
                        500
                      )}
                      style={styles.takeawayItem}
                    >
                      <LinearGradient
                        colors={["#3b82f6", "#1d4ed8"]}
                        style={styles.takeawayIcon}
                      >
                        <Ionicons name="checkmark" size={14} color="white" />
                      </LinearGradient>
                      <Text style={styles.takeawayText}>{takeaway}</Text>
                    </Reanimated.View>
                  ))}
                </LinearGradient>
              </View>
            )}

            {lessonContent.summary.suggestedNextTopics.length > 0 && (
              <View style={styles.nextTopicsCard}>
                <LinearGradient
                  colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
                  style={styles.nextTopicsGradient}
                >
                  <View style={styles.nextTopicsHeader}>
                    <LinearGradient
                      colors={["#10b981", "#059669"]}
                      style={styles.nextTopicsIcon}
                    >
                      <Ionicons name="arrow-forward" size={24} color="white" />
                    </LinearGradient>
                    <Text style={styles.nextTopicsTitle}>What&apos;s Next?</Text>
                  </View>

                  <View style={styles.nextTopicsList}>
                    {lessonContent.summary.suggestedNextTopics.map(
                      (topic, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.nextTopicItem}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.nextTopicText}>{topic}</Text>
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#10b981"
                          />
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </LinearGradient>
              </View>
            )}
          </Reanimated.View>
        )}
    </ScrollView>
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

  const StunningLoader = () => (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.loadingContainer}>
        <Reanimated.View
          entering={FadeIn.duration(800)}
          style={styles.loadingContent}
        >
          <Reanimated.View
            entering={FadeIn.delay(200).duration(1000)}
            style={styles.loadingIconContainer}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2", "#f093fb", "#f5576c"]}
              style={styles.loadingIconGradient}
            >
              <Ionicons name="calculator" size={64} color="white" />
            </LinearGradient>
          </Reanimated.View>

          <Reanimated.View entering={FadeInUp.delay(400).duration(800)}>
            <Text style={styles.loadingTitle}>Loading Math Lesson</Text>
            <Text style={styles.loadingSubtitle}>
              Preparing your interactive learning experience...
            </Text>
          </Reanimated.View>

          <Reanimated.View
            entering={FadeIn.delay(600).duration(800)}
            style={styles.loadingProgress}
          >
            <View style={styles.loadingProgressBar}>
              <Reanimated.View
                style={[
                  styles.loadingProgressFill,
                  useAnimatedStyle(() => ({
                    width: withTiming("100%", { duration: 3000 }),
                  })),
                ]}
              />
            </View>
            <Text style={styles.loadingProgressText}>
              Connecting to backend...
            </Text>
          </Reanimated.View>
        </Reanimated.View>
      </View>
    </SafeAreaView>
  );

  const ErrorComponent = () => (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.errorContainer}>
        <Reanimated.View
          entering={FadeIn.duration(800)}
          style={styles.errorContent}
        >
          <LinearGradient
            colors={["#fef2f2", "#fee2e2"]}
            style={styles.errorIconContainer}
          >
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
          </LinearGradient>
          <Text style={styles.errorTitle}>Unable to Load Lesson</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.retryButtonGradient}
            >
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.retryButtonText}>Go Back</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Reanimated.View>
      </View>
    </SafeAreaView>
  );

  // Enhanced styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    // Header Styles
    header: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 2,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: theme.typography.h2.fontSize - 4,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h1.fontFamily,
      lineHeight: 28,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.h2.fontFamily,
      marginTop: 4,
    },
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.lg,
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.colors.success,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.success,
      fontFamily: theme.typography.h1.fontFamily,
    },

    // Tab Styles
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingVertical: 5,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 1,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 50,
      marginHorizontal: 3,
      position: "relative",
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
      shadowColor: "#667eea",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    tabText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: "700",
      fontFamily: theme.typography.h1.fontFamily,
    },
    activeTabText: {
      color: "white",
    },

    // Content Styles
    content: {
      flex: 1,
    },
    sectionContent: {
      flex: 1,
      padding: 20,
    },

    // Video Player Styles
    videoContainer: {
      marginBottom: 20,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 2,
    },
    videoPlayer: {
      height: 200,
      justifyContent: "center",
      alignItems: "center",
    },
    videoOverlay: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    playButtonContainer: {
      marginRight: 16,
    },
    playButtonWrapper: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    playButton: {
      width: 60,
      height: 60,
      borderRadius: 42,
      justifyContent: "center",
      alignItems: "center",
    },
    videoInfo: {
      flex: 1,
    },
    videoTitle: {
      fontSize: theme.typography.h2.fontSize - 4,
      fontWeight: "700",
      color: "white",
      fontFamily: theme.typography.h2.fontFamily,
      marginBottom: 10,
      lineHeight: 20,
    },
    videoDuration: {
      fontSize: 13,
      color: "rgba(255,255,255,0.95)",
      fontFamily: "Inter-Medium",
      marginBottom: 16,
    },
    videoFeatures: {
      flexDirection: "row",
      gap: 10,
    },
    featureBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.25)",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 6,
    },
    featureBadgeText: {
      fontSize: 12,
      color: "white",
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
    videoControls: {
      flexDirection: "column",
      gap: 16,
    },
    videoControl: {
      padding: 8,
    },

    // Welcome Card Styles
    welcomeCard: {
      marginBottom: 20,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    welcomeCardGradient: {
      padding: 24,
    },
    welcomeHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    welcomeIcon: {
      width: 40,
      height: 40,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
      shadowColor: "#667eea",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    welcomeTextContainer: {
      flex: 1,
    },
    welcomeTitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
      marginBottom: 4,
    },
    lessonTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h1.fontFamily,
      lineHeight: 32,
    },
    difficultyIndicator: {
      marginLeft: 5,
    },
    difficultyBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      gap: 5,
    },
    beginnerBadge: {
      backgroundColor: theme.colors.success,
    },
    intermediateBadge: {
      backgroundColor: theme.colors.warning,
    },
    advancedBadge: {
      backgroundColor: theme.colors.error,
    },
    difficultyText: {
      fontSize: 10,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
      textTransform: "uppercase",
    },
    lessonOverview: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.body.fontFamily,
      lineHeight: theme.typography.body.lineHeight,
      marginBottom: 20,
      textAlign: "justify",
      letterSpacing: -0.25,
    },
    lessonMetrics: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    metricItem: {
      alignItems: "center",
      gap: 12,
    },
    metricIcon: {
      width: 35,
      height: 35,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    metricValue: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      textAlign: "center",
    },
    metricLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
      textAlign: "center",
    },

    // Objectives Card Styles
    objectivesCard: {
      marginBottom: 20,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#10b981",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    objectivesGradient: {
      padding: 20,
    },
    objectivesHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    objectivesIcon: {
      width: 40,
      height: 40,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 20,
      shadowColor: "#10b981",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 2,
    },
    objectivesTitle: {
      flex: 1,
      fontSize: theme.typography.h2.fontSize,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
    },
    objectivesCount: {
      width: 28,
      height: 28,
      borderRadius: 16,
      backgroundColor: theme.colors.success,
      justifyContent: "center",
      alignItems: "center",
    },
    objectivesCountText: {
      fontSize: 14,
      fontWeight: "800",
      color: "white",
      fontFamily: "Inter-ExtraBold",
    },
    objectiveItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 15,
      backgroundColor: "rgba(255,255,255,0.7)",
      borderRadius: 16,
      padding: 15,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    objectiveNumber: {
      width: 28,
      height: 28,
      borderRadius: 16,
      backgroundColor: theme.colors.success,
      justifyContent: "center",
      alignItems: "center",
    },
    objectiveNumberText: {
      fontSize: 14,
      fontWeight: "700",
      color: "white",
      fontFamily: theme.typography.h2.fontFamily,
    },
    objectiveContent: {
      flex: 1,
    },
    objectiveText: {
      fontSize: theme.typography.bodySmall.fontSize,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      lineHeight: 24,
      marginBottom: 8,
    },
    objectiveProgress: {
      height: 4,
      backgroundColor: theme.colors.success + "20",
      borderRadius: 2,
    },
    objectiveProgressBar: {
      height: "100%",
      backgroundColor: theme.colors.success,
      borderRadius: 2,
      width: "70%",
    },

    // Prerequisites Card Styles
    prerequisitesCard: {
      marginBottom: 28,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#f59e0b",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    prerequisitesGradient: {
      padding: 28,
    },
    prerequisitesHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    prerequisitesIcon: {
      width: 40,
      height: 40,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      shadowColor: "#f59e0b",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 2,
    },
    prerequisitesTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1e293b",
      fontFamily: "Inter-ExtraBold",
    },
    prerequisitesSubtitle: {
      fontSize: 16,
      color: "#64748b",
      fontFamily: "Inter-Regular",
      marginBottom: 20,
      lineHeight: 24,
    },
    prerequisitesList: {
      gap: 12,
    },
    prerequisiteItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.7)",
      borderRadius: 16,
      padding: 16,
      gap: 16,
    },
    prerequisiteIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    prerequisiteText: {
      flex: 1,
      fontSize: 15,
      color: "#374151",
      fontFamily: "Inter-Regular",
      lineHeight: 22,
    },

    // CTA Container
    ctaContainer: {
      marginBottom: 40,
    },
    startLearningButton: {
      borderRadius: 50,
      overflow: "hidden",
      shadowColor: "#667eea",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 2,
    },
    startLearningGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 15,
      paddingHorizontal: 32,
      gap: 16,
    },
    startLearningText: {
      fontSize: theme.typography.button.fontSize,
      fontWeight: "700",
      color: "white",
      fontFamily: theme.typography.button.fontFamily,
    },

    // Concept Progress Card
    conceptProgressCard: {
      marginBottom: 20,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#8b5cf6",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 2,
    },
    conceptProgressGradient: {
      padding: 20,
    },
    conceptProgressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    conceptProgressInfo: {
      flex: 1,
    },
    conceptProgressTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h1.fontFamily,
      marginBottom: 4,
    },
    conceptProgressSubtitle: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Bold",
      backgroundColor: theme.colors.warning + "80",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
    },
    conceptProgressCircle: {
      width: 40,
      height: 40,
      borderRadius: 32,
      backgroundColor: "#8b5cf6",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#8b5cf6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    conceptProgressPercent: {
      fontSize: 14,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
    },
    conceptProgressBarContainer: {
      marginTop: 4,
    },
    conceptProgressBar: {
      height: 5,
      backgroundColor: "rgba(139, 92, 246, 0.2)",
      borderRadius: 5,
      overflow: "hidden",
    },
    conceptProgressFill: {
      height: "100%",
      backgroundColor: "#8b5cf6",
      borderRadius: 5,
    },

    // Main Concept Card
    conceptMainCard: {
      marginBottom: 24,
      borderRadius: 15,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 2,
    },
    conceptMainGradient: {
      padding: 15,
    },
    conceptHeader: {
      marginBottom: 16,
    },
    conceptTitleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    conceptName: {
      flex: 1,
      fontSize: theme.typography.h2.fontSize - 4,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
      lineHeight: 24,
      marginRight: 16,
    },
    conceptDefinitionCard: {
      backgroundColor: "#f8fafc",
      borderRadius: 20,
      padding: 15,
      marginBottom: 10,
      borderWidth: 0.25,
      borderLeftWidth: 6,
      borderColor: "#3b82f6",
    },
    conceptDefinitionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      gap: 12,
    },
    conceptDefinitionIcon: {
      width: 28,
      height: 28,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    conceptDefinitionLabel: {
      fontSize: 14,
      fontWeight: "700",

      fontFamily: theme.typography.h2.fontFamily,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: theme.colors.primary,
    },
    conceptDefinition: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text,
      fontFamily: theme.typography.body.fontFamily,
      lineHeight: 24,
    },
    conceptExplanationCard: {
      backgroundColor: "#f0fdf4",
      borderRadius: 20,
      padding: 15,
      marginBottom: 10,
      borderWidth: 0.25,
      borderLeftWidth: 6,
      borderColor: "#10b981",
    },
    conceptExplanationHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 12,
    },
    conceptExplanationIcon: {
      width: 28,
      height: 28,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    conceptExplanationLabel: {
      fontSize: 14,
      fontWeight: "700",

      fontFamily: theme.typography.h2.fontFamily,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: "#10b981",
    },
    conceptExplanation: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text,
      fontFamily: theme.typography.body.fontFamily,
      lineHeight: 24,
    },

    // Section Title
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-ExtraBold",
      marginBottom: 20,
    },

    // Navigation Styles
    conceptNavigation: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
      gap: 50,
      marginBottom: 40,
    },
    navButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 0,
      paddingHorizontal: 16,
      borderRadius: 50,
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    prevButton: {
      backgroundColor: "#f8fafc",
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    nextButton: {
      flex: 1,
    },
    nextButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 24,
      width: "100%",
      borderRadius: 50,
      gap: 12,
      backgroundColor: theme.colors.primary,
    },
    navButtonDisabled: {
      opacity: 0.5,
    },
    navButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#64748b",
      fontFamily: "Inter-SemiBold",
    },
    navButtonTextDisabled: {
      color: "#9ca3af",
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
    },

    // Example Selector Styles
    exampleSelector: {
      marginBottom: 20,
    },
    exampleSelectorTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1e293b",
      fontFamily: "Inter-ExtraBold",
      marginBottom: 10,
    },
    exampleTabs: {
      paddingVertical: 5,
    },
    exampleTab: {
      marginRight: 16,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 1,
    },
    exampleTabGradient: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    activeExampleTab: {
      backgroundColor: "#3b82f6",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 2,
    },
    exampleTabText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#64748b",
      fontFamily: "Inter-SemiBold",
    },
    activeExampleTabText: {
      color: "white",
    },

    // Worked Example Card Styles
    workedExampleCard: {
      marginBottom: 20,
      borderRadius: 15,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 2,
    },
    workedExampleGradient: {
      padding: 15,
    },
    problemSection: {
      marginBottom: 24,
    },
    problemHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      gap: 16,
    },
    problemIcon: {
      width: 35,
      height: 35,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#ef4444",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    problemHeaderText: {
      flex: 1,
    },
    problemLabel: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h1.fontFamily,
      marginBottom: 8,
    },
    problemTextContainer: {
      borderRadius: 20,
      padding: 20,
      borderLeftWidth: 6,
      borderLeftColor: "#ef4444",
    },
    problemText: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text,
      fontFamily: theme.typography.body.fontFamily,
      lineHeight: theme.typography.body.lineHeight,
      textAlign: "center",
    },
    solutionSection: {
      marginBottom: 20,
    },
    solutionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      gap: 16,
    },
    solutionIcon: {
      width: 35,
      height: 35,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    solutionLabel: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.text,
      fontFamily: theme.typography.h1.fontFamily,
    },
    solutionStep: {
      marginBottom: 10,
      borderRadius: 16,
      overflow: "hidden",
    },
    solutionStepGradient: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      gap: 12,
      borderWidth: 0.25,
      borderColor: theme.colors.border,
    },
    stepNumberContainer: {
      marginTop: 2,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    stepNumberText: {
      fontSize: 12,
      fontWeight: "800",
      color: "white",
      fontFamily: "Inter-ExtraBold",
    },
    solutionStepText: {
      flex: 1,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
      lineHeight: theme.typography.body.lineHeight,
    },
    answerSection: {
      marginTop: 0,
    },
    answerHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      gap: 16,
    },
    answerIcon: {
      width: 35,
      height: 35,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#10b981",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    answerLabel: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h1.fontFamily,
    },
    answerBox: {
      borderRadius: 20,
      padding: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#10b981",
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
    },
    answerText: {
      fontSize: 20,
      fontWeight: "800",
      color: "#10b981",
      fontFamily: "Inter-ExtraBold",
    },

    // Example Navigation
    exampleNavigation: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
      gap: 16,
    },

    // Practice Styles
    practiceHeader: {
      marginBottom: 20,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#f59e0b",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 2,
      borderWidth: 0.5,
      borderColor: "#f59e0b",
    },
    practiceHeaderGradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: 24,
      gap: 24,
    },
    practiceIcon: {
      width: 50,
      height: 50,
      borderRadius: 36,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#f59e0b",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 2,
    },
    practiceHeaderText: {
      flex: 1,
    },
    practiceTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h1.fontFamily,
      marginBottom: 6,
    },
    practiceSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.h2.fontFamily,
    },
    practiceStats: {
      alignItems: "center",
    },
    practiceStatsText: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h1.fontFamily,
    },
    practiceStatsLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.label.fontFamily,
      textTransform: "uppercase",
    },

    // Exercise Card Styles
    exerciseCard: {
      marginBottom: 0,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    exerciseGradient: {
      padding: 20,
    },
    exerciseHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
    },
    exerciseIcon: {
      width: 40,
      height: 40,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#8b5cf6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
      marginBottom: 6,
    },
    exerciseDescription: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.body.fontFamily,
      lineHeight: 22,
      marginBottom: 12,
    },
    exerciseMetadata: {
      flexDirection: "row",
      gap: 12,
    },
    exerciseTypeBadge: {
      backgroundColor: "rgba(139, 92, 246, 0.15)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    exerciseTypeText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#8b5cf6",
      fontFamily: "Inter-Bold",
    },

    // Interactive Section Styles
    interactiveSection: {
      marginTop: 24,
    },
    interactiveCard: {
      marginBottom: 20,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 2,
      borderWidth: 0.5,
      borderColor: "#3b82f6",
    },
    interactiveGradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      gap: 20,
    },
    interactiveIcon: {
      width: 50,
      height: 50,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    interactiveInfo: {
      flex: 1,
    },
    interactiveTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
      marginBottom: 6,
    },
    interactiveInstructions: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.body.fontFamily,
      lineHeight: theme.typography.body.lineHeight,
      marginBottom: 12,
    },
    interactiveFeatures: {
      flexDirection: "row",
      gap: 8,
    },
    interactiveFeatureText: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.primary,
      fontFamily: "Inter-SemiBold",
    },

    // Complete Section Styles
    completeSection: {
      marginTop: 36,
      marginBottom: 24,
    },
    completeButton: {
      borderRadius: 50,
      overflow: "hidden",
      shadowColor: "#10b981",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 2,
    },
    completeButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 28,
      gap: 20,
    },
    completeButtonText: {
      alignItems: "center",
    },
    completeButtonTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "white",
      fontFamily: "Inter-ExtraBold",
      marginBottom: 4,
    },
    completeButtonSubtext: {
      fontSize: 13,
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Inter-Medium",
    },

    // Loading Styles
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      backgroundColor: "#f8fafc",
    },
    loadingContent: {
      alignItems: "center",
      width: "100%",
    },
    loadingIconContainer: {
      marginBottom: 36,
    },
    loadingIconGradient: {
      width: 140,
      height: 140,
      borderRadius: 70,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#667eea",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 16,
    },
    loadingTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: "#1e293b",
      fontFamily: "Inter-ExtraBold",
      textAlign: "center",
      marginBottom: 12,
    },
    loadingSubtitle: {
      fontSize: 18,
      color: "#64748b",
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginBottom: 48,
    },
    loadingProgress: {
      width: "100%",
      alignItems: "center",
    },
    loadingProgressBar: {
      width: "85%",
      height: 8,
      backgroundColor: "#e2e8f0",
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 16,
    },
    loadingProgressFill: {
      height: "100%",
      backgroundColor: "#667eea",
      borderRadius: 4,
    },
    loadingProgressText: {
      fontSize: 14,
      color: "#64748b",
      fontFamily: "Inter-Medium",
    },

    // Error Styles
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      backgroundColor: "#f8fafc",
    },
    errorContent: {
      alignItems: "center",
      width: "100%",
    },
    errorIconContainer: {
      width: 140,
      height: 140,
      borderRadius: 70,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 36,
    },
    errorTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: "#1e293b",
      fontFamily: "Inter-ExtraBold",
      textAlign: "center",
      marginBottom: 12,
    },
    errorSubtitle: {
      fontSize: 16,
      color: "#64748b",
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginBottom: 36,
    },
    retryButton: {
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#667eea",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    retryButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 18,
      paddingHorizontal: 32,
      gap: 12,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
    },

    // Empty State Styles
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      paddingVertical: 80,
    },
    emptyState: {
      alignItems: "center",
      width: "100%",
    },
    emptyIcon: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 28,
    },
    emptyTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: "#1e293b",
      fontFamily: "Inter-ExtraBold",
      textAlign: "center",
      marginBottom: 12,
    },
    emptySubtitle: {
      fontSize: 16,
      color: "#64748b",
      fontFamily: "Inter-Regular",
      textAlign: "center",
      lineHeight: 24,
    },

    // Formula Styles
    formulasSection: {
      marginBottom: 5,
    },
    formulaCard: {
      marginBottom: 20,
      borderRadius: 15,
      overflow: "hidden",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 2,
    },
    formulaGradient: {
      padding: 15,
    },
    formulaHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
    },
    formulaIcon: {
      width: 35,
      height: 35,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    formulaContent: {
      flex: 1,
    },
    formulaExpression: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
      marginBottom: 4,
    },
    formulaUseCase: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      lineHeight: theme.typography.body.lineHeight,
      fontStyle: "italic",
    },
    derivationSection: {
      backgroundColor: "rgba(59, 130, 246, 0.08)",
      borderRadius: 10,
      padding: 15,
      marginTop: 20,
    },
    derivationTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
      marginBottom: 16,
    },
    derivationStep: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 10,
      gap: 15,
    },
    stepIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 2,
    },
    stepIndicatorText: {
      fontSize: 12,
      fontWeight: "700",
      color: "white",
      fontFamily: theme.typography.h2.fontFamily,
    },
    derivationStepText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },

    // Example Styles
    examplesSection: {
      marginBottom: 20,
    },
    exampleCard: {
      marginBottom: 15,
      borderRadius: 15,
      overflow: "hidden",
      shadowColor: "#10b981",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 2,
    },
    exampleGradient: {
      padding: 15,
    },
    exampleHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      gap: 20,
    },
    exampleIcon: {
      width: 35,
      height: 35,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#10b981",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    exampleContent: {
      flex: 1,
    },
    exampleExpression: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
      marginBottom: 6,
    },
    exampleExplanation: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      lineHeight: 22,
    },
    stepsContainer: {
      backgroundColor: "rgba(16, 185, 129, 0.06)",
      borderRadius: 10,
      padding: 15,
    },
    stepsTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
      marginBottom: 15,
    },
    stepItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 15,
      gap: 16,
    },
    stepText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },

    // Theorems Styles
    theoremsSection: {
      marginBottom: 20,
    },
    theoremCard: {
      marginBottom: 15,
      borderRadius: 15,
      overflow: "hidden",
      shadowColor: "#f59e0b",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 2,
    },
    theoremGradient: {
      padding: 15,
    },
    theoremHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 20,
      gap: 20,
    },
    theoremIcon: {
      width: 35,
      height: 35,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#f59e0b",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
      marginTop: 2,
    },
    theoremContent: {
      flex: 1,
    },
    theoremTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
      marginBottom: 8,
    },
    theoremStatement: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      lineHeight: 24,
      fontStyle: "italic",
    },
    proofContainer: {
      backgroundColor: "rgba(245, 158, 11, 0.08)",
      borderRadius: 16,
      padding: 5,
      marginBottom: 16,
    },
    proofTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      marginBottom: 16,
    },
    proofStep: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
      gap: 16,
    },
    proofStepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 2,
    },
    proofStepNumberText: {
      fontSize: 12,
      fontWeight: "700",
      color: "white",
      fontFamily: theme.typography.h2.fontFamily,
    },
    proofStepText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
      lineHeight: 24,
    },
    applicationsContainer: {
      backgroundColor: "rgba(245, 158, 11, 0.05)",
      borderRadius: 16,
      padding: 15,
    },
    applicationsTitle: {
      fontSize: 16,
      fontWeight: "700",
      color:theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
      marginBottom: 16,
    },
    applicationsList: {
      gap: 12,
    },
    applicationItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    applicationIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 2,
    },
    applicationText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    // Summary Styles
    summarySection: {
      marginTop: 24,
      marginBottom: 20,
    },
    summaryCard: {
      marginBottom: 20,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 2,
    },
    summaryGradient: {
      padding: 20,
    },
    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 16,
    },
    summaryIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    summaryTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
    },
    takeawayItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
      gap: 12,
    },
    takeawayIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 2,
    },
    takeawayText: {
      flex: 1,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text,
      fontFamily: theme.typography.body.fontFamily,
      lineHeight: theme.typography.body.lineHeight,
    },
    nextTopicsCard: {
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#10b981",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 2,
    },
    nextTopicsGradient: {
      padding: 20,
    },
    nextTopicsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 16,
    },
    nextTopicsIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#10b981",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    nextTopicsTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: theme.typography.h2.fontFamily,
    },
    nextTopicsList: {
      gap: 8,
    },
    nextTopicItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "rgba(255,255,255,0.7)",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    nextTopicText: {
      flex: 1,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text,
      fontFamily: theme.typography.body.fontFamily,
    },
  });

  // Show loading state
  if (isLoading) {
    return <StunningLoader />;
  }

  // Show error state
  if (error) {
    return <ErrorComponent />;
  }

  // Show empty state if no lesson content
  if (!lessonContent) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.errorContainer}>
          <Reanimated.View
            entering={FadeIn.duration(800)}
            style={styles.errorContent}
          >
            <LinearGradient
              colors={["#f3f4f6", "#e5e7eb"]}
              style={styles.errorIconContainer}
            >
              <Ionicons name="document-text" size={64} color="#9ca3af" />
            </LinearGradient>
            <Text style={styles.errorTitle}>Lesson Not Found</Text>
            <Text style={styles.errorSubtitle}>
              The requested math lesson could not be loaded from the backend.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.back()}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.retryButtonGradient}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
                <Text style={styles.retryButtonText}>Go Back</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Reanimated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Enhanced Header */}
      <Reanimated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#64748b" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{lessonContent.title}</Text>
            <Text style={styles.subtitle}>
              Math Lesson • {lessonContent.duration} min • 🌐
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Reanimated.View
              style={[styles.progressFill, progressAnimatedStyle]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(overallProgress)}%
          </Text>
        </View>
      </Reanimated.View>

      {/* Enhanced Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: "introduction", label: "Intro", icon: "play-circle" },
          { key: "concepts", label: "Learn", icon: "school" },
          { key: "examples", label: "Examples", icon: "calculator" },
          { key: "practice", label: "Practice", icon: "fitness" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, currentSection === tab.key && styles.activeTab]}
            onPress={() => handleSectionChange(tab.key as any)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                currentSection === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {completedSections.has(tab.key) && (
              <View style={{ position: "absolute", top: 6, right: 6 }}>
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderSectionContent()}</View>
    </SafeAreaView>
  );
}
