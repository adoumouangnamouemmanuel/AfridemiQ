import { Dashboard } from "./AfricaExamPrepDataStructure";

const dashboard: Dashboard = {
  id: "dashboard-001",
  userId: "user-001",
  upcomingExams: [
    { examId: "exam-001", series: "Bac_D", date: "2025-07-15T00:00:00Z" },
  ],
  recentQuizzes: [
    { quizId: "quiz-001", score: 80, completedAt: "2025-06-01T00:00:00Z" },
    { quizId: "quiz-002", score: 65, completedAt: "2025-05-30T00:00:00Z" },
  ],
  recommendedTopics: ["topic-002"],
  streak: 5,
  notifications: ["notification-001"],
};

export { dashboard };