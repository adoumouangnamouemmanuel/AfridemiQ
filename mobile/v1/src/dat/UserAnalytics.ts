import {
  UserAnalytics,
} from "./AfricaExamPrepDataStructure";

const userAnalytics: UserAnalytics = {
  id: "analytics-001",
  userId: "user-001",
  lastUpdated: "2025-06-02T00:00:00Z",
  dailyStats: [
    {
      date: "2025-06-01",
      studyTime: 90,
      questionsAnswered: 20,
      correctAnswers: 15,
      topicsCovered: ["topic-001"],
    },
  ],
  subjectStats: [
    {
      subjectId: "subject-001",
      series: "Bac_D",
      averageScore: 80,
      timeSpent: 120,
      lastStudied: "2025-06-01T00:00:00Z",
    },
    {
      subjectId: "subject-002",
      series: "Bac_D",
      averageScore: 70,
      timeSpent: 60,
      lastStudied: "2025-05-30T00:00:00Z",
    },
  ],
  learningPatterns: {
    preferredStudyTime: "evening",
    mostProductiveDays: ["Monday", "Thursday"],
    averageSessionLength: 45,
  },
  mastery: [
    {
      subjectId: "subject-001",
      series: "Bac_D",
      masteryLevel: 60,
      lastAssessmentDate: "2025-06-01T00:00:00Z",
      improvementRate: 5,
    },
    {
      subjectId: "subject-002",
      series: "Bac_D",
      masteryLevel: 50,
      lastAssessmentDate: "2025-05-30T00:00:00Z",
      improvementRate: 3,
    },
  ],
  efficiency: {
    averageResponseTime: 30,
    accuracyRate: 75,
    timeSpentPerTopic: 60,
  },
  personalizedRecommendations: {
    weakTopics: ["topic-002"],
    suggestedStudyPath: ["topic-001", "topic-002"],
    nextMilestone: "Complete Limits practice",
  },
};

export { userAnalytics };