import { TopicProgress } from "./AfricaExamPrepDataStructure";

const topicProgress: TopicProgress = {
  id: "progress-001",
  topicId: "topic-001",
  userId: "user-001",
  series: "Bac_D",
  masteryLevel: "intermediate",
  timeSpent: 120,
  lastStudied: "2025-06-01T00:00:00Z",
  practiceSessions: [{ date: "2025-06-01", score: 80, timeSpent: 60 }],
  weakAreas: ["L’Hôpital’s rule"],
  strongAreas: ["Basic limit evaluation"],
};

export { topicProgress };