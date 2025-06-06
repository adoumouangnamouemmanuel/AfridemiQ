import { AdaptiveLearning } from "./AfricaExamPrepDataStructure";

const adaptiveLearning: AdaptiveLearning = {
  id: "adaptive-001",
  userId: "user-001",
  currentLevel: "intermediate",
  series: "Bac_D",
  adjustmentRules: [
    {
      metric: "score",
      threshold: 80,
      action: "increaseDifficulty",
    },
    {
      metric: "accuracy",
      threshold: 50,
      action: "suggestResource",
      resourceId: "resource-001",
    },
  ],
  recommendedContent: [
    { type: "topic", id: "topic-001" },
    { type: "quiz", id: "quiz-001" },
  ],
};

export { adaptiveLearning };