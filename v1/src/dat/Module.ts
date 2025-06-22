import { Module } from "./AfricaExamPrepDataStructure";

const modules: Module[] = [
  {
    id: "module-001",
    title: "Calculus",
    description: "Covers limits, derivatives, and integrals",
    order: 1,
    series: "Bac_D",
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
  {
    id: "module-002",
    title: "Literature",
    description: "Covers essay writing and analysis",
    order: 1,
    series: "Bac_D",
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
];

export { modules };