import { CourseContent } from "./AfricaExamPrepDataStructure";

const courses: CourseContent[] = [
  {
    id: "course-001",
    subjectId: "subject-001",
    series: "Bac_D",
    title: "Bac D Mathematics",
    description: "Comprehensive course for Bac Series D Math.",
    level: "advanced",
    modules: [
      {
        id: "module-001",
        title: "Calculus",
        description: "Covers limits, derivatives, and integrals",
        order: 1,
        lessons: [],
        exerciseIds: ["exercise-001"],
        assessment: {
          id: "assessment-001",
          type: "quiz",
          title: "Limits Quiz",
          description: "Test limits knowledge",
          questionIds: ["question-001"],
          passingScore: 70,
          attempts: 3,
          feedback: { immediate: true, detailed: true, solutions: true },
          premiumOnly: false,
        },
        progressTracking: { completedLessons: 1, totalLessons: 2 },
      },
    ],
    prerequisites: [],
    estimatedDuration: 40,
    progressTracking: { completedLessons: 1, totalLessons: 10 },
    accessibilityOptions: {
      languages: ["French"],
      formats: ["text"],
      accommodations: ["large print"],
    },
    premiumOnly: false,
    metadata: {
      createdBy: "admin-001",
      createdAt: "2025-01-01T00:00:00Z",
      tags: ["math", "bac_d"],
    },
  },
  {
    id: "course-002",
    subjectId: "subject-002",
    series: "Bac_D",
    title: "Bac D French",
    description: "Comprehensive course for Bac Series D French.",
    level: "advanced",
    modules: [
      {
        id: "module-002",
        title: "Literature",
        description: "Covers essay writing and analysis",
        order: 1,
        lessons: [],
        exerciseIds: ["exercise-002"],
        assessment: {
          id: "assessment-002",
          type: "quiz",
          title: "Dissertation Quiz",
          description: "Test dissertation skills",
          questionIds: ["question-002"],
          passingScore: 65,
          attempts: 2,
          feedback: { immediate: true, detailed: true, solutions: true },
          premiumOnly: false,
        },
        progressTracking: { completedLessons: 0, totalLessons: 2 },
      },
    ],
    prerequisites: [],
    estimatedDuration: 30,
    progressTracking: { completedLessons: 0, totalLessons: 8 },
    accessibilityOptions: {
      languages: ["French"],
      formats: ["text"],
      accommodations: ["large print"],
    },
    premiumOnly: false,
    metadata: {
      createdBy: "admin-001",
      createdAt: "2025-01-01T00:00:00Z",
      tags: ["french", "bac_d"],
    },
  },
];

export { courses };