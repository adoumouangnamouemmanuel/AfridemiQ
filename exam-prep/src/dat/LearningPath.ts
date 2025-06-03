import { LearningPath } from "./AfricaExamPrepDataStructure";

const learningPath: LearningPath = {
  id: "path-001",
  name: "Bac D Math Path",
  description: "Structured path for Bac D Mathematics preparation.",
  targetExam: "exam-001",
  targetSeries: "Bac_D",
  duration: 24,
  levels: [
    {
      level: 1,
      name: "Foundations",
      description: "Master core calculus concepts.",
      modules: ["module-001"],
      prerequisites: [],
      expectedOutcomes: ["Solve limit problems"],
    },
  ],
  milestones: [
    {
      id: "milestone-001",
      name: "Limits Mastery",
      description: "Complete Limits module.",
      requiredAchievements: ["achievement-001"],
      reward: { type: "certificate", value: "Limits Certificate" },
    },
  ],
  adaptiveLearning: {
    difficultyAdjustment: true,
    personalizedPacing: true,
    remediationPaths: [
      {
        topicId: "topic-001",
        alternativeResources: ["resource-001"],
        practiceExercises: ["exercise-001"],
      },
    ],
  },
};

export { learningPath };