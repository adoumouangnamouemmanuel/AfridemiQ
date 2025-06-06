import { Assessment } from "./AfricaExamPrepDataStructure";

const assessments: Assessment[] = [
  {
    id: "assessment-001",
    type: "quiz",
    title: "Limits Quiz",
    description: "Test limits knowledge",
    questionIds: ["question-001"],
    passingScore: 70,
    timeLimit: 30,
    attempts: 3,
    feedback: { immediate: true, detailed: true, solutions: true },
    premiumOnly: false,
  },
  {
    id: "assessment-002",
    type: "quiz",
    title: "Dissertation Quiz",
    description: "Test dissertation skills",
    questionIds: ["question-002"],
    passingScore: 65,
    timeLimit: 60,
    attempts: 2,
    feedback: { immediate: true, detailed: true, solutions: true },
    premiumOnly: false,
  },
];

export { assessments };