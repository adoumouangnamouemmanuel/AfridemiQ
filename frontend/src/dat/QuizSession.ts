import { QuizSession } from "./AfricaExamPrepDataStructure";

const quizSession: QuizSession = {
  id: "session-001",
  userId: "user-001",
  quizId: "quiz-001",
  startTime: "2025-06-01T10:00:00Z",
  lastActive: "2025-06-01T10:20:00Z",
  answers: [{ questionId: "question-001", selectedAnswer: "4", timeSpent: 30 }],
  status: "completed",
  deviceInfo: {
    platform: "web",
    version: "1.0",
    lastSync: "2025-06-01T10:20:00Z",
  },
};

export { quizSession };