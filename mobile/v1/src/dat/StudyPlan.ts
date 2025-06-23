import { StudyPlan } from "./AfricaExamPrepDataStructure";

const studyPlan: StudyPlan = {
  id: "plan-001",
  userId: "user-001",
  targetExam: "exam-001",
  targetSeries: "Bac_D",
  startDate: "2025-01-01T00:00:00Z",
  endDate: "2025-07-15T00:00:00Z",
  dailyGoals: [
    {
      day: "Monday",
      topics: [
        { topicId: "topic-001", duration: 60, priority: "high" },
        { topicId: "topic-002", duration: 45, priority: "medium" },
      ],
      exercises: [{ exerciseId: "exercise-001", count: 5, type: "practice" }],
      breaks: [{ startTime: "18:30", endTime: "18:45", duration: 15 }],
    },
  ],
  weeklyReview: {
    day: "Sunday",
    topics: ["topic-001", "topic-002"],
    assessmentType: "quiz",
  },
  progressTracking: {
    completedTopics: ["topic-001"],
    weakAreas: ["dissertation structure"],
    strongAreas: ["limit evaluation"],
    adjustmentNeeded: false,
  },
  reminders: [
    {
      type: "study",
      time: "18:00",
      message: "Time to study Limits!",
      repeat: "daily",
    },
  ],
};

export { studyPlan };