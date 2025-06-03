import { GamifiedProgress } from "./AfricaExamPrepDataStructure";

const gamifiedProgress: GamifiedProgress = {
  id: "gamified-001",
  userId: "user-001",
  subjectId: "subject-001",
  series: "Bac_D",
  milestones: [
    {
      id: "milestone-001",
      description: "Complete 10 Math problems",
      targetValue: 10,
      currentValue: 6,
      achieved: false,
      reward: { type: "badge", value: "Math Starter" },
    },
  ],
};

export { gamifiedProgress };