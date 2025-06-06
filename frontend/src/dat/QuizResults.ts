import { QuizResult } from "./AfricaExamPrepDataStructure";

const quizResults: QuizResult[] = [
  {
    id: "result-001",
    userId: "user-001",
    quizId: "quiz-001",
    questionIds: ["question-001"],
    correctCount: 4,
    score: 80,
    timeTaken: 1200,
    completedAt: "2025-06-01T00:00:00Z",
    hintUsages: ["hint-001"],
    questionFeedback: [],
    feedback: {
      title: "Great Job!",
      subtitle: "Solid understanding of limits",
      color: "#28a745",
      emoji: "🎉",
      message: "You’re on track for Bac D Math!",
    },
  },
  {
    id: "result-002",
    userId: "user-001",
    quizId: "quiz-002",
    questionIds: ["question-002"],
    correctCount: 2,
    score: 65,
    timeTaken: 1800,
    completedAt: "2025-05-30T00:00:00Z",
    hintUsages: [],
    questionFeedback: [
      {
        questionId: "question-002",
        comment: "Unclear prompt",
        reportedAt: "2025-05-30T00:00:00Z",
      },
    ],
    feedback: {
      title: "Keep Practicing",
      subtitle: "Work on dissertation structure",
      color: "#ffc107",
      emoji: "📝",
      message: "Focus on thesis clarity for French.",
    },
  },
];

export { quizResults };