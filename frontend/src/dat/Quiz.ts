import { Quiz } from "./AfricaExamPrepDataStructure";

const quizzes: Quiz[] = [
  {
    id: "quiz-001",
    title: "Limits Quiz",
    subjectId: "subject-001",
    series: "Bac_D",
    topicIds: ["topic-001"],
    questionIds: ["question-001"],
    totalQuestions: 5,
    totalPoints: 50,
    createdAt: "2025-01-01T00:00:00Z",
    createdBy: "admin-001",
    level: "Terminale",
    timeLimit: 30,
    retakePolicy: { maxAttempts: 3, cooldownMinutes: 1440 },
    resultIds: ["result-001"],
    offlineAvailable: true,
    premiumOnly: false,
  },
  {
    id: "quiz-002",
    title: "Dissertation Quiz",
    subjectId: "subject-002",
    series: "Bac_D",
    topicIds: ["topic-002"],
    questionIds: ["question-002"],
    totalQuestions: 3,
    totalPoints: 30,
    createdAt: "2025-01-01T00:00:00Z",
    createdBy: "admin-001",
    level: "Terminale",
    timeLimit: 60,
    retakePolicy: { maxAttempts: 2, cooldownMinutes: 1440 },
    resultIds: ["result-002"],
    offlineAvailable: true,
    premiumOnly: false,
  },
];

export { quizzes };