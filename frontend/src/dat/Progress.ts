import { Progress } from "./AfricaExamPrepDataStructure";

const progress: Progress = {
  selectedExam: "exam-001",
  selectedSeries: "Bac_D",
  selectedLevel: "Terminale",
  xp: 1500,
  level: 3,
  streak: { current: 5, longest: 7, lastStudyDate: "2025-06-01T00:00:00Z" },
  goalDate: "2025-07-15T00:00:00Z",
  totalQuizzes: 10,
  averageScore: 75,
  completedTopics: ["topic-001"],
  weakSubjects: ["subject-002"],
  badges: ["badge-001"],
  achievements: ["achievement-001"],
  progressSummary: { completedPercentage: 20, remainingTopics: 8 },
};

export { progress };