"use client";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourseContentsBySubject } from "../../../src/hooks/learning/useCourseContent";
import { useTheme } from "../../../src/utils/ThemeContext";
// import type { CourseContent } from "../../../src/types/learning/course.content.types";


// Dynamic course content based on topicId
const COURSE_CONTENT_BY_TOPIC = {
  topic_algebra: {
    _id: "course_algebra_001",
    examId: ["exam_001"],
    subjectId: "math_001",
    topicId: ["topic_algebra"],
    series: ["D"],
    title: "Algebra Fundamentals Course",
    description:
      "Comprehensive algebra course covering expressions, equations, and functions with practical applications",
    level: "intermediate",
    modules: [
      {
        id: "module_1",
        title: "Basic Algebraic Expressions",
        description:
          "Learn to work with variables, coefficients, and simple expressions",
        order: 1,
        series: "D",
        lessons: ["lesson_001", "lesson_002", "lesson_003"],
        exerciseIds: ["exercise_001", "exercise_002"],
        assessment: null,
        progressTracking: {
          completedLessons: 0,
          totalLessons: 1,
          lastAccessedAt: null,
        },
        estimatedDuration: 45,
        prerequisites: [],
        isLocked: false,
        unlockConditions: {
          requiredModules: [],
          minimumScore: 0,
        },
      },
      {
        id: "module_2",
        title: "Linear Equations",
        description: "Solve single and multi-step linear equations",
        order: 2,
        series: "D",
        lessons: [],
        exerciseIds: ["exercise_003"],
        assessment: null,
        progressTracking: {
          completedLessons: 0,
          totalLessons: 0,
          lastAccessedAt: null,
        },
        estimatedDuration: 60,
        prerequisites: ["Basic Algebraic Expressions"],
        isLocked: true,
        unlockConditions: {
          requiredModules: ["module_1"],
          minimumScore: 75,
        },
      },
      {
        id: "module_3",
        title: "Quadratic Functions",
        description: "Explore parabolas, vertex form, and quadratic equations",
        order: 3,
        series: "D",
        lessons: [],
        exerciseIds: ["exercise_004", "exercise_005"],
        assessment: "assessment_001",
        progressTracking: {
          completedLessons: 0,
          totalLessons: 0,
          lastAccessedAt: null,
        },
        estimatedDuration: 90,
        prerequisites: ["Linear Equations"],
        isLocked: true,
        unlockConditions: {
          requiredModules: ["module_1", "module_2"],
          minimumScore: 80,
        },
      },
    ],
    prerequisites: ["Basic Mathematics"],
    estimatedDuration: 195,
    progressTracking: {
      completedLessons: 0,
      totalLessons: 1,
      lastAccessedAt: null,
      averageCompletionTime: 0,
    },
    accessibilityOptions: {
      languages: ["french"],
      formats: ["text", "video"],
      accommodations: [],
      hasAudioVersion: false,
      hasBrailleVersion: false,
      screenReaderFriendly: true,
    },
    premiumOnly: false,
    accessType: "free",
    analytics: {
      enrollmentCount: 1250,
      completionRate: 68,
      averageRating: 4.6,
      totalViews: 15420,
      lastViewedAt: new Date(),
    },
    isActive: true,
    isArchived: false,
  },
  topic_mechanics: {
    _id: "course_mechanics_001",
    examId: ["exam_001"],
    subjectId: "physics_001",
    topicId: ["topic_mechanics"],
    series: ["D"],
    title: "Classical Mechanics Course",
    description:
      "Master the fundamentals of motion, forces, energy, and momentum in classical physics",
    level: "intermediate",
    modules: [
      {
        id: "module_1",
        title: "Kinematics and Motion",
        description:
          "Study position, velocity, acceleration, and motion in one and two dimensions",
        order: 1,
        series: "D",
        lessons: ["lesson_physics_001", "lesson_physics_002"],
        exerciseIds: ["exercise_physics_001", "exercise_physics_002"],
        assessment: null,
        progressTracking: {
          completedLessons: 0,
          totalLessons: 2,
          lastAccessedAt: null,
        },
        estimatedDuration: 60,
        prerequisites: [],
        isLocked: false,
        unlockConditions: {
          requiredModules: [],
          minimumScore: 0,
        },
      },
      {
        id: "module_2",
        title: "Newton's Laws of Motion",
        description:
          "Understand forces, mass, acceleration, and Newton's three laws",
        order: 2,
        series: "D",
        lessons: ["lesson_physics_003"],
        exerciseIds: ["exercise_physics_003", "exercise_physics_004"],
        assessment: null,
        progressTracking: {
          completedLessons: 0,
          totalLessons: 1,
          lastAccessedAt: null,
        },
        estimatedDuration: 75,
        prerequisites: ["Kinematics and Motion"],
        isLocked: true,
        unlockConditions: {
          requiredModules: ["module_1"],
          minimumScore: 70,
        },
      },
      {
        id: "module_3",
        title: "Work, Energy, and Power",
        description:
          "Explore kinetic energy, potential energy, and conservation laws",
        order: 3,
        series: "D",
        lessons: [],
        exerciseIds: ["exercise_physics_005"],
        assessment: "assessment_physics_001",
        progressTracking: {
          completedLessons: 0,
          totalLessons: 0,
          lastAccessedAt: null,
        },
        estimatedDuration: 90,
        prerequisites: ["Newton's Laws of Motion"],
        isLocked: true,
        unlockConditions: {
          requiredModules: ["module_1", "module_2"],
          minimumScore: 75,
        },
      },
    ],
    prerequisites: ["Basic Mathematics", "Basic Physics Concepts"],
    estimatedDuration: 225,
    progressTracking: {
      completedLessons: 0,
      totalLessons: 3,
      lastAccessedAt: null,
      averageCompletionTime: 0,
    },
    accessibilityOptions: {
      languages: ["french"],
      formats: ["text", "video"],
      accommodations: [],
      hasAudioVersion: false,
      hasBrailleVersion: false,
      screenReaderFriendly: true,
    },
    premiumOnly: false,
    accessType: "free",
    analytics: {
      enrollmentCount: 980,
      completionRate: 72,
      averageRating: 4.4,
      totalViews: 12300,
      lastViewedAt: new Date(),
    },
    isActive: true,
    isArchived: false,
  },
  topic_thermodynamics: {
    _id: "course_thermodynamics_001",
    examId: ["exam_001"],
    subjectId: "physics_001",
    topicId: ["topic_thermodynamics"],
    series: ["D"],
    title: "Thermodynamics Course",
    description:
      "Study heat, temperature, energy transfer, and the laws of thermodynamics",
    level: "advanced",
    modules: [
      {
        id: "module_1",
        title: "Temperature and Heat",
        description:
          "Understand thermal equilibrium, temperature scales, and heat transfer",
        order: 1,
        series: "D",
        lessons: [],
        exerciseIds: [],
        assessment: null,
        progressTracking: {
          completedLessons: 0,
          totalLessons: 0,
          lastAccessedAt: null,
        },
        estimatedDuration: 45,
        prerequisites: ["Classical Mechanics"],
        isLocked: true,
        unlockConditions: {
          requiredModules: [],
          minimumScore: 80,
        },
      },
    ],
    prerequisites: ["Classical Mechanics"],
    estimatedDuration: 180,
    progressTracking: {
      completedLessons: 0,
      totalLessons: 0,
      lastAccessedAt: null,
      averageCompletionTime: 0,
    },
    accessibilityOptions: {
      languages: ["french"],
      formats: ["text"],
      accommodations: [],
      hasAudioVersion: false,
      hasBrailleVersion: false,
      screenReaderFriendly: true,
    },
    premiumOnly: true,
    accessType: "premium",
    analytics: {
      enrollmentCount: 450,
      completionRate: 58,
      averageRating: 4.7,
      totalViews: 5800,
      lastViewedAt: new Date(),
    },
    isActive: true,
    isArchived: false,
  },
  topic_atomic_structure: {
    _id: "course_chemistry_001",
    examId: ["exam_001"],
    subjectId: "chemistry_001",
    topicId: ["topic_atomic_structure"],
    series: ["D"],
    title: "Atomic Structure Course",
    description:
      "Explore atoms, electrons, protons, neutrons, and the periodic table",
    level: "beginner",
    modules: [
      {
        id: "module_1",
        title: "Atoms and Subatomic Particles",
        description:
          "Learn about protons, neutrons, electrons, and atomic models",
        order: 1,
        series: "D",
        lessons: ["lesson_chem_001"],
        exerciseIds: ["exercise_chem_001"],
        assessment: null,
        progressTracking: {
          completedLessons: 0,
          totalLessons: 1,
          lastAccessedAt: null,
        },
        estimatedDuration: 50,
        prerequisites: [],
        isLocked: false,
        unlockConditions: {
          requiredModules: [],
          minimumScore: 0,
        },
      },
    ],
    prerequisites: [],
    estimatedDuration: 140,
    progressTracking: {
      completedLessons: 0,
      totalLessons: 1,
      lastAccessedAt: null,
      averageCompletionTime: 0,
    },
    accessibilityOptions: {
      languages: ["french"],
      formats: ["text", "video"],
      accommodations: [],
      hasAudioVersion: false,
      hasBrailleVersion: false,
      screenReaderFriendly: true,
    },
    premiumOnly: false,
    accessType: "free",
    analytics: {
      enrollmentCount: 1100,
      completionRate: 75,
      averageRating: 4.5,
      totalViews: 14200,
      lastViewedAt: new Date(),
    },
    isActive: true,
    isArchived: false,
  },
  topic_cell_biology: {
    _id: "course_biology_001",
    examId: ["exam_001"],
    subjectId: "biology_001",
    topicId: ["topic_cell_biology"],
    series: ["D"],
    title: "Cell Biology Course",
    description:
      "Study cell structure, organelles, cellular processes, and cell division",
    level: "beginner",
    modules: [
      {
        id: "module_1",
        title: "Cell Structure and Organelles",
        description: "Explore the components of plant and animal cells",
        order: 1,
        series: "D",
        lessons: [],
        exerciseIds: ["exercise_bio_001"],
        assessment: null,
        progressTracking: {
          completedLessons: 0,
          totalLessons: 0,
          lastAccessedAt: null,
        },
        estimatedDuration: 40,
        prerequisites: [],
        isLocked: false,
        unlockConditions: {
          requiredModules: [],
          minimumScore: 0,
        },
      },
    ],
    prerequisites: [],
    estimatedDuration: 160,
    progressTracking: {
      completedLessons: 0,
      totalLessons: 0,
      lastAccessedAt: null,
      averageCompletionTime: 0,
    },
    accessibilityOptions: {
      languages: ["french"],
      formats: ["text"],
      accommodations: [],
      hasAudioVersion: false,
      hasBrailleVersion: false,
      screenReaderFriendly: true,
    },
    premiumOnly: false,
    accessType: "free",
    analytics: {
      enrollmentCount: 890,
      completionRate: 68,
      averageRating: 4.3,
      totalViews: 11200,
      lastViewedAt: new Date(),
    },
    isActive: true,
    isArchived: false,
  },
};

export default function CourseContentScreen() {
  const router = useRouter();
  const { topicId, topicName, subjectId } = useLocalSearchParams();
  const [expandedModule, setExpandedModule] = useState<string | null>(
    "module_1"
  );
  const { theme } = useTheme();

  // FIX: Ensure all parameters are properly converted to strings
  const validSubjectId = useMemo(() => {
    if (Array.isArray(subjectId)) {
      return subjectId[0] || "";
    }
    return typeof subjectId === 'string' ? subjectId : "";
  }, [subjectId]);

  const validTopicId = useMemo(() => {
    if (Array.isArray(topicId)) {
      return topicId[0] || "";
    }
    return typeof topicId === 'string' ? topicId : "";
  }, [topicId]);

  // FIX: Updated options to include topicId for better filtering
  const courseContentOptions = useMemo(
    () => ({
      topicId: validTopicId,
      sortBy: "title" as const,
      sortOrder: "asc" as const,
      isActive: true,
    }),
    [validTopicId]
  );

  // FIX: Use validSubjectId and ensure topicId filtering works
  const {
    courseContents: backendCourseContents,
    isLoading,
    error,
  } = useCourseContentsBySubject(validSubjectId, courseContentOptions);

  // FIX: Improved data processing logic
  const { courseContentData, isBackendData } = useMemo(() => {
    if (
      backendCourseContents &&
      backendCourseContents.length > 0 &&
      !isLoading &&
      !error
    ) {
      console.log("🔍 CourseContentScreen - Processing backend data:", backendCourseContents.length, "items");
      console.log("🔍 CourseContentScreen - Looking for topicId:", validTopicId);
      
      // FIX: Better filtering strategy
      let foundCourseContent = null;
      
      // Strategy 1: Find exact match by topicId
      for (const content of backendCourseContents) {
        const topicIdArray = Array.isArray(content.topicId) 
          ? content.topicId 
          : [content.topicId];
        
        const hasMatchingTopic = topicIdArray.some(id => {
          // Handle both string IDs and object IDs
          const idString = typeof id === 'object' && id !== null ? (id as any)._id || String(id) : String(id);
          const matches = idString === validTopicId;
          console.log("🔍 Comparing:", idString, "with", validTopicId, "=>", matches);
          return matches;
        });
        
        if (hasMatchingTopic) {
          foundCourseContent = content;
          console.log("🔍 Found matching course content:", content.title);
          break;
        }
      }
      
      // Strategy 2: If no exact match, check if we should use the first available content
      if (!foundCourseContent && backendCourseContents.length > 0) {
        console.log("🔍 No exact topic match, checking if content is topic-agnostic");
        // Only use first content if it seems to be general content for the subject
        const firstContent = backendCourseContents[0];
        if (!firstContent.topicId || firstContent.topicId.length === 0) {
          foundCourseContent = firstContent;
          console.log("🔍 Using general subject content");
        }
      }

      if (foundCourseContent) {
        // FIX: Ensure modules have the correct structure
        const processedModules = (foundCourseContent.modules || []).map((module, index) => ({
          id: module.id || `module_${index + 1}`,
          title: module.title || `Module ${index + 1}`,
          description: module.description || "Module description",
          order: module.order || index + 1,
          series: module.series || "D",
          lessons: Array.isArray(module.lessons) ? module.lessons : [],
          exerciseIds: Array.isArray(module.exerciseIds) ? module.exerciseIds : [],
          assessment: module.assessment || null,
          progressTracking: {
            completedLessons: module.progressTracking?.completedLessons || 0,
            totalLessons: module.progressTracking?.totalLessons || (module.lessons ? module.lessons.length : 0),
            lastAccessedAt: module.progressTracking?.lastAccessedAt || null,
          },
          estimatedDuration: module.estimatedDuration || 60,
          prerequisites: Array.isArray(module.prerequisites) ? module.prerequisites : [],
          isLocked: module.isLocked !== undefined ? module.isLocked : false,
          unlockConditions: {
            requiredModules: module.unlockConditions?.requiredModules || [],
            minimumScore: module.unlockConditions?.minimumScore || 0,
          },
        }));

        const transformedContent = {
          _id: foundCourseContent._id,
          examId: foundCourseContent.examId || [],
          subjectId: foundCourseContent.subjectId,
          topicId: foundCourseContent.topicId || [],
          series: foundCourseContent.series || ["D"],
          title: foundCourseContent.title,
          description: foundCourseContent.description,
          level: foundCourseContent.level || "beginner",
          modules: processedModules,
          prerequisites: Array.isArray(foundCourseContent.prerequisites) ? foundCourseContent.prerequisites : [],
          estimatedDuration: foundCourseContent.estimatedDuration || 0,
          progressTracking: {
            completedLessons: foundCourseContent.progressTracking?.completedLessons || 0,
            totalLessons: foundCourseContent.progressTracking?.totalLessons || processedModules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0),
            lastAccessedAt: foundCourseContent.progressTracking?.lastAccessedAt || null,
            averageCompletionTime: foundCourseContent.progressTracking?.averageCompletionTime || 0,
          },
          accessibilityOptions: foundCourseContent.accessibilityOptions || {
            languages: ["french"],
            formats: ["text"],
            accommodations: [],
            hasAudioVersion: false,
            hasBrailleVersion: false,
            screenReaderFriendly: true,
          },
          premiumOnly: foundCourseContent.premiumOnly || false,
          accessType: foundCourseContent.accessType || "free",
          analytics: foundCourseContent.analytics || {
            enrollmentCount: 0,
            completionRate: 0,
            averageRating: 0,
            totalViews: 0,
            lastViewedAt: new Date(),
          },
          isActive: foundCourseContent.isActive !== false,
          isArchived: foundCourseContent.isArchived || false,
        };

        return {
          courseContentData: transformedContent,
          isBackendData: true,
        };
      } else {
        // FIX: No matching course content found for this topic
        console.warn(`No course content found for topicId: ${validTopicId} in subject: ${validSubjectId}`);
        return {
          courseContentData: {
            _id: `course_${validTopicId}_notfound`,
            title: `${topicName} Course`,
            description: `Course content for ${topicName} is not yet available. This topic may be under development or the content hasn't been created yet.`,
            modules: [],
            estimatedDuration: 0,
            analytics: {
              enrollmentCount: 0,
              completionRate: 0,
              averageRating: 0,
              totalViews: 0,
              lastViewedAt: new Date(),
            },
            progressTracking: {
              completedLessons: 0,
              totalLessons: 0,
              lastAccessedAt: null,
              averageCompletionTime: 0,
            },
            accessibilityOptions: {
              languages: ["french"],
              formats: ["text"],
              accommodations: [],
              hasAudioVersion: false,
              hasBrailleVersion: false,
              screenReaderFriendly: true,
            },
            premiumOnly: false,
            accessType: "free",
            isActive: true,
            isArchived: false,
          },
          isBackendData: false,
        };
      }
    }

    // FIX: Improved mock data fallback with better error messaging
    console.log("🔍 CourseContentScreen - Using mock data for topicId:", validTopicId);
    const mockContent = COURSE_CONTENT_BY_TOPIC[validTopicId as keyof typeof COURSE_CONTENT_BY_TOPIC];
    
    if (!mockContent) {
      console.warn(`No mock course content found for topicId: ${validTopicId}`);
      return {
        courseContentData: {
          _id: "course_default",
          title: `${topicName} Course`,
          description: `Course content for ${topicName} is being prepared and will be available soon. This topic may be new or under development.`,
          modules: [],
          estimatedDuration: 0,
          analytics: {
            enrollmentCount: 0,
            completionRate: 0,
            averageRating: 0,
            totalViews: 0,
            lastViewedAt: new Date(),
          },
          progressTracking: {
            completedLessons: 0,
            totalLessons: 0,
            lastAccessedAt: null,
            averageCompletionTime: 0,
          },
          accessibilityOptions: {
            languages: ["french"],
            formats: ["text"],
            accommodations: [],
            hasAudioVersion: false,
            hasBrailleVersion: false,
            screenReaderFriendly: true,
          },
          premiumOnly: false,
          accessType: "free",
          isActive: true,
          isArchived: false,
        },
        isBackendData: false,
      };
    }
    
    return {
      courseContentData: mockContent,
      isBackendData: false,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendCourseContents, isLoading, error, validTopicId, topicName]);

  // FIX: Updated console logs to use valid parameters
  console.log("📚 CourseContentScreen - Using data source:", isBackendData ? "Backend" : "Mock");
  console.log("📚 CourseContentScreen - Loading:", isLoading);
  console.log("📚 CourseContentScreen - Error:", error);
  console.log("📚 CourseContentScreen - Topic ID:", validTopicId);
  console.log("📚 CourseContentScreen - Subject ID:", validSubjectId);
  console.log("📚 CourseContentScreen - Found course content:", !!courseContentData);

  const courseContent = courseContentData;

  const handleModulePress = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleLessonPress = (lessonId: string, moduleId: string) => {
    router.push(
      `/(routes)/learning/lessons/base-lesson?lessonId=${lessonId}&moduleId=${moduleId}`
    );
  };

  const handleExercisePress = (exerciseId: string) => {
    // TODO: Navigate to exercise screen
    console.log(`Navigate to exercise: ${exerciseId}`);
  };

  const handleNotesPress = () => {
    router.push(
      `/(routes)/learning/notes?topicId=${topicId}&topicName=${topicName}`
    );
  };

  const handleResourcesPress = () => {
    router.push(
      `/(routes)/learning/resources?topicId=${topicId}&topicName=${topicName}`
    );
  };

  const handleBookmarksPress = () => {
    router.push(
      `/(routes)/learning/bookmarks?topicId=${topicId}&topicName=${topicName}`
    );
  };

  const renderModuleCard = ({
    item: module,
  }: {
    item: any; // Updated to handle dynamic content
  }) => {
    const isExpanded = expandedModule === module.id;
    const hasLessons = module.lessons?.length > 0;
    const completionPercentage =
      module.progressTracking?.totalLessons > 0
        ? Math.round(
            (module.progressTracking.completedLessons /
              module.progressTracking.totalLessons) *
              100
          )
        : 0;

    return (
      <Animated.View entering={FadeIn.duration(300)}>
        <View style={[styles.moduleCard, module.isLocked && styles.lockedCard]}>
          <TouchableOpacity
            style={styles.moduleHeader}
            onPress={() => !module.isLocked && handleModulePress(module.id)}
            activeOpacity={module.isLocked ? 1 : 0.8}
          >
            <View style={styles.moduleInfo}>
              <View style={styles.moduleTitle}>
                <Text
                  style={[
                    styles.moduleName,
                    module.isLocked && styles.lockedText,
                  ]}
                >
                  {module.title}
                </Text>
                {module.isLocked && (
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.moduleDescription,
                  module.isLocked && styles.lockedText,
                ]}
              >
                {module.description}
              </Text>

              {!module.isLocked && (
                <View style={styles.moduleStats}>
                  <View style={styles.stat}>
                    <Ionicons
                      name="time"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.statText}>
                      {module.estimatedDuration} min
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons
                      name="book"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.statText}>
                      {module.lessons?.length || 0} Lessons
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons
                      name="create"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.statText}>
                      {module.exerciseIds?.length || 0} Exercises
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.moduleRight}>
              {!module.isLocked && (
                <>
                  <View style={styles.progressCircle}>
                    <Text style={styles.progressText}>
                      {completionPercentage}%
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </>
              )}
            </View>
          </TouchableOpacity>

          {isExpanded && !module.isLocked && (
            <View style={styles.moduleContent}>
              {hasLessons && (
                <View style={styles.lessonsSection}>
                  <Text style={styles.sectionTitle}>Lessons</Text>
                  {module.lessons.map((lessonId: string, index: number) => (
                    <TouchableOpacity
                      key={lessonId}
                      style={styles.lessonItem}
                      onPress={() => handleLessonPress(lessonId, module.id)}
                    >
                      <View style={styles.lessonIcon}>
                        <Ionicons
                          name="play-circle"
                          size={20}
                          color={theme.colors.primary}
                        />
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={styles.lessonTitle}>
                          Lesson {index + 1}:{" "}
                          {getlessonTitle(topicId as string, index)}
                        </Text>
                        <Text style={styles.lessonDuration}>
                          15 min • {getSubjectName(topicId as string)} Lesson
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {(module.exerciseIds?.length || 0) > 0 && (
                <View style={styles.exercisesSection}>
                  <Text style={styles.sectionTitle}>Practice Exercises</Text>
                  {module.exerciseIds.map(
                    (exerciseId: string, index: number) => (
                      <TouchableOpacity
                        key={exerciseId}
                        style={styles.exerciseItem}
                        onPress={() => handleExercisePress(exerciseId)}
                      >
                        <View style={styles.exerciseIcon}>
                          <Ionicons
                            name="create"
                            size={18}
                            color={theme.colors.success}
                          />
                        </View>
                        <View style={styles.exerciseInfo}>
                          <Text style={styles.exerciseTitle}>
                            Exercise {index + 1}
                          </Text>
                          <Text style={styles.exerciseDifficulty}>
                            Medium • 10 questions
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={theme.colors.textSecondary}
                        />
                      </TouchableOpacity>
                    )
                  )}
                </View>
              )}
            </View>
          )}

          {module.isLocked && (
            <View style={styles.unlockRequirements}>
              <Text style={styles.unlockTitle}>Unlock Requirements:</Text>
              {module.unlockConditions?.requiredModules?.map(
                (reqModule: string) => (
                  <Text key={reqModule} style={styles.unlockText}>
                    • Complete {reqModule}
                  </Text>
                )
              )}
              {(module.unlockConditions?.minimumScore || 0) > 0 && (
                <Text style={styles.unlockText}>
                  • Score at least {module.unlockConditions.minimumScore}%
                </Text>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  // Helper functions to get dynamic content
  const getSubjectName = (topicId: string) => {
    if (topicId.includes("algebra") || topicId.includes("geometry"))
      return "Math";
    if (topicId.includes("mechanics") || topicId.includes("thermodynamics"))
      return "Physics";
    if (topicId.includes("atomic")) return "Chemistry";
    if (topicId.includes("cell")) return "Biology";
    return "Subject";
  };

  const getlessonTitle = (topicId: string, index: number) => {
    const titles = {
      topic_algebra: [
        "Introduction to Algebra",
        "Variables and Constants",
        "Basic Operations",
      ],
      topic_mechanics: ["Motion Basics", "Velocity and Acceleration"],
      topic_atomic_structure: ["Atomic Models"],
      topic_cell_biology: ["Cell Components"],
    };
    return (
      titles[topicId as keyof typeof titles]?.[index] ||
      `Topic Overview ${index + 1}`
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      marginRight: 16,
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.text,
      fontFamily: "Inter-ExtraBold",
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    courseInfo: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 16,
    },
    courseTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    courseDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      lineHeight: 20,
      marginBottom: 12,
    },
    courseStats: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    courseStat: {
      alignItems: "center",
    },
    courseStatValue: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    courseStatLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    quickActions: {
      flexDirection: "row",
      gap: 12,
      padding: 20,
    },
    quickAction: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    quickActionIcon: {
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
    },
    content: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    moduleCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    lockedCard: {
      backgroundColor: theme.colors.background,
      opacity: 0.7,
    },
    moduleHeader: {
      flexDirection: "row",
      padding: 20,
      alignItems: "flex-start",
    },
    moduleInfo: {
      flex: 1,
      marginRight: 12,
    },
    moduleTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    moduleName: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    moduleDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      lineHeight: 20,
      marginBottom: 12,
    },
    lockedText: {
      color: theme.colors.textSecondary,
    },
    moduleStats: {
      flexDirection: "row",
      gap: 16,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
    },
    moduleRight: {
      alignItems: "center",
      gap: 8,
    },
    progressCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    progressText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
      fontFamily: "Inter-SemiBold",
    },
    moduleContent: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    lessonsSection: {
      marginBottom: 16,
    },
    lessonItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    lessonIcon: {
      marginRight: 12,
    },
    lessonInfo: {
      flex: 1,
    },
    lessonTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    lessonDuration: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    exercisesSection: {
      marginTop: 16,
    },
    exerciseItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
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
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
    },
    exerciseDifficulty: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    unlockRequirements: {
      backgroundColor: theme.colors.warning,
      margin: 20,
      marginTop: 0,
      padding: 16,
      borderRadius: 12,
    },
    unlockTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    unlockText: {
      fontSize: 12,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
      marginBottom: 4,
    },
    prerequisitesSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    prerequisitesTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      marginBottom: 12,
    },
    prerequisitesList: {
      gap: 8,
    },
    prerequisiteItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    prerequisiteText: {
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
    },
    scrollContent: {
      padding: 20,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      fontFamily: "Inter-SemiBold",
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      backgroundColor: theme.colors.background,
    },
    loadingContent: {
      alignItems: "center",
      width: "100%",
    },
    loadingIconContainer: {
      marginBottom: 30,
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 50,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    loadingTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
      textAlign: "center",
      marginBottom: 8,
    },
    loadingSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginBottom: 40,
    },
    loadingDotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    loadingDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
  });

  const CourseContentLoader = () => {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{topicName}</Text>
              <Text style={styles.subtitle}>Loading Course Content...</Text>
            </View>
          </View>
        </View>

        {/* Loading Content */}
        <View style={styles.loadingContainer}>
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.loadingContent}
          >
            <Animated.View
              entering={FadeIn.delay(200).duration(600)}
              style={styles.loadingIconContainer}
            >
              <Ionicons
                name="play-circle"
                size={48}
                color={theme.colors.primary}
              />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(400).duration(600)}>
              <Text style={styles.loadingTitle}>Loading Course</Text>
              <Text style={styles.loadingSubtitle}>
                Fetching {topicName} content...
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeIn.delay(600).duration(600)}
              style={styles.loadingDotsContainer}
            >
              {[1, 2, 3].map((dot) => (
                <Animated.View
                  key={dot}
                  style={styles.loadingDot}
                  entering={FadeIn.delay(1200 + dot * 100).duration(400)}
                />
              ))}
            </Animated.View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  };

  if (isLoading) {
    return <CourseContentLoader />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{topicName}</Text>
            <Text style={styles.subtitle}>
              Course Content {isBackendData ? "🌐" : "📱"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{courseContent.title}</Text>
          <Text style={styles.courseDescription}>
            {courseContent.description}
          </Text>
          <View style={styles.courseStats}>
            <View style={styles.courseStat}>
              <Text style={styles.courseStatValue}>
                {courseContent.modules?.length || 0}
              </Text>
              <Text style={styles.courseStatLabel}>Modules</Text>
            </View>
            <View style={styles.courseStat}>
              <Text style={styles.courseStatValue}>
                {courseContent.estimatedDuration || 0}m
              </Text>
              <Text style={styles.courseStatLabel}>Duration</Text>
            </View>
            <View style={styles.courseStat}>
              <Text style={styles.courseStatValue}>
                {courseContent.analytics?.completionRate || 0}%
              </Text>
              <Text style={styles.courseStatLabel}>Completion</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleNotesPress}
          >
            <Ionicons
              name="document-text"
              size={24}
              color={theme.colors.success}
              style={styles.quickActionIcon}
            />
            <Text style={styles.quickActionText}>My Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleResourcesPress}
          >
            <Ionicons
              name="library"
              size={24}
              color={theme.colors.warning}
              style={styles.quickActionIcon}
            />
            <Text style={styles.quickActionText}>Resources</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleBookmarksPress}
          >
            <Ionicons
              name="bookmark"
              size={24}
              color={theme.colors.primary}
              style={styles.quickActionIcon}
            />
            <Text style={styles.quickActionText}>Bookmarks</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scrollContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Course Modules</Text>
          </View>

          {courseContent.modules?.length > 0 ? (
            <FlatList
              data={courseContent.modules}
              renderItem={renderModuleCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="construct"
                size={64}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>
                {/* FIX: Better empty state messaging */}
                {isLoading 
                  ? "Loading Course..." 
                  : isBackendData 
                  ? "Course Ready - No Modules Yet" 
                  : "Course Coming Soon"
                }
              </Text>
              <Text style={styles.emptySubtitle}>
                {error
                  ? `Error: ${error}`
                  : isLoading
                  ? "Please wait while we fetch the course content..."
                  : isBackendData
                  ? `Course "${courseContent.title}" is available but modules are being prepared. Check back soon!`
                  : `Course content for ${topicName} is being prepared and will be available soon.`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
