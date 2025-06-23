import { Mission } from "./AfricaExamPrepDataStructure";

const mission: Mission = {
  id: "mission-001",
  title: "Master Limits",
  description: "Complete 10 limit problems with 80% accuracy.",
  type: "weekly",
  progress: 6,
  target: 10,
  reward: "50 XP",
  icon: "https://example.com/icons/mission_limits.png",
  completed: false,
  expiresAt: "2025-06-08T23:59:59Z",
  subjectId: "subject-001",
  series: "Bac_D",
};

export { mission };