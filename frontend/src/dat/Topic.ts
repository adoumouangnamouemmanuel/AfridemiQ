import { Topic } from "./AfricaExamPrepDataStructure";

const topics: Topic[] = [
  {
    id: "topic-001",
    name: "Limits",
    subjectId: "subject-001",
    series: "Bac_D",
    description: "Understanding limits of functions in calculus.",
    difficulty: "Medium",
    estimatedTime: 120,
    estimatedCompletionDate: "2025-06-15T00:00:00Z",
    relatedTopics: ["topic-002"],
    hasPractice: true,
    hasNote: true,
    hasStudyMaterial: true,
    prerequisites: [],
    learningObjectives: ["Define limits", "Apply limit theorems"],
    estimatedTimeToMaster: 180,
    resourceIds: ["resource-001"],
    assessmentCriteria: {
      minimumScore: 70,
      requiredPracticeQuestions: 10,
      masteryThreshold: 80,
    },
  },
  {
    id: "topic-002",
    name: "Dissertation",
    subjectId: "subject-002",
    series: "Bac_D",
    description: "Writing structured essays in French literature.",
    difficulty: "Hard",
    estimatedTime: 150,
    estimatedCompletionDate: "2025-06-20T00:00:00Z",
    relatedTopics: ["topic-001"],
    hasPractice: true,
    hasNote: true,
    hasStudyMaterial: true,
    prerequisites: [],
    learningObjectives: ["Structure a dissertation", "Analyze literary texts"],
    estimatedTimeToMaster: 200,
    resourceIds: ["resource-002"],
    assessmentCriteria: {
      minimumScore: 65,
      requiredPracticeQuestions: 5,
      masteryThreshold: 75,
    },
  },
];

export { topics };